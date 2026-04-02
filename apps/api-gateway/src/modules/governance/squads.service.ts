import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  Connection,
  PublicKey,
  TransactionMessage,
  TransactionInstruction,
  type Signer,
} from '@solana/web3.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuthoritySignerService } from '../security/authority-signer.service.js';

type SquadsMultisigAccount = {
  transactionIndex: bigint | { toString(): string };
};

type SquadsMultisigModule = {
  accounts: {
    Multisig: {
      fromAccountAddress(
        connection: Connection,
        address: PublicKey,
      ): Promise<SquadsMultisigAccount>;
    };
  };
  getVaultPda(args: { multisigPda: PublicKey; index: number }): [PublicKey, number];
  rpc: {
    vaultTransactionCreate(args: {
      connection: Connection;
      feePayer: Signer;
      multisigPda: PublicKey;
      transactionIndex: bigint;
      creator: PublicKey;
      vaultIndex: number;
      ephemeralSigners: number;
      transactionMessage: TransactionMessage;
    }): Promise<unknown>;
    proposalCreate(args: {
      connection: Connection;
      feePayer: Signer;
      rentPayer: Signer;
      multisigPda: PublicKey;
      transactionIndex: bigint;
    }): Promise<unknown>;
  };
};

@Injectable()
export class SquadsService implements OnModuleInit {
  private readonly logger = new Logger(SquadsService.name);
  private readonly env = loadApiGatewayEnv();
  private connection: Connection;
  private multisigPda: PublicKey | null = null;
  private multisigModule: SquadsMultisigModule | null = null;

  constructor(private readonly authoritySignerService: AuthoritySignerService) {
    this.connection = new Connection(this.env.SOLANA_RPC_URL, 'confirmed');
  }

  async onModuleInit() {
    if (!this.env.SQUADS_MULTISIG_ENABLED) {
      this.logger.log('Squads Multi-Sig governance is disabled.');
      return;
    }

    if (!this.env.SQUADS_MULTISIG_ADDRESS) {
      const message = 'SQUADS_MULTISIG_ADDRESS is missing. Governance logic will fail.';
      this.logger.error(message);

      if (this.env.SOLANA_SYNC_ENABLED) {
        throw new Error(message);
      }

      return;
    }

    try {
      await this.getMultisigModule();
      this.multisigPda = new PublicKey(this.env.SQUADS_MULTISIG_ADDRESS);
      this.logger.log(`Squads Governance initialized for multisig: ${this.env.SQUADS_MULTISIG_ADDRESS}`);
    } catch (error) {
      this.logger.error(
        'Failed to initialize Squads governance',
        error instanceof Error ? error.stack : String(error),
      );

      if (this.env.SOLANA_SYNC_ENABLED) {
        throw error instanceof Error ? error : new Error(String(error));
      }
    }
  }

  /**
   * Proposes a transaction to the Squads Multi-Sig vault.
   * Any institutional wallet sync or high-value movement should go through this flow when enabled.
   */
  async proposeTransaction(instructions: TransactionInstruction[], creator: Signer): Promise<bigint> {
    if (!this.multisigPda) {
      throw new Error('Squads Governance not initialized. Check your configuration.');
    }

    const multisig = await this.getMultisigModule();
    const creatorPubkey = creator.publicKey;

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
    return this.proposeTransaction([instruction], this.authoritySignerService.getSigner());
  }

  isEnabled(): boolean {
    return !!this.multisigPda;
  }

  protected async importMultisigModule(): Promise<SquadsMultisigModule> {
    return (await import('@sqds/multisig')) as SquadsMultisigModule;
  }

  private async getMultisigModule(): Promise<SquadsMultisigModule> {
    if (this.multisigModule) {
      return this.multisigModule;
    }

    try {
      this.multisigModule = await this.importMultisigModule();
      return this.multisigModule;
    } catch (error) {
      const cause = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load @sqds/multisig: ${cause}`);
    }
  }
}
