import type { AuthenticatedUser, AuditEventRecord } from '@treasuryos/types';
import { AuditRepository } from './audit.repository.js';
type AuditRecordInput = {
    action: string;
    actor?: AuthenticatedUser;
    actorEmail?: string;
    actorId?: string;
    metadata?: Record<string, unknown>;
    resourceId: string;
    resourceType: string;
    summary: string;
};
export declare class AuditService {
    private readonly auditRepository;
    constructor(auditRepository: AuditRepository);
    record(input: AuditRecordInput): Promise<AuditEventRecord>;
    listRecent(limit?: number): Promise<AuditEventRecord[]>;
}
export {};
