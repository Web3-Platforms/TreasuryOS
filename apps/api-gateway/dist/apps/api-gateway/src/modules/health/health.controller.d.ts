import { DatabaseService } from '../database/database.service.js';
import { WalletSyncReadinessService } from '../wallets/wallet-sync-readiness.service.js';
export declare class HealthController {
    private readonly databaseService;
    private readonly walletSyncReadinessService;
    constructor(databaseService: Pick<DatabaseService, 'getPool'>, walletSyncReadinessService: Pick<WalletSyncReadinessService, 'getReadiness' | 'getStartupReadiness'>);
    getHealth(): Promise<{
        scope: {
            customerProfile: string;
            institutionId: string;
            queueName: string;
        };
        walletSync: import("../wallets/wallet-sync-readiness.service.js").WalletSyncReadiness;
        status: string;
        service: string;
        version: string;
        timestamp: string;
    }>;
    getLive(): {
        status: string;
        service: string;
        version: string;
        timestamp: string;
    };
    getReady(): Promise<{
        checks: {
            database: string;
            walletSync: import("../wallets/wallet-sync-readiness.service.js").WalletSyncReadiness;
        };
        status: string;
        service: string;
        version: string;
        timestamp: string;
    }>;
    private buildBasePayload;
    private assertDatabaseReady;
}
