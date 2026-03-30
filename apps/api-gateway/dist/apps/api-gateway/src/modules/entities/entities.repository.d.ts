import { type EntityRecord } from '@treasuryos/types';
import { DatabaseService } from '../database/database.service.js';
import type { PoolClient } from 'pg';
export declare class EntitiesRepository {
    private readonly database;
    constructor(database: DatabaseService);
    listAll(): Promise<EntityRecord[]>;
    findById(entityId: string, client?: PoolClient): Promise<EntityRecord | undefined>;
    findByExternalUserId(externalUserId: string, client?: PoolClient): Promise<EntityRecord | undefined>;
    findByKycApplicantId(kycApplicantId: string, client?: PoolClient): Promise<EntityRecord | undefined>;
    save(entity: EntityRecord, client?: PoolClient): Promise<EntityRecord>;
}
