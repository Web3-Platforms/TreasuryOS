import { AuditService } from './audit.service.js';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    listEvents(query: unknown): Promise<{
        events: import("@treasuryos/types").AuditEventRecord[];
        limit: number;
    }>;
}
