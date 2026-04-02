import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  canEscalateTransactionCase,
  canResolveTransactionCase,
  canStartTransactionCaseReview,
  deriveTransactionRules,
} from '@treasuryos/compliance-rules';
import { isValidSolanaAddress } from '@treasuryos/sdk';
import {
  EntityStatus,
  Jurisdiction,
  KycStatus,
  TransactionCaseStatus,
  WalletStatus,
  type AuthenticatedUser,
  type EntityRecord,
  type ReviewedTransaction,
  type WalletRecord,
} from '@treasuryos/types';
import { z } from 'zod';

import { createResourceId } from '../../common/ids.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { EntitiesRepository } from '../entities/entities.repository.js';
import { WalletsRepository } from '../wallets/wallets.repository.js';
import { TransactionCasesRepository } from './transaction-cases.repository.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
import { ScreenTransactionDto } from './dto/screen-transaction.dto.js';
import { DecisionTransitionDto } from './dto/decision-transition.dto.js';
import { ListCasesQueryDto } from './dto/list-cases-query.dto.js';
import { ReviewTransitionDto } from './dto/review-transition.dto.js';

const screenTransactionSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000_000),
  asset: z.string().min(2).max(24).default('USDC'),
  destinationWallet: z.string().min(32).max(64),
  entityId: z.string().min(1),
  jurisdiction: z.nativeEnum(Jurisdiction).optional(),
  manualReviewRequested: z.boolean().default(false),
  notes: z.string().max(4000).optional(),
  referenceId: z.string().trim().min(3).max(120).optional(),
  sourceWallet: z.string().min(32).max(64),
  walletId: z.string().min(1).optional(),
});

const listCasesQuerySchema = z.object({
  entityId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(250).default(50),
  status: z.nativeEnum(TransactionCaseStatus).optional(),
});

const reviewTransitionSchema = z.object({
  evidenceRef: z.string().trim().max(500).optional(),
  notes: z.string().max(4000).optional(),
});

const decisionTransitionSchema = z.object({
  evidenceRef: z.string().trim().max(500).optional(),
  notes: z.string().trim().min(3).max(4000),
});

function formatAmount(amount: number) {
  return amount.toFixed(2);
}

function mergeNotes(existing?: string, next?: string) {
  if (!next) {
    return existing;
  }

  if (!existing || existing === next) {
    return next;
  }

  return `${existing}\n\n${next}`;
}

