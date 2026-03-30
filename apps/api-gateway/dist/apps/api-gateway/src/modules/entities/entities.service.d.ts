import { type AuthenticatedUser, type EntityRecord } from '@treasuryos/types';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { EntitiesRepository } from './entities.repository.js';
import { KycWebhooksRepository } from '../kyc/kyc-webhooks.repository.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
import { SumsubService } from '../kyc/sumsub.service.js';
import { CreateEntityDto } from './dto/create-entity.dto.js';
import { UpdateDraftDto } from './dto/update-draft.dto.js';
import { EntityDecisionDto } from './dto/entity-decision.dto.js';
type SumsubWebhookPayload = ReturnType<SumsubService['verifyWebhook']>['payload'];
export declare class EntitiesService {
    private readonly entitiesRepository;
    private readonly kycWebhooksRepository;
    private readonly database;
    private readonly auditService;
    private readonly queueService;
    private readonly sumsubService;
    private readonly env;
    constructor(entitiesRepository: EntitiesRepository, kycWebhooksRepository: KycWebhooksRepository, database: DatabaseService, auditService: AuditService, queueService: RedisQueueService, sumsubService: SumsubService);
    listEntities(): Promise<EntityRecord[]>;
    getEntity(entityId: string): Promise<EntityRecord>;
    createEntity(input: CreateEntityDto, actor: AuthenticatedUser): Promise<EntityRecord>;
    updateDraft(entityId: string, input: UpdateDraftDto, actor: AuthenticatedUser): Promise<EntityRecord>;
    submitEntity(entityId: string, actor: AuthenticatedUser): Promise<EntityRecord>;
    approveEntity(entityId: string, input: EntityDecisionDto, actor: AuthenticatedUser): Promise<EntityRecord>;
    rejectEntity(entityId: string, input: EntityDecisionDto, actor: AuthenticatedUser): Promise<EntityRecord>;
    applyVerifiedKycWebhook(payload: SumsubWebhookPayload, digestMetadata: {
        digest: string;
        digestAlg: string;
    }): Promise<{
        duplicate: boolean;
        entity: EntityRecord | undefined;
        stale: boolean;
    }>;
    private applyWebhookTransition;
    private requireEntity;
    private requireEntityFromStore;
}
export {};
