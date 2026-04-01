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
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, ServiceUnavailableException, } from '@nestjs/common';
import { canApproveEntity, canReviewEntity, canSubmitEntity, } from '@treasuryos/compliance-rules';
import { EntityStatus, Jurisdiction, KycStatus, RiskLevel, } from '@treasuryos/types';
import { z } from 'zod';
import { createResourceId } from '../../common/ids.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { EntitiesRepository } from './entities.repository.js';
import { KycWebhooksRepository } from '../kyc/kyc-webhooks.repository.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
import { SumsubService } from '../kyc/sumsub.service.js';
const createEntitySchema = z.object({
    jurisdiction: z.nativeEnum(Jurisdiction).default(Jurisdiction.EU),
    legalName: z.string().min(2).max(200),
    notes: z.string().max(4000).optional(),
    riskLevel: z.nativeEnum(RiskLevel).default(RiskLevel.Medium),
});
const updateDraftSchema = createEntitySchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');
const decisionSchema = z.object({
    notes: z.string().max(4000).optional(),
});
function parseSumsubTimestamp(timestamp) {
    if (!timestamp) {
        return undefined;
    }
    const normalized = timestamp.includes('T') ? timestamp : `${timestamp.replace(' ', 'T')}Z`;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }
    return parsed.toISOString();
}
let EntitiesService = class EntitiesService {
    entitiesRepository;
    kycWebhooksRepository;
    database;
    auditService;
    queueService;
    sumsubService;
    env = loadApiGatewayEnv();
    constructor(entitiesRepository, kycWebhooksRepository, database, auditService, queueService, sumsubService) {
        this.entitiesRepository = entitiesRepository;
        this.kycWebhooksRepository = kycWebhooksRepository;
        this.database = database;
        this.auditService = auditService;
        this.queueService = queueService;
        this.sumsubService = sumsubService;
    }
    async listEntities() {
        return this.entitiesRepository.listAll();
    }
    async getEntity(entityId) {
        return this.requireEntity(entityId);
    }
    async createEntity(input, actor) {
        const parsedInput = createEntitySchema.parse(input);
        if (parsedInput.jurisdiction !== Jurisdiction.EU) {
            throw new BadRequestException('Phase 0 only supports EU entities');
        }
        const now = new Date().toISOString();
        const entityId = createResourceId('entity');
        const entity = {
            id: entityId,
            legalName: parsedInput.legalName,
            jurisdiction: parsedInput.jurisdiction,
            status: EntityStatus.Draft,
            kycStatus: KycStatus.Pending,
            riskLevel: parsedInput.riskLevel,
            provider: 'sumsub',
            externalUserId: `${this.env.PILOT_INSTITUTION_ID}:${entityId}`,
            notes: parsedInput.notes,
            wallets: [],
            createdBy: actor.id,
            createdAt: now,
            lastUpdatedAt: now,
        };
        await this.entitiesRepository.save(entity);
        await this.auditService.record({
            action: 'entity.created',
            actor,
            resourceType: 'entity',
            resourceId: entity.id,
            summary: `Entity draft ${entity.legalName} was created`,
        });
        return entity;
    }
    async updateDraft(entityId, input, actor) {
        const patch = updateDraftSchema.parse(input);
        const updatedEntity = await this.database.withTransaction(async (client) => {
            const entity = await this.entitiesRepository.findById(entityId, client);
            if (!entity) {
                throw new NotFoundException(`Entity ${entityId} not found`);
            }
            if (entity.status !== EntityStatus.Draft) {
                throw new ConflictException('Only draft entities can be edited');
            }
            if (patch.jurisdiction && patch.jurisdiction !== Jurisdiction.EU) {
                throw new BadRequestException('Phase 0 only supports EU entities');
            }
            entity.legalName = patch.legalName ?? entity.legalName;
            entity.jurisdiction = patch.jurisdiction ?? entity.jurisdiction;
            entity.riskLevel = patch.riskLevel ?? entity.riskLevel;
            entity.notes = patch.notes ?? entity.notes;
            entity.lastUpdatedAt = new Date().toISOString();
            await this.entitiesRepository.save(entity, client);
            return entity;
        });
        await this.auditService.record({
            action: 'entity.updated',
            actor,
            resourceType: 'entity',
            resourceId: updatedEntity.id,
            summary: `Entity draft ${updatedEntity.legalName} was updated`,
        });
        return updatedEntity;
    }
    async submitEntity(entityId, actor) {
        const entity = await this.requireEntity(entityId);
        this.ensureSumsubEnabled();
        if (!(canSubmitEntity(entity.status) || entity.status === EntityStatus.Submitted)) {
            throw new ConflictException('Entity cannot be submitted in its current state');
        }
        if (entity.kycApplicantId) {
            throw new ConflictException('Entity already has a Sumsub applicant');
        }
        const submittedAt = new Date().toISOString();
        await this.database.withTransaction(async (client) => {
            const record = await this.requireEntityFromStore(entityId, client);
            if (!(canSubmitEntity(record.status) || record.status === EntityStatus.Submitted)) {
                throw new ConflictException('Entity cannot be submitted in its current state');
            }
            record.status = EntityStatus.Submitted;
            record.submittedAt = submittedAt;
            record.lastUpdatedAt = submittedAt;
            await this.entitiesRepository.save(record, client);
        });
        const applicant = await this.sumsubService.createApplicant(entity.externalUserId);
        const updatedEntity = await this.database.withTransaction(async (client) => {
            const record = await this.requireEntityFromStore(entityId, client);
            record.provider = 'sumsub';
            record.status = EntityStatus.KycPending;
            record.kycStatus = KycStatus.Pending;
            record.kycApplicantId = applicant.applicantId;
            record.kycLevelName = this.env.SUMSUB_LEVEL_NAME;
            record.lastUpdatedAt = new Date().toISOString();
            await this.entitiesRepository.save(record, client);
            return record;
        });
        await this.auditService.record({
            action: 'entity.submitted',
            actor,
            resourceType: 'entity',
            resourceId: updatedEntity.id,
            summary: `Entity ${updatedEntity.legalName} was submitted to Sumsub`,
            metadata: {
                applicantId: applicant.applicantId,
                levelName: this.env.SUMSUB_LEVEL_NAME,
            },
        });
        await this.queueService.enqueue(this.env.REDIS_QUEUE_NAME, {
            type: 'entity.submitted',
            entityId: updatedEntity.id,
            externalUserId: updatedEntity.externalUserId,
        });
        return updatedEntity;
    }
    async approveEntity(entityId, input, actor) {
        const decision = decisionSchema.parse(input);
        const updatedEntity = await this.database.withTransaction(async (client) => {
            const entity = await this.requireEntityFromStore(entityId, client);
            if (!canApproveEntity(entity.status) || entity.kycStatus !== KycStatus.Approved) {
                throw new ConflictException('Entity is not ready for approval');
            }
            entity.status = EntityStatus.Approved;
            entity.reviewedAt = new Date().toISOString();
            entity.lastUpdatedAt = entity.reviewedAt;
            entity.notes = decision.notes ?? entity.notes;
            await this.entitiesRepository.save(entity, client);
            return entity;
        });
        await this.auditService.record({
            action: 'entity.approved',
            actor,
            resourceType: 'entity',
            resourceId: updatedEntity.id,
            summary: `Entity ${updatedEntity.legalName} was approved`,
        });
        await this.queueService.enqueue(this.env.REDIS_QUEUE_NAME, {
            type: 'entity.approved',
            entityId: updatedEntity.id,
        });
        return updatedEntity;
    }
    async rejectEntity(entityId, input, actor) {
        const decision = decisionSchema.parse(input);
        const updatedEntity = await this.database.withTransaction(async (client) => {
            const entity = await this.requireEntityFromStore(entityId, client);
            if (!canReviewEntity(entity.status) && entity.status !== EntityStatus.Approved) {
                throw new ConflictException('Entity is not in a rejectable state');
            }
            entity.status = EntityStatus.Rejected;
            entity.kycStatus = entity.kycStatus === KycStatus.Approved ? entity.kycStatus : KycStatus.Rejected;
            entity.reviewedAt = new Date().toISOString();
            entity.lastUpdatedAt = entity.reviewedAt;
            entity.notes = decision.notes ?? entity.notes;
            await this.entitiesRepository.save(entity, client);
            return entity;
        });
        await this.auditService.record({
            action: 'entity.rejected',
            actor,
            resourceType: 'entity',
            resourceId: updatedEntity.id,
            summary: `Entity ${updatedEntity.legalName} was rejected`,
        });
        await this.queueService.enqueue(this.env.REDIS_QUEUE_NAME, {
            type: 'entity.rejected',
            entityId: updatedEntity.id,
        });
        return updatedEntity;
    }
    async applyVerifiedKycWebhook(payload, digestMetadata) {
        this.ensureSumsubEnabled();
        const receivedAt = new Date().toISOString();
        const eventCreatedAt = parseSumsubTimestamp(payload.createdAtMs);
        const result = await this.database.withTransaction(async (client) => {
            let duplicateWebhook;
            if (payload.correlationId) {
                duplicateWebhook = await this.kycWebhooksRepository.findByCorrelationIdAndType(payload.correlationId, payload.type, client);
            }
            else {
                duplicateWebhook = await this.kycWebhooksRepository.findByDigest(digestMetadata.digest, client);
            }
            if (duplicateWebhook) {
                return {
                    duplicate: true,
                    entity: duplicateWebhook.entityId
                        ? await this.entitiesRepository.findById(duplicateWebhook.entityId, client)
                        : undefined,
                    stale: false,
                };
            }
            let entity;
            if (payload.externalUserId) {
                entity = await this.entitiesRepository.findByExternalUserId(payload.externalUserId, client);
            }
            if (!entity && payload.applicantId) {
                entity = await this.entitiesRepository.findByKycApplicantId(payload.applicantId, client);
            }
            const webhookRecord = {
                id: createResourceId('webhook'),
                entityId: entity?.id,
                provider: 'sumsub',
                payloadType: payload.type,
                verified: true,
                applicantId: payload.applicantId,
                correlationId: payload.correlationId,
                createdAt: receivedAt,
                digestAlg: digestMetadata.digestAlg,
                eventCreatedAt,
                externalUserId: payload.externalUserId,
                payloadDigest: digestMetadata.digest,
                reviewAnswer: payload.reviewResult?.reviewAnswer,
                reviewStatus: payload.reviewStatus,
            };
            await this.kycWebhooksRepository.save(webhookRecord, client);
            if (!entity) {
                return {
                    duplicate: false,
                    entity: undefined,
                    stale: false,
                };
            }
            const stale = !!eventCreatedAt &&
                !!entity.lastKycEventAt &&
                new Date(eventCreatedAt).getTime() <= new Date(entity.lastKycEventAt).getTime();
            if (!stale) {
                this.applyWebhookTransition(entity, payload, eventCreatedAt);
                await this.entitiesRepository.save(entity, client);
            }
            return {
                duplicate: false,
                entity,
                stale,
            };
        });
        if (result.duplicate) {
            return {
                duplicate: true,
                entity: result.entity,
                stale: false,
            };
        }
        await this.auditService.record({
            action: result.stale ? 'kyc.webhook.stale' : 'kyc.webhook.applied',
            actorId: 'sumsub',
            actorEmail: 'webhook@sumsub.local',
            resourceType: 'kyc_webhook',
            resourceId: payload.correlationId ?? payload.applicantId ?? payload.type,
            summary: result.stale
                ? `Ignored stale Sumsub webhook ${payload.type}`
                : `Applied Sumsub webhook ${payload.type}`,
            metadata: {
                applicantId: payload.applicantId ?? null,
                entityId: result.entity?.id ?? null,
                externalUserId: payload.externalUserId ?? null,
            },
        });
        await this.queueService.enqueue(this.env.REDIS_QUEUE_NAME, {
            type: result.stale ? 'kyc.webhook.stale' : 'kyc.webhook.applied',
            entityId: result.entity?.id ?? null,
            webhookType: payload.type,
        });
        return result;
    }
    applyWebhookTransition(entity, payload, eventCreatedAt) {
        const reviewAnswer = payload.reviewResult?.reviewAnswer;
        entity.kycApplicantId = payload.applicantId ?? entity.kycApplicantId;
        entity.kycLevelName = payload.levelName ?? entity.kycLevelName;
        entity.kycCorrelationId = payload.correlationId ?? entity.kycCorrelationId;
        entity.latestKycWebhookType = payload.type;
        entity.latestKycReviewAnswer = reviewAnswer ?? entity.latestKycReviewAnswer;
        entity.lastKycEventAt = eventCreatedAt ?? new Date().toISOString();
        entity.lastUpdatedAt = new Date().toISOString();
        if (reviewAnswer === 'RED' || payload.type === 'applicantWorkflowFailed' || payload.type === 'applicantDeleted') {
            entity.status = EntityStatus.Rejected;
            entity.kycStatus = KycStatus.Rejected;
            entity.reviewedAt = entity.reviewedAt ?? entity.lastUpdatedAt;
            return;
        }
        if (payload.type === 'applicantPending' || payload.type === 'applicantCreated' || payload.type === 'applicantActivated') {
            entity.status = EntityStatus.KycPending;
            entity.kycStatus = KycStatus.Pending;
            return;
        }
        if (payload.type === 'applicantOnHold' || payload.type === 'applicantActionPending') {
            entity.status = EntityStatus.UnderReview;
            entity.kycStatus = KycStatus.UnderReview;
            return;
        }
        if (reviewAnswer === 'GREEN' &&
            (payload.type === 'applicantReviewed' ||
                payload.type === 'applicantActionReviewed' ||
                payload.type === 'applicantWorkflowCompleted')) {
            entity.status = EntityStatus.UnderReview;
            entity.kycStatus = KycStatus.Approved;
            return;
        }
        if (payload.reviewStatus === 'completed') {
            entity.status = EntityStatus.UnderReview;
            entity.kycStatus = entity.kycStatus === KycStatus.Approved ? entity.kycStatus : KycStatus.UnderReview;
        }
    }
    ensureSumsubEnabled() {
        if (!this.env.KYC_SUMSUB_ENABLED) {
            throw new ServiceUnavailableException('Sumsub KYC is coming soon');
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
};
EntitiesService = __decorate([
    Injectable(),
    __param(0, Inject(EntitiesRepository)),
    __param(1, Inject(KycWebhooksRepository)),
    __param(2, Inject(DatabaseService)),
    __param(3, Inject(AuditService)),
    __param(4, Inject(RedisQueueService)),
    __param(5, Inject(SumsubService)),
    __metadata("design:paramtypes", [EntitiesRepository,
        KycWebhooksRepository,
        DatabaseService,
        AuditService,
        RedisQueueService,
        SumsubService])
], EntitiesService);
export { EntitiesService };
//# sourceMappingURL=entities.service.js.map