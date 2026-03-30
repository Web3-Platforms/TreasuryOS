import type { AuditEventRecord } from '@treasuryos/types';
import { DatabaseService } from '../database/database.service.js';
export declare class AuditRepository {
    private readonly database;
    constructor(database: DatabaseService);
    insert(event: AuditEventRecord): Promise<AuditEventRecord>;
    listRecent(limit: number): Promise<AuditEventRecord[]>;
}
