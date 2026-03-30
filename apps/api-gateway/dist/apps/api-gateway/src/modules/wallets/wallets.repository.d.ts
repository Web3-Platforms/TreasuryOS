import type { WalletRecord } from '@treasuryos/types';
import { DatabaseService } from '../database/database.service.js';
import type { PoolClient } from 'pg';
export declare class WalletsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    listAll(entityId?: string): Promise<WalletRecord[]>;
    findById(walletId: string, client?: PoolClient): Promise<WalletRecord | undefined>;
    existsForEntity(entityId: string, walletAddress: string, excludeStatuses?: string[]): Promise<boolean>;
    findByEntityId(entityId: string): Promise<WalletRecord[]>;
    save(wallet: WalletRecord, client?: PoolClient): Promise<WalletRecord>;
}
