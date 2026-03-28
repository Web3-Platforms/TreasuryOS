import { Inject, Injectable, Logger } from '@nestjs/common';
import { WalletWhitelistClient, isValidSolanaAddress, loadAuthorityKeypair } from '@treasuryos/sdk';
import { ChainSyncStatus, type EntityRecord, type WalletRecord } from '@treasuryos/types';
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

import { loadApiGatewayEnv } from '../../config/env.js';
import { KmsService } from '../security/kms.service.js';
import { SquadsService } from '../governance/squads.service.js';

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
    @Inject(KmsService)
    private readonly kmsService: KmsService,
    @Inject(SquadsService)
    private readonly squadsService: SquadsService,
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
      const client = this.createClient();
      
      // Determine authority public key and signer
      let authorityPubkey: PublicKey;
      let authoritySigner: any = null;

      if (this.env.SOLANA_SIGNING_MODE === 'kms') {
        if (!this.env.AWS_KMS_PUBLIC_KEY) {
          throw new Error('AWS_KMS_PUBLIC_KEY is required when SOLANA_SIGNING_MODE is set to kms');
        }
        authorityPubkey = new PublicKey(this.env.AWS_KMS_PUBLIC_KEY);
        authoritySigner = this.kmsService.getSigner();
        if (!authoritySigner) throw new Error('KMS Signer not initialized');
      } else {
        const authorityKeypair = loadAuthorityKeypair(this.env.AUTHORITY_KEYPAIR_PATH);
        authorityPubkey = authorityKeypair.publicKey;
        authoritySigner = authorityKeypair;
      }

      // Build the instruction
      const { whitelistEntry, instruction } = client.buildAddWalletInstruction(
        this.env.PILOT_INSTITUTION_ID,
        wallet.walletAddress,
        authorityPubkey,
      );

      // Check for Multi-Sig Governance
      if (this.env.SQUADS_MULTISIG_ENABLED && this.squadsService.isEnabled()) {
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

      let signature: string;
      if (this.env.SOLANA_SIGNING_MODE === 'kms') {
        const [signedTx] = await this.kmsService.signTransactions([transaction]);
        signature = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(signature, 'confirmed');
      } else {
        signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [authoritySigner],
          { commitment: 'confirmed' },
        );
      }

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
      network: 'devnet',
      commitment: 'confirmed',
    });
  }
}
