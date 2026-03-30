import type { KycWebhookRecord } from '@treasuryos/types';
import { DatabaseService } from '../database/database.service.js';
import type { PoolClient } from 'pg';
export declare class KycWebhooksRepository {
    private readonly database;
    constructor(database: DatabaseService);
    findByDigest(digest: string, client?: PoolClient): Promise<KycWebhookRecord | undefined>;
    findByCorrelationIdAndType(correlationId: string, payloadType: string, client?: PoolClient): Promise<KycWebhookRecord | undefined>;
    save(webhook: KycWebhookRecord, client?: PoolClient): Promise<KycWebhookRecord>;
}
