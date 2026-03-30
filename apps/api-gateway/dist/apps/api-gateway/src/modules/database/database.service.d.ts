import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, type PoolClient } from 'pg';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly env;
    private readonly logger;
    readonly pool: Pool;
    private seedUsersInitialized;
    private shouldUseSsl;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getPool(): Pool;
    withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    ensureSeedUsers(): Promise<void>;
    private upsertSeedUsers;
}
