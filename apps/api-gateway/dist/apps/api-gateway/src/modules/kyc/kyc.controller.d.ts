import { AuditService } from '../audit/audit.service.js';
import { EntitiesService } from '../entities/entities.service.js';
import { SumsubService } from './sumsub.service.js';
export declare class KycController {
    private readonly sumsubService;
    private readonly entitiesService;
    private readonly auditService;
    private readonly env;
    constructor(sumsubService: SumsubService, entitiesService: EntitiesService, auditService: AuditService);
    handleSumsubWebhook(rawBody: Buffer | undefined, headers: Record<string, string | string[] | undefined>): Promise<{
        duplicate: boolean;
        entityId: string | null;
        received: boolean;
        stale: boolean;
        verified: boolean;
    }>;
}
