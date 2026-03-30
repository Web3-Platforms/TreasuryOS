var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { canApproveWallet, canRequestWallet, canReviewWallet, } from '@treasuryos/compliance-rules';
import { ChainSyncStatus, EntityStatus, KycStatus, WalletStatus, } from '@treasuryos/types';
import { z } from 'zod';
import { createResourceId } from '../../common/ids.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { EntitiesRepository } from '../entities/entities.repository.js';
import { WalletsRepository } from './wallets.repository.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
import { WalletSyncService } from './wallet-sync.service.js';
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
let WalletsService = class WalletsService {
    walletsRepository;
    entitiesRepository;
    database;
    auditService;
    queueService;
    walletSyncService;
    env = loadApiGatewayEnv();
    constructor(walletsRepository, entitiesRepository, database, auditService, queueService, walletSyncService) {
        this.walletsRepository = walletsRepository;
        this.entitiesRepository = entitiesRepository;
        this.database = database;
        this.auditService = auditService;
        this.queueService = queueService;
        this.walletSyncService = walletSyncService;
    }
    async listWallets(query) {
        const filters = listWalletsQuerySchema.parse(query);
        return this.walletsRepository.listAll(filters.entityId);
    }
    async getWallet(walletId) {
        return this.requireWallet(walletId);
    }
    async requestWallet(input, actor) {
        const parsedInput = requestWalletSchema.parse(input);
        const entity = await this.requireEntity(parsedInput.entityId);
        if (!canRequestWallet(entity.status) || entity.kycStatus !== KycStatus.Approved) {
            throw new ConflictException('Wallet requests require an approved entity with approved KYC');
        }
        const preview = this.createPreview(parsedInput.walletAddress);
        const now = new Date().toISOString();
        const wallet = {
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
            const walletExists = await this.walletsRepository.existsForEntity(parsedInput.entityId, parsedInput.walletAddress, [WalletStatus.Rejected]);
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
    async markUnderReview(walletId, input, actor) {
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
    async approveWallet(walletId, input, actor) {
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
            }
            else if (syncResult.chainSyncStatus === ChainSyncStatus.Failed) {
                record.status = WalletStatus.SyncFailed;
            }
            else {
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
    async rejectWallet(walletId, input, actor) {
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
    createPreview(walletAddress) {
        try {
            return this.walletSyncService.createPreview(this.env.PILOT_INSTITUTION_ID, walletAddress);
        }
        catch {
            throw new BadRequestException('Wallet address is not a valid Solana public key');
        }
    }
    async requireEntity(entityId) {
        const entity = await this.entitiesRepository.findById(entityId);
        if (!entity) {
            throw new NotFoundException(`Entity ${entityId} not found`);
        }
        return entity;
    }
    async requireEntityFromStore(entityId, client) {
        const entity = await this.entitiesRepository.findById(entityId, client);
        if (!entity) {
            throw new NotFoundException(`Entity ${entityId} not found`);
        }
        return entity;
    }
    async requireWallet(walletId) {
        const wallet = await this.walletsRepository.findById(walletId);
        if (!wallet) {
            throw new NotFoundException(`Wallet ${walletId} not found`);
        }
        return wallet;
    }
    async requireWalletFromStore(walletId, client) {
        const wallet = await this.walletsRepository.findById(walletId, client);
        if (!wallet) {
            throw new NotFoundException(`Wallet ${walletId} not found`);
        }
        return wallet;
    }
};
WalletsService = __decorate([
    Injectable(),
    __param(0, Inject(WalletsRepository)),
    __param(1, Inject(EntitiesRepository)),
    __param(2, Inject(DatabaseService)),
    __param(3, Inject(AuditService)),
    __param(4, Inject(RedisQueueService)),
    __param(5, Inject(WalletSyncService)),
    __metadata("design:paramtypes", [WalletsRepository,
        EntitiesRepository,
        DatabaseService,
        AuditService,
        RedisQueueService,
        WalletSyncService])
], WalletsService);
export { WalletsService };
//# sourceMappingURL=wallets.service.js.map