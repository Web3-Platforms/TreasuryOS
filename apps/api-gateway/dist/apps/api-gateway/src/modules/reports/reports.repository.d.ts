import type { ReportRecord } from '@treasuryos/types';
import { DatabaseService } from '../database/database.service.js';
import type { PoolClient } from 'pg';
export interface ReportEntityData {
    id: string;
    legalName: string;
    jurisdiction: string;
    status: string;
    kycStatus: string;
    riskLevel: string;
    provider: string;
    externalUserId: string;
    wallets: Array<{
        id: string;
        walletAddress: string;
        chainTxSignature?: string;
        requestedBy: string;
    }>;
    cases: Array<{
        id: string;
        transactionReference: string;
        caseStatus: string;
        amount: string;
        asset: string;
        sourceWallet: string;
        destinationWallet: string;
    }>;
}
export declare class ReportsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    listAll(): Promise<ReportRecord[]>;
    findById(reportId: string, client?: PoolClient): Promise<ReportRecord | undefined>;
    save(report: ReportRecord, client?: PoolClient): Promise<ReportRecord>;
    fetchReportData(targetMonth: string): Promise<ReportEntityData[]>;
}
