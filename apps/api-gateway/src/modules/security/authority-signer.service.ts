import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Keypair } from '@solana/web3.js';
import {
  loadAuthorityKeypair,
  loadAuthorityKeypairFromJson,
} from '@treasuryos/sdk';

import { loadApiGatewayEnv } from '../../config/env.js';

@Injectable()
export class AuthoritySignerService implements OnModuleInit {
  private readonly logger = new Logger(AuthoritySignerService.name);
  private readonly env = loadApiGatewayEnv();
  private signer: Keypair | null = null;

  onModuleInit() {
    if (!this.hasConfiguredSignerMaterial()) {
      this.logger.log(
        'Solana authority signer is not configured. Configure filesystem or environment signing before enabling on-chain sync.',
      );
      return;
    }

    try {
      this.signer =
        this.env.SOLANA_SIGNING_MODE === 'environment'
          ? loadAuthorityKeypairFromJson(this.env.AUTHORITY_KEYPAIR_JSON!)
          : loadAuthorityKeypair(this.env.AUTHORITY_KEYPAIR_PATH!);

      this.logger.log(
        `Solana authority signer initialized using ${this.env.SOLANA_SIGNING_MODE} mode.`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize the Solana authority signer',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  isEnabled(): boolean {
    return this.signer !== null;
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
}
