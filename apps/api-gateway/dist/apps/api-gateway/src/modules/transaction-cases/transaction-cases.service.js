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
import { canEscalateTransactionCase, canResolveTransactionCase, canStartTransactionCaseReview, deriveTransactionRules, } from '@treasuryos/compliance-rules';
import { isValidSolanaAddress } from '@treasuryos/sdk';
import { EntityStatus, Jurisdiction, KycStatus, TransactionCaseStatus, WalletStatus, } from '@treasuryos/types';
import { z } from 'zod';
import { createResourceId } from '../../common/ids.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { EntitiesRepository } from '../entities/entities.repository.js';
import { WalletsRepository } from '../wallets/wallets.repository.js';
import { TransactionCasesRepository } from './transaction-cases.repository.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
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
function formatAmount(amount) {
    return amount.toFixed(2);
}
function mergeNotes(existing, next) {
    if (!next) {
        return existing;
    }
    if (!existing || existing === next) {
        return next;
    }
    return `${existing}\n\n${next}`;
}
let TransactionCasesService = class TransactionCasesService {
    transactionCasesRepository;
    entitiesRepository;
    walletsRepository;
    database;
    auditService;
    queueService;
    env = loadApiGatewayEnv();
    constructor(transactionCasesRepository, entitiesRepository, walletsRepository, database, auditService, queueService) {
        this.transactionCasesRepository = transactionCasesRepository;
        this.entitiesRepository = entitiesRepository;
        this.walletsRepository = walletsRepository;
        this.database = database;
        this.auditService = auditService;
        this.queueService = queueService;
    }
    async listCases(query) {
        const filters = listCasesQuerySchema.parse(query);
        return this.transactionCasesRepository.listCases({
            entityId: filters.entityId,
            status: filters.status,
            limit: filters.limit
        });
    }
    async getCase(caseId) {
        return this.requireCase(caseId);
    }
    async screenTransaction(input, actor) {
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
        const wallet = await this.resolveWalletForScreening(entity.id, parsedInput.walletId, parsedInput.sourceWallet, parsedInput.destinationWallet);
        const transactionReference = parsedInput.referenceId ?? createResourceId('txref');
        const amount = formatAmount(parsedInput.amount);
        const jurisdiction = parsedInput.jurisdiction ?? entity.jurisdiction;
        if (jurisdiction !== Jurisdiction.EU) {
            throw new BadRequestException('Phase 0 only supports EU transaction review');
        }
        const existingReference = await this.transactionCasesRepository.findByReferenceAndEntityId(transactionReference, entity.id);
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
        const transactionCase = {
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
            const duplicate = await this.transactionCasesRepository.findByReferenceAndEntityId(transactionCase.transactionReference, entity.id, client);
            if (duplicate) {
                throw new ConflictException(`Transaction reference ${transactionCase.transactionReference} already exists`);
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
    async markUnderReview(caseId, input, actor) {
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
    async approveCase(caseId, input, actor) {
        const updatedCase = await this.applyDecision(caseId, input, actor, TransactionCaseStatus.Approved, 'transaction_case.approved', 'approved');
        await this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:cases`, {
            caseId: updatedCase.id,
            entityId: updatedCase.entityId,
            status: updatedCase.caseStatus,
            type: 'transaction_case.approved',
            walletId: updatedCase.walletId ?? null,
        });
        return updatedCase;
    }
    async rejectCase(caseId, input, actor) {
        const updatedCase = await this.applyDecision(caseId, input, actor, TransactionCaseStatus.Rejected, 'transaction_case.rejected', 'rejected');
        await this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:cases`, {
            caseId: updatedCase.id,
            entityId: updatedCase.entityId,
            status: updatedCase.caseStatus,
            type: 'transaction_case.rejected',
            walletId: updatedCase.walletId ?? null,
        });
        return updatedCase;
    }
    async escalateCase(caseId, input, actor) {
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
    async applyDecision(caseId, input, actor, status, action, resolutionReason) {
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
    ensureValidAddress(value, field) {
        if (!isValidSolanaAddress(value)) {
            throw new BadRequestException(`${field} must be a valid Solana address`);
        }
    }
    async resolveWalletForScreening(entityId, walletId, sourceWallet, destinationWallet) {
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
        const matchedWallet = wallets.find((record) => (record.walletAddress === sourceWallet || record.walletAddress === destinationWallet) &&
            (record.status === WalletStatus.Approved || record.status === WalletStatus.Synced));
        if (!matchedWallet) {
            throw new ConflictException('Transaction screening requires an approved or synced entity wallet');
        }
        return matchedWallet;
    }
    ensureWalletReady(wallet) {
        if (wallet.status !== WalletStatus.Approved && wallet.status !== WalletStatus.Synced) {
            throw new ConflictException('Transaction screening requires an approved or synced entity wallet');
        }
    }
    async requireEntity(entityId) {
        const entity = await this.entitiesRepository.findById(entityId);
        if (!entity) {
            throw new NotFoundException(`Entity ${entityId} not found`);
        }
        return entity;
    }
    async requireCase(caseId) {
        const transactionCase = await this.transactionCasesRepository.findById(caseId);
        if (!transactionCase) {
            throw new NotFoundException(`Transaction case ${caseId} not found`);
        }
        return transactionCase;
    }
    async requireCaseFromStore(caseId, client) {
        const transactionCase = await this.transactionCasesRepository.findById(caseId, client);
        if (!transactionCase) {
            throw new NotFoundException(`Transaction case ${caseId} not found`);
        }
        return transactionCase;
    }
};
TransactionCasesService = __decorate([
    Injectable(),
    __param(0, Inject(TransactionCasesRepository)),
    __param(1, Inject(EntitiesRepository)),
    __param(2, Inject(WalletsRepository)),
    __param(3, Inject(DatabaseService)),
    __param(4, Inject(AuditService)),
    __param(5, Inject(RedisQueueService)),
    __metadata("design:paramtypes", [TransactionCasesRepository,
        EntitiesRepository,
        WalletsRepository,
        DatabaseService,
        AuditService,
        RedisQueueService])
], TransactionCasesService);
export { TransactionCasesService };
//# sourceMappingURL=transaction-cases.service.js.map