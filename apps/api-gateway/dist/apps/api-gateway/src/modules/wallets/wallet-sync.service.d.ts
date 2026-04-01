import { ChainSyncStatus, type EntityRecord, type WalletRecord } from '@treasuryos/types';
import { AuthoritySignerService } from '../security/authority-signer.service.js';
import { SquadsService } from '../governance/squads.service.js';
export type WalletSyncOutcome = {
    chainSyncStatus: ChainSyncStatus;
    signature?: string;
    syncError?: string;
    whitelistEntry: string;
};
export declare class WalletSyncService {
    private readonly authoritySignerService;
    private readonly squadsService;
    private readonly logger;
    private readonly env;
    constructor(authoritySignerService: AuthoritySignerService, squadsService: SquadsService);
    createPreview(institutionId: string, walletAddress: string): {
        whitelistEntry: string;
    };
    syncApprovedWallet(entity: EntityRecord, wallet: WalletRecord): Promise<WalletSyncOutcome>;
    private createClient;
}
