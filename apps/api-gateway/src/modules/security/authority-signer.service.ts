import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Keypair } from '@solana/web3.js';
import {
  loadAuthorityKeypair,
  loadAuthorityKeypairFromJson,
} from '@treasuryos/sdk';

import { loadApiGatewayEnv } from '../../config/env.js';

export type AuthoritySignerStatus = {
  configured: boolean;
  initialized: boolean;
  signingMode: 'filesystem' | 'environment';
  publicKey?: string;
  error?: string;
};

@Injectable()
export class AuthoritySignerService implements OnModuleInit {
  private readonly logger = new Logger(AuthoritySignerService.name);
  private readonly env = loadApiGatewayEnv();
  private signer: Keypair | null = null;
  private signerInitializationError: string | null = null;

  onModuleInit() {
    if (!this.hasConfiguredSignerMaterial()) {
      const message = this.getMissingSignerMessage();

      if (this.env.SOLANA_SYNC_ENABLED) {
        this.logger.error(message);
        throw new Error(message);
      }

      this.logger.log(message);
      return;
    }

    try {
      this.signer =
        this.env.SOLANA_SIGNING_MODE === 'environment'
          ? loadAuthorityKeypairFromJson(this.env.AUTHORITY_KEYPAIR_JSON!)
          : loadAuthorityKeypair(this.env.AUTHORITY_KEYPAIR_PATH!);
      this.signerInitializationError = null;

      this.logger.log(
        `Solana authority signer initialized using ${this.env.SOLANA_SIGNING_MODE} mode.`,
      );
    } catch (error) {
      this.signer = null;
      this.signerInitializationError = error instanceof Error ? error.message : String(error);
      this.logger.error(
        'Failed to initialize the Solana authority signer',
        error instanceof Error ? error.stack : String(error),
      );

      if (this.env.SOLANA_SYNC_ENABLED) {
        throw error instanceof Error ? error : new Error(this.signerInitializationError);
      }
    }
  }

  isEnabled(): boolean {
    return this.signer !== null;
  }

  getStatus(): AuthoritySignerStatus {
    return {
      configured: this.hasConfiguredSignerMaterial(),
      initialized: this.signer !== null,
      signingMode: this.env.SOLANA_SIGNING_MODE,
      publicKey: this.signer?.publicKey.toBase58(),
      error: this.signerInitializationError ?? undefined,
    };
  }

  getSigner(): Keypair {
    if (!this.signer) {
      throw new Error(
        this.env.SOLANA_SIGNING_MODE === 'environment'
          ? 'AUTHORITY_KEYPAIR_JSON is required when SOLANA_SIGNING_MODE is set to environment'
          : 'AUTHORITY_KEYPAIR_PATH is required when SOLANA_SIGNING_MODE is set to filesystem',
      );
    }

    return this.signer;
  }

  private hasConfiguredSignerMaterial(): boolean {
    return this.env.SOLANA_SIGNING_MODE === 'environment'
      ? Boolean(this.env.AUTHORITY_KEYPAIR_JSON)
      : Boolean(this.env.AUTHORITY_KEYPAIR_PATH);
  }

  private getMissingSignerMessage() {
    return this.env.SOLANA_SIGNING_MODE === 'environment'
      ? 'AUTHORITY_KEYPAIR_JSON is required when SOLANA_SIGNING_MODE is set to environment'
      : 'AUTHORITY_KEYPAIR_PATH is required when SOLANA_SIGNING_MODE is set to filesystem';
  }
}
