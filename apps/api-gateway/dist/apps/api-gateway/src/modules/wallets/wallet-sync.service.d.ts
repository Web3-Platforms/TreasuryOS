import { ChainSyncStatus, type EntityRecord, type WalletRecord } from '@treasuryos/types';
import { AuthoritySignerService } from '../security/authority-signer.service.js';
import { SquadsService } from '../governance/squads.service.js';
import { WalletSyncReadinessService } from './wallet-sync-readiness.service.js';
export type WalletSyncOutcome = {
    chainSyncStatus: ChainSyncStatus;
    executionPath: 'direct' | 'preview' | 'squads';
    signature?: string;
    syncError?: string;
    whitelistEntry: string;
};
export declare class WalletSyncService {
    private readonly authoritySignerService;
    private readonly squadsService;
    private readonly walletSyncReadinessService;
    private readonly logger;
    private readonly env;
    constructor(authoritySignerService: Pick<AuthoritySignerService, 'getSigner'>, squadsService: Pick<SquadsService, 'isEnabled' | 'proposeTransaction'>, walletSyncReadinessService: Pick<WalletSyncReadinessService, 'assertLiveSyncReady'>);
    createPreview(institutionId: string, walletAddress: string): {
        whitelistEntry: string;
    };
    syncApprovedWallet(entity: EntityRecord, wallet: WalletRecord): Promise<WalletSyncOutcome>;
    private createClient;
}
