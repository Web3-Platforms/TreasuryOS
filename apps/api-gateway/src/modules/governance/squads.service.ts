import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Connection, PublicKey, TransactionMessage, TransactionInstruction, Keypair } from '@solana/web3.js';
import * as multisig from "@sqds/multisig";
import { loadApiGatewayEnv } from '../../config/env.js';
import { KmsService } from '../security/kms.service.js';

@Injectable()
export class SquadsService implements OnModuleInit {
  private readonly logger = new Logger(SquadsService.name);
  private connection: Connection;
  private multisigPda: PublicKey | null = null;

  constructor(private readonly kmsService: KmsService) {
    const env = loadApiGatewayEnv();
    this.connection = new Connection(env.SOLANA_RPC_URL, 'confirmed');
  }

  async onModuleInit() {
    const env = loadApiGatewayEnv();

    if (!env.SQUADS_MULTISIG_ENABLED) {
      this.logger.log('Squads Multi-Sig governance is disabled.');
      return;
    }

    if (!env.SQUADS_MULTISIG_ADDRESS) {
      this.logger.error('SQUADS_MULTISIG_ADDRESS is missing. Governance logic will fail.');
      return;
    }

    try {
      this.multisigPda = new PublicKey(env.SQUADS_MULTISIG_ADDRESS);
      this.logger.log(`Squads Governance initialized for multisig: ${env.SQUADS_MULTISIG_ADDRESS}`);
    } catch (error) {
      this.logger.error('Invalid Squads Multisig Address', error instanceof Error ? error.stack : String(error));
    }
  }

  /**
   * Proposes a transaction to the Squads Multi-Sig vault.
   * Any institutional wallet sync or high-value movement should go through this flow when enabled.
   */
  async proposeTransaction(instructions: any[], creator: any): Promise<bigint> {
    if (!this.multisigPda) {
      throw new Error('Squads Governance not initialized. Check your configuration.');
    }

    if (!creator || (!creator.publicKey && !creator.secretKey)) {
        throw new Error('A valid creator (Keypair or Signer) is required to propose a transaction');
    }

    const creatorPubkey = creator.publicKey || creator; // Fallback if it's just a PublicKey

    const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
      this.connection,
      this.multisigPda
    );

    // Transaction index is incremented each time a new proposal is created
    const transactionIndex = BigInt(multisigInfo.transactionIndex.toString()) + 1n;

    const [vaultPda] = multisig.getVaultPda({
      multisigPda: this.multisigPda,
      index: 1, // Default vault index
    });

    const latestBlockhash = await this.connection.getLatestBlockhash();
    const transactionMessage = new TransactionMessage({
      payerKey: vaultPda,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: instructions,
    });

    // 1. Create the Vault Transaction
    // feePayer signs the outer transaction to create the proposal on-chain
    await multisig.rpc.vaultTransactionCreate({
      connection: this.connection,
      feePayer: creator,
      multisigPda: this.multisigPda,
      transactionIndex,
      creator: creatorPubkey, // Use derived pubkey
      vaultIndex: 1,
      ephemeralSigners: 0,
      transactionMessage,
    });

    // 2. Create the Proposal
    await multisig.rpc.proposalCreate({
      connection: this.connection,
      feePayer: creator,
      rentPayer: creator,
      multisigPda: this.multisigPda,
      transactionIndex,
    });

    this.logger.log(`Created new Squads proposal. Index: ${transactionIndex}`);
    return transactionIndex;
  }

  /**
   * Wraps a single instruction into a Squads Proposal targeting the
   * SQUADS_MULTISIG_PDA configured in the environment.
   * Use this instead of executing instructions directly via a single keypair.
   */
  async createTransactionProposal(instruction: TransactionInstruction): Promise<bigint> {
    return this.proposeTransaction([instruction], this.kmsService.getSigner());
  }

  isEnabled(): boolean {
    return !!this.multisigPda;
  }
}
