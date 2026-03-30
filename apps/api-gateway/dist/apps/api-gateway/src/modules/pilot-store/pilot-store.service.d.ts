import { OnModuleDestroy } from '@nestjs/common';
import { Pool, type PoolClient } from 'pg';
import { type AuditEventRecord, type PilotStore, type SessionRecord, type UserRecord } from '@treasuryos/types';
type DatabaseExecutor = Pick<Pool, 'query'> | Pick<PoolClient, 'query'>;
export declare class PilotStoreService implements OnModuleDestroy {
    private readonly env;
    private readonly logger;
    private readonly pool;
    private initializationPromise?;
    constructor();
    getReportsDirPath(): string;
    snapshot(executor?: DatabaseExecutor): Promise<PilotStore>;
    mutate<T>(mutator: (store: PilotStore) => Promise<T> | T): Promise<T>;
    findUserByEmail(email: string): Promise<UserRecord | undefined>;
    findUserById(userId: string): Promise<UserRecord | undefined>;
    findSessionById(sessionId: string): Promise<SessionRecord | undefined>;
    saveSession(session: SessionRecord): Promise<SessionRecord>;
    appendAuditEvent(event: PilotStore['auditEvents'][number]): Promise<AuditEventRecord>;
    onModuleDestroy(): Promise<void>;
    private ensureInitialized;
    private initialize;
    private upsertSeedUsers;
    private writeStore;
    private defaultUsers;
}
export {};
