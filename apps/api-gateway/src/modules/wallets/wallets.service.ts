import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  canApproveWallet,
  canRequestWallet,
  canReviewWallet,
} from '@treasuryos/compliance-rules';
import {
  ChainSyncStatus,
  EntityStatus,
  KycStatus,
  WalletStatus,
  type AuthenticatedUser,
  type EntityRecord,
  type WalletRecord,
} from '@treasuryos/types';
import { z } from 'zod';

import { createResourceId } from '../../common/ids.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { EntitiesRepository } from '../entities/entities.repository.js';
import { WalletsRepository } from './wallets.repository.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
import { WalletSyncService } from './wallet-sync.service.js';
import { RequestWalletDto } from './dto/request-wallet.dto.js';
import { WalletDecisionDto } from './dto/wallet-decision.dto.js';

const requestWalletSchema = z.object({
  entityId: z.string().min(1),
  label: z.string().max(120).optional(),
  walletAddress: z.string().min(32).max(64),
});

const reviewSchema = z.object({
  notes: z.string().max(4000).optional(),
});

const listWalletsQuerySchema = z.object({
  entityId: z.string().optional(),
});

@Injectable()
export class WalletsService {
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(WalletsRepository)
    private readonly walletsRepository: WalletsRepository,
    @Inject(EntitiesRepository)
    private readonly entitiesRepository: EntitiesRepository,
    @Inject(DatabaseService)
    private readonly database: DatabaseService,
    @Inject(AuditService)
    private readonly auditService: AuditService,
    @Inject(RedisQueueService)
    private readonly queueService: RedisQueueService,
    @Inject(WalletSyncService)
    private readonly walletSyncService: WalletSyncService,
  ) {}

  async listWallets(query: unknown) {
    const filters = listWalletsQuerySchema.parse(query);
    return this.walletsRepository.listAll(filters.entityId);
  }

  async getWallet(walletId: string) {
    return this.requireWallet(walletId);
  }

  async requestWallet(input: RequestWalletDto, actor: AuthenticatedUser) {
    const parsedInput = requestWalletSchema.parse(input);
    const entity = await this.requireEntity(parsedInput.entityId);

    if (!canRequestWallet(entity.status) || entity.kycStatus !== KycStatus.Approved) {
      throw new ConflictException('Wallet requests require an approved entity with approved KYC');
    }

    const preview = this.createPreview(parsedInput.walletAddress);
    const now = new Date().toISOString();
    const wallet: WalletRecord = {
      id: createResourceId('wallet'),
      entityId: entity.id,
      walletAddress: parsedInput.walletAddress,
      label: parsedInput.label,
      status: WalletStatus.Submitted,
      chainSyncStatus: ChainSyncStatus.Pending,
      whitelistEntry: preview.whitelistEntry,
      requestedBy: actor.id,
      createdAt: now,
      updatedAt: now,
    };

    await this.database.withTransaction(async (client) => {
      const walletExists = await this.walletsRepository.existsForEntity(
        parsedInput.entityId,
        parsedInput.walletAddress,
        [WalletStatus.Rejected]
      );

      if (walletExists) {
        throw new ConflictException('Wallet already exists for this entity');
      }

      await this.walletsRepository.save(wallet, client);
      
      const entityRecord = await this.requireEntityFromStore(entity.id, client);
      entityRecord.lastUpdatedAt = now;
      await this.entitiesRepository.save(entityRecord, client);
    });

    await this.auditService.record({
      action: 'wallet.requested',
      actor,
      resourceType: 'wallet',
      resourceId: wallet.id,
      summary: `Wallet request ${wallet.walletAddress} was created`,
      metadata: {
        entityId: wallet.entityId,
        whitelistEntry: wallet.whitelistEntry,
      },
    });
    void this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:wallets`, {
      type: 'wallet.requested',
      walletId: wallet.id,
      entityId: wallet.entityId,
    });

    return wallet;
  }

  async markUnderReview(walletId: string, input: WalletDecisionDto, actor: AuthenticatedUser) {
    const decision = reviewSchema.parse(input);

    const wallet = await this.database.withTransaction(async (client) => {
      const record = await this.requireWalletFromStore(walletId, client);

      if (!canReviewWallet(record.status)) {
        throw new ConflictException('Wallet cannot move into review from its current state');
      }

      record.status = WalletStatus.UnderReview;
      record.reviewedBy = actor.id;
      record.reviewedAt = new Date().toISOString();
      record.reviewNotes = decision.notes ?? record.reviewNotes;
      record.updatedAt = record.reviewedAt;
      await this.walletsRepository.save(record, client);
      return record;
    });

    await this.auditService.record({
      action: 'wallet.review.started',
      actor,
      resourceType: 'wallet',
      resourceId: wallet.id,
      summary: `Wallet ${wallet.walletAddress} moved into review`,
    });

    return wallet;
  }

  async approveWallet(walletId: string, input: WalletDecisionDto, actor: AuthenticatedUser) {
    const decision = reviewSchema.parse(input);
    const pendingWallet = await this.requireWallet(walletId);

    if (!canApproveWallet(pendingWallet.status)) {
      throw new ConflictException('Wallet cannot be approved in its current state');
    }

    const entity = await this.requireEntity(pendingWallet.entityId);

    if (entity.status !== EntityStatus.Approved) {
      throw new ConflictException('Wallet approval requires the entity to stay approved');
    }

    const syncResult = await this.walletSyncService.syncApprovedWallet(entity, pendingWallet);
    const reviewedAt = new Date().toISOString();

    const wallet = await this.database.withTransaction(async (client) => {
      const record = await this.requireWalletFromStore(walletId, client);

      record.reviewedBy = actor.id;
      record.reviewedAt = reviewedAt;
      record.reviewNotes = decision.notes ?? record.reviewNotes;
      record.chainSyncAttemptedAt = reviewedAt;
      record.chainSyncStatus = syncResult.chainSyncStatus;
      record.whitelistEntry = syncResult.whitelistEntry;
      record.chainTxSignature = syncResult.signature;
      record.syncError = syncResult.syncError;
      record.updatedAt = reviewedAt;

      if (syncResult.chainSyncStatus === ChainSyncStatus.Sent) {
        record.status = WalletStatus.Synced;
      } else if (syncResult.chainSyncStatus === ChainSyncStatus.Failed) {
        record.status = WalletStatus.SyncFailed;
      } else {
        record.status = WalletStatus.Approved;
      }

      await this.walletsRepository.save(record, client);
      return record;
    });

    await this.auditService.record({
      action: 'wallet.approved',
      actor,
      resourceType: 'wallet',
      resourceId: wallet.id,
      summary: `Wallet ${wallet.walletAddress} was approved`,
      metadata: {
        chainSyncStatus: wallet.chainSyncStatus,
        chainTxSignature: wallet.chainTxSignature ?? null,
        whitelistEntry: wallet.whitelistEntry ?? null,
      },
    });
    void this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:wallets`, {
      type: 'wallet.approved',
      walletId: wallet.id,
      entityId: wallet.entityId,
      chainSyncStatus: wallet.chainSyncStatus,
    });

    return wallet;
  }

  async rejectWallet(walletId: string, input: WalletDecisionDto, actor: AuthenticatedUser) {
    const decision = reviewSchema.parse(input);

    const wallet = await this.database.withTransaction(async (client) => {
      const record = await this.requireWalletFromStore(walletId, client);

      if (!canReviewWallet(record.status)) {
        throw new ConflictException('Wallet cannot be rejected in its current state');
      }

      record.status = WalletStatus.Rejected;
      record.reviewedBy = actor.id;
      record.reviewedAt = new Date().toISOString();
      record.reviewNotes = decision.notes ?? record.reviewNotes;
      record.chainSyncStatus = ChainSyncStatus.Skipped;
      record.updatedAt = record.reviewedAt;
      await this.walletsRepository.save(record, client);
      return record;
    });

    await this.auditService.record({
      action: 'wallet.rejected',
      actor,
      resourceType: 'wallet',
      resourceId: wallet.id,
      summary: `Wallet ${wallet.walletAddress} was rejected`,
    });
    void this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:wallets`, {
      type: 'wallet.rejected',
      walletId: wallet.id,
      entityId: wallet.entityId,
    });

    return wallet;
  }

  private createPreview(walletAddress: string) {
    try {
      return this.walletSyncService.createPreview(this.env.PILOT_INSTITUTION_ID, walletAddress);
    } catch {
      throw new BadRequestException('Wallet address is not a valid Solana public key');
    }
  }

  private async requireEntity(entityId: string) {
    const entity = await this.entitiesRepository.findById(entityId);

    if (!entity) {
      throw new NotFoundException(`Entity ${entityId} not found`);
    }

    return entity;
  }

  private async requireEntityFromStore(entityId: string, client: any) {
    const entity = await this.entitiesRepository.findById(entityId, client);

    if (!entity) {
      throw new NotFoundException(`Entity ${entityId} not found`);
    }

    return entity;
  }

  private async requireWallet(walletId: string) {
    const wallet = await this.walletsRepository.findById(walletId);

    if (!wallet) {
      throw new NotFoundException(`Wallet ${walletId} not found`);
    }

    return wallet;
  }

  private async requireWalletFromStore(walletId: string, client: any) {
    const wallet = await this.walletsRepository.findById(walletId, client);

    if (!wallet) {
      throw new NotFoundException(`Wallet ${walletId} not found`);
    }

    return wallet;
  }
}
