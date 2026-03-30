import type { UserRecord } from '@treasuryos/types';
import { DatabaseService } from '../database/database.service.js';
export declare class UsersRepository {
    private readonly database;
    constructor(database: DatabaseService);
    findByEmail(email: string): Promise<UserRecord | undefined>;
    findById(userId: string): Promise<UserRecord | undefined>;
    updateLastLoginAt(userId: string, lastLoginAt: string): Promise<void>;
}
