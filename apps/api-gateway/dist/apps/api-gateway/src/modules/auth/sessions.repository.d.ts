import type { SessionRecord } from '@treasuryos/types';
import { DatabaseService } from '../database/database.service.js';
export declare class SessionsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    findById(sessionId: string): Promise<SessionRecord | undefined>;
    findActiveByUserId(userId: string): Promise<SessionRecord[]>;
    save(session: SessionRecord): Promise<SessionRecord>;
}