@Injectable()
export class TransactionCasesService {
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(TransactionCasesRepository)
    private readonly transactionCasesRepository: TransactionCasesRepository,
    @Inject(EntitiesRepository)
    private readonly entitiesRepository: EntitiesRepository,
    @Inject(WalletsRepository)
    private readonly walletsRepository: WalletsRepository,
    @Inject(DatabaseService)
    private readonly database: DatabaseService,
    @Inject(AuditService)
    private readonly auditService: AuditService,
    @Inject(RedisQueueService)
    private readonly queueService: RedisQueueService,
  ) {}

  async listCases(query: ListCasesQueryDto) {
    const filters = listCasesQuerySchema.parse(query);
    return this.transactionCasesRepository.listCases({
      entityId: filters.entityId,
      status: filters.status,
      limit: filters.limit
    });
  }

  async getCase(caseId: string) {
    return this.requireCase(caseId);
  }

  async screenTransaction(input: ScreenTransactionDto, actor: AuthenticatedUser) {
    const parsedInput = screenTransactionSchema.parse(input);

    this.ensureValidAddress(parsedInput.sourceWallet, 'sourceWallet');
    this.ensureValidAddress(parsedInput.destinationWallet, 'destinationWallet');

    if (parsedInput.sourceWallet === parsedInput.destinationWallet) {
      throw new BadRequestException('Source and destination wallets must be different');
    }

    const entity = await this.requireEntity(parsedInput.entityId);

    if (entity.status !== EntityStatus.Approved || entity.kycStatus !== KycStatus.Approved) {
      throw new ConflictException('Transaction screening requires an approved entity with approved KYC');
    }

    const wallet = await this.resolveWalletForScreening(
      entity.id,
      parsedInput.walletId,
      parsedInput.sourceWallet,
      parsedInput.destinationWallet,
    );
    const transactionReference = parsedInput.referenceId ?? createResourceId('txref');
    const amount = formatAmount(parsedInput.amount);
    const jurisdiction = parsedInput.jurisdiction ?? entity.jurisdiction;

    if (jurisdiction !== Jurisdiction.EU) {
      throw new BadRequestException('Phase 0 only supports EU transaction review');
    }

    const existingReference = await this.transactionCasesRepository.findByReferenceAndEntityId(
      transactionReference,
      entity.id
    );

    if (existingReference) {
      throw new ConflictException(`Transaction reference ${transactionReference} already exists`);
    }

    const triggeredRules = deriveTransactionRules({
      amount,
      manualReviewRequested: parsedInput.manualReviewRequested,
      riskLevel: entity.riskLevel,
    });

    if (triggeredRules.length === 0) {
      await this.auditService.record({
        action: 'transaction.screened.clear',
        actor,
        resourceType: 'transaction_screening',
        resourceId: transactionReference,
        summary: `Transaction ${transactionReference} cleared pilot screening`,
        metadata: {
          entityId: entity.id,
          walletId: wallet.id,
        },
      });
      await this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:cases`, {
        entityId: entity.id,
        transactionReference,
        type: 'transaction.screened.clear',
        walletId: wallet.id,
      });

      return {
        caseOpened: false,
        entityId: entity.id,
        riskLevel: entity.riskLevel,
        screeningDecision: 'cleared',
        transactionReference,
        triggeredRules,
        walletId: wallet.id,
      };
    }

    const now = new Date().toISOString();
    const transactionCase: ReviewedTransaction = {
      id: createResourceId('case'),
      entityId: entity.id,
      walletId: wallet.id,
      transactionReference,
      caseStatus: TransactionCaseStatus.Open,
      amount,
      asset: parsedInput.asset.toUpperCase(),
      sourceWallet: parsedInput.sourceWallet,
      destinationWallet: parsedInput.destinationWallet,
      jurisdiction,
      riskLevel: entity.riskLevel,
      triggeredRules,
      manualReviewRequested: parsedInput.manualReviewRequested,
      notes: parsedInput.notes,
      createdBy: actor.id,
      createdAt: now,
      updatedAt: now,
    };

    await this.database.withTransaction(async (client) => {
      const duplicate = await this.transactionCasesRepository.findByReferenceAndEntityId(
        transactionCase.transactionReference,
        entity.id,
        client
      );

      if (duplicate) {
        throw new ConflictException(
          `Transaction reference ${transactionCase.transactionReference} already exists`,
        );
      }

      await this.transactionCasesRepository.save(transactionCase, client);
    });

    await this.auditService.record({
      action: 'transaction_case.opened',
      actor,
      resourceType: 'transaction_case',
      resourceId: transactionCase.id,
      summary: `Transaction case ${transactionCase.transactionReference} opened for review`,
      metadata: {
        entityId: entity.id,
        triggeredRules,
        walletId: wallet.id,
      },
    });
    await this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:cases`, {
      caseId: transactionCase.id,
      entityId: entity.id,
      triggeredRules,
      type: 'transaction_case.opened',
      walletId: wallet.id,
    });

    return {
      case: transactionCase,
      caseOpened: true,
      screeningDecision: 'review_required',
      triggeredRules,
    };
  }

  async markUnderReview(caseId: string, input: ReviewTransitionDto, actor: AuthenticatedUser) {
    const decision = reviewTransitionSchema.parse(input);

    const updatedCase = await this.database.withTransaction(async (client) => {
      const record = await this.requireCaseFromStore(caseId, client);

      if (!canStartTransactionCaseReview(record.caseStatus)) {
        throw new ConflictException('Transaction case cannot move into review from its current state');
      }

      const reviewedAt = new Date().toISOString();
      record.caseStatus = TransactionCaseStatus.UnderReview;
      record.reviewedBy = actor.id;
      record.reviewedAt = reviewedAt;
      record.reviewNotes = mergeNotes(record.reviewNotes, decision.notes);
      record.evidenceRef = decision.evidenceRef ?? record.evidenceRef;
      record.updatedAt = reviewedAt;
      await this.transactionCasesRepository.save(record, client);
      return record;
    });

    await this.auditService.record({
      action: 'transaction_case.review.started',
      actor,
      resourceType: 'transaction_case',
      resourceId: updatedCase.id,
      summary: `Transaction case ${updatedCase.transactionReference} moved into review`,
    });

    return updatedCase;
  }

  async approveCase(caseId: string, input: DecisionTransitionDto, actor: AuthenticatedUser) {
    const updatedCase = await this.applyDecision(
      caseId,
      input,
      actor,
      TransactionCaseStatus.Approved,
      'transaction_case.approved',
      'approved',
    );

    await this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:cases`, {
      caseId: updatedCase.id,
      entityId: updatedCase.entityId,
      status: updatedCase.caseStatus,
      type: 'transaction_case.approved',
      walletId: updatedCase.walletId ?? null,
    });

    return updatedCase;
  }

  async rejectCase(caseId: string, input: DecisionTransitionDto, actor: AuthenticatedUser) {
    const updatedCase = await this.applyDecision(
      caseId,
      input,
      actor,
      TransactionCaseStatus.Rejected,
      'transaction_case.rejected',
      'rejected',
    );

    await this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:cases`, {
      caseId: updatedCase.id,
      entityId: updatedCase.entityId,
      status: updatedCase.caseStatus,
      type: 'transaction_case.rejected',
      walletId: updatedCase.walletId ?? null,
    });

    return updatedCase;
  }

  async escalateCase(caseId: string, input: DecisionTransitionDto, actor: AuthenticatedUser) {
    const decision = decisionTransitionSchema.parse(input);

    const updatedCase = await this.database.withTransaction(async (client) => {
      const record = await this.requireCaseFromStore(caseId, client);

      if (!canEscalateTransactionCase(record.caseStatus)) {
        throw new ConflictException('Transaction case cannot be escalated from its current state');
      }

      const reviewedAt = new Date().toISOString();
      record.caseStatus = TransactionCaseStatus.Escalated;
      record.reviewedBy = actor.id;
      record.reviewedAt = reviewedAt;
      record.reviewNotes = mergeNotes(record.reviewNotes, decision.notes);
      record.evidenceRef = decision.evidenceRef ?? record.evidenceRef;
      record.resolutionReason = 'escalated';
      record.updatedAt = reviewedAt;
      await this.transactionCasesRepository.save(record, client);
      return record;
    });

    await this.auditService.record({
      action: 'transaction_case.escalated',
      actor,
      resourceType: 'transaction_case',
      resourceId: updatedCase.id,
      summary: `Transaction case ${updatedCase.transactionReference} was escalated`,
      metadata: {
        evidenceRef: updatedCase.evidenceRef ?? null,
      },
    });
    await this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:cases`, {
      caseId: updatedCase.id,
      entityId: updatedCase.entityId,
      status: updatedCase.caseStatus,
      type: 'transaction_case.escalated',
      walletId: updatedCase.walletId ?? null,
    });

    return updatedCase;
  }

  private async applyDecision(
    caseId: string,
    input: DecisionTransitionDto,
    actor: AuthenticatedUser,
    status: TransactionCaseStatus.Approved | TransactionCaseStatus.Rejected,
    action: string,
    resolutionReason: 'approved' | 'rejected',
  ) {
    const decision = decisionTransitionSchema.parse(input);

    const updatedCase = await this.database.withTransaction(async (client) => {
      const record = await this.requireCaseFromStore(caseId, client);

      if (!canResolveTransactionCase(record.caseStatus)) {
        throw new ConflictException('Transaction case cannot be resolved from its current state');
      }

      const reviewedAt = new Date().toISOString();
      record.caseStatus = status;
      record.reviewedBy = actor.id;
      record.reviewedAt = reviewedAt;
      record.reviewNotes = mergeNotes(record.reviewNotes, decision.notes);
      record.evidenceRef = decision.evidenceRef ?? record.evidenceRef;
      record.resolutionReason = resolutionReason;
      record.updatedAt = reviewedAt;
      await this.transactionCasesRepository.save(record, client);
      return record;
    });

    await this.auditService.record({
      action,
      actor,
      resourceType: 'transaction_case',
      resourceId: updatedCase.id,
      summary: `Transaction case ${updatedCase.transactionReference} was ${resolutionReason}`,
      metadata: {
        evidenceRef: updatedCase.evidenceRef ?? null,
      },
    });

    return updatedCase;
  }

  private ensureValidAddress(value: string, field: 'sourceWallet' | 'destinationWallet') {
    if (!isValidSolanaAddress(value)) {
      throw new BadRequestException(`${field} must be a valid Solana address`);
    }
  }

  private async resolveWalletForScreening(
    entityId: string,
    walletId: string | undefined,
    sourceWallet: string,
    destinationWallet: string,
  ) {
    const wallets = await this.walletsRepository.findByEntityId(entityId);

    if (walletId) {
      const wallet = wallets.find((record) => record.id === walletId);

      if (!wallet) {
        throw new NotFoundException(`Wallet ${walletId} not found`);
      }

      this.ensureWalletReady(wallet);

      if (wallet.walletAddress !== sourceWallet && wallet.walletAddress !== destinationWallet) {
        throw new BadRequestException('Referenced wallet must match one side of the transaction');
      }

      return wallet;
    }

    const matchedWallet = wallets.find(
      (record) => record.walletAddress === sourceWallet || record.walletAddress === destinationWallet,
    );

    if (!matchedWallet) {
      throw new ConflictException('Transaction screening requires an approved or synced entity wallet');
    }

    this.ensureWalletReady(matchedWallet);

    return matchedWallet;
  }

  private ensureWalletReady(wallet: WalletRecord) {
    if (wallet.status !== WalletStatus.Approved && wallet.status !== WalletStatus.Synced) {
      if (wallet.status === WalletStatus.ProposalPending) {
        throw new ConflictException(
          'Transaction screening requires an approved or synced entity wallet. This wallet is still waiting for multisig proposal execution.',
        );
      }

      throw new ConflictException('Transaction screening requires an approved or synced entity wallet');
    }
  }

  private async requireEntity(entityId: string) {
    const entity = await this.entitiesRepository.findById(entityId);

    if (!entity) {
      throw new NotFoundException(`Entity ${entityId} not found`);
    }

    return entity;
  }

  private async requireCase(caseId: string) {
    const transactionCase = await this.transactionCasesRepository.findById(caseId);

    if (!transactionCase) {
      throw new NotFoundException(`Transaction case ${caseId} not found`);
    }

    return transactionCase;
  }

  private async requireCaseFromStore(caseId: string, client: any) {
    const transactionCase = await this.transactionCasesRepository.findById(caseId, client);

    if (!transactionCase) {
      throw new NotFoundException(`Transaction case ${caseId} not found`);
    }

    return transactionCase;
  }
}
