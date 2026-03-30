import type { ReviewedTransaction } from '@treasuryos/types';
import { DatabaseService } from '../database/database.service.js';
import type { PoolClient } from 'pg';
export declare class TransactionCasesRepository {
    private readonly database;
    constructor(database: DatabaseService);
    listCases(filters: {
        entityId?: string;
        status?: string;
        limit: number;
    }): Promise<ReviewedTransaction[]>;
    findById(caseId: string, client?: PoolClient): Promise<ReviewedTransaction | undefined>;
    findByReferenceAndEntityId(reference: string, entityId: string, client?: PoolClient): Promise<ReviewedTransaction | undefined>;
    save(transactionCase: ReviewedTransaction, client?: PoolClient): Promise<ReviewedTransaction>;
}
