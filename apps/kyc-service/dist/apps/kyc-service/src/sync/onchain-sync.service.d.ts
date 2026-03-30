import { KycStatus } from '@treasuryos/types';
export declare class OnchainSyncService {
    private readonly logger;
    syncKycToChain(entityId: string, status: KycStatus): Promise<{
        entityId: string;
        status: KycStatus;
        entityPda: string;
        dryRun: boolean;
    }>;
}
