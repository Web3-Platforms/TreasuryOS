import { ChainSyncStatus, type EntityRecord, type WalletRecord } from '@treasuryos/types';
import { KmsService } from '../security/kms.service.js';
import { SquadsService } from '../governance/squads.service.js';
export type WalletSyncOutcome = {
    chainSyncStatus: ChainSyncStatus;
    signature?: string;
    syncError?: string;
    whitelistEntry: string;
};
export declare class WalletSyncService {
    private readonly kmsService;
    private readonly squadsService;
    private readonly logger;
    private readonly env;
    constructor(kmsService: KmsService, squadsService: SquadsService);
    createPreview(institutionId: string, walletAddress: string): {
        whitelistEntry: string;
    };
    syncApprovedWallet(entity: EntityRecord, wallet: WalletRecord): Promise<WalletSyncOutcome>;
    private createClient;
}
