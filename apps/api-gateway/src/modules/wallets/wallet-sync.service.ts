import { Inject, Injectable, Logger } from '@nestjs/common';
import { WalletWhitelistClient, isValidSolanaAddress } from '@treasuryos/sdk';
import { ChainSyncStatus, type EntityRecord, type WalletRecord } from '@treasuryos/types';
import { Connection, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

import { loadApiGatewayEnv } from '../../config/env.js';
import { AuthoritySignerService } from '../security/authority-signer.service.js';
import { SquadsService } from '../governance/squads.service.js';
import { WalletSyncReadinessService } from './wallet-sync-readiness.service.js';

export type WalletSyncOutcome = {
  chainSyncStatus: ChainSyncStatus;
  signature?: string;
  syncError?: string;
  whitelistEntry: string;
};

@Injectable()
export class WalletSyncService {
  private readonly logger = new Logger(WalletSyncService.name);
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(AuthoritySignerService)
    private readonly authoritySignerService: Pick<AuthoritySignerService, 'getSigner'>,
    @Inject(SquadsService)
    private readonly squadsService: Pick<SquadsService, 'isEnabled' | 'proposeTransaction'>,
    @Inject(WalletSyncReadinessService)
    private readonly walletSyncReadinessService: Pick<WalletSyncReadinessService, 'assertLiveSyncReady'>,
  ) {}

  createPreview(institutionId: string, walletAddress: string) {
    if (!isValidSolanaAddress(walletAddress)) {
      throw new Error('Wallet address is not a valid Solana public key');
    }

    const client = this.createClient();
    const [whitelistEntry] = client.deriveWhitelistEntry(institutionId, walletAddress);

    return {
      whitelistEntry: whitelistEntry.toBase58(),
    };
  }

  async syncApprovedWallet(entity: EntityRecord, wallet: WalletRecord): Promise<WalletSyncOutcome> {
    const preview = this.createPreview(this.env.PILOT_INSTITUTION_ID, wallet.walletAddress);

    if (!this.env.SOLANA_SYNC_ENABLED) {
      return {
        chainSyncStatus: ChainSyncStatus.Skipped,
        whitelistEntry: preview.whitelistEntry,
      };
    }

    try {
      await this.walletSyncReadinessService.assertLiveSyncReady();

      const client = this.createClient();
      const authoritySigner = this.authoritySignerService.getSigner();
      const authorityPubkey = authoritySigner.publicKey;

      // Build the instruction
      const { whitelistEntry, instruction } = client.buildAddWalletInstruction(
        this.env.PILOT_INSTITUTION_ID,
        wallet.walletAddress,
        authorityPubkey,
      );

      // Check for Multi-Sig Governance
      if (this.env.SQUADS_MULTISIG_ENABLED) {
        if (!this.squadsService.isEnabled()) {
          throw new Error(
            'Squads multisig is enabled but the governance service is not initialized. Refusing direct execution fallback.',
          );
        }

        const proposalIndex = await this.squadsService.proposeTransaction([instruction], authoritySigner);
        return {
          chainSyncStatus: ChainSyncStatus.Pending,
          signature: `squads-proposal-${proposalIndex}`,
          whitelistEntry: whitelistEntry.toBase58(),
        };
      }

      // Standard Direct Execution
      const transaction = new Transaction().add(instruction);
      const connection = new Connection(this.env.SOLANA_RPC_URL, 'confirmed');

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [authoritySigner],
        { commitment: 'confirmed' },
      );

      return {
        chainSyncStatus: ChainSyncStatus.Sent,
        signature,
        whitelistEntry: whitelistEntry.toBase58(),
      };
    } catch (error) {
      this.logger.error(`Sync failed for wallet ${wallet.id}`, error instanceof Error ? error.stack : String(error));
      return {
        chainSyncStatus: ChainSyncStatus.Failed,
        syncError: error instanceof Error ? error.message : String(error),
        whitelistEntry: preview.whitelistEntry,
      };
    }
  }

  private createClient() {
    return new WalletWhitelistClient(this.env.PROGRAM_ID_WALLET_WHITELIST, {
      url: this.env.SOLANA_RPC_URL,
      network: this.env.SOLANA_NETWORK,
      commitment: 'confirmed',
    });
  }
}
