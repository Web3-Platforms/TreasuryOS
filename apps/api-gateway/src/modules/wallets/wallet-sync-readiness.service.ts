import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { isValidSolanaAddress } from '@treasuryos/sdk';

import { loadApiGatewayEnv } from '../../config/env.js';
import { SquadsService } from '../governance/squads.service.js';
import { AuthoritySignerService, type AuthoritySignerStatus } from '../security/authority-signer.service.js';

export type WalletSyncCheckStatus = 'ok' | 'error' | 'skipped';

export type WalletSyncReadinessCheck = {
  name:
    | 'live-sync'
    | 'wallet-whitelist-program-id'
    | 'authority-signer'
    | 'squads-governance'
    | 'solana-rpc'
    | 'wallet-whitelist-program';
  status: WalletSyncCheckStatus;
  detail: string;
};

export type WalletSyncReadiness = {
  enabled: boolean;
  ready: boolean;
  mode: 'preview' | 'direct' | 'squads';
  network: string;
  rpcUrl: string;
  signingMode: 'filesystem' | 'environment';
  checks: WalletSyncReadinessCheck[];
};

@Injectable()
export class WalletSyncReadinessService implements OnModuleInit {
  private readonly logger = new Logger(WalletSyncReadinessService.name);
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(AuthoritySignerService)
    private readonly authoritySignerService: Pick<AuthoritySignerService, 'getStatus'>,
    @Inject(SquadsService)
    private readonly squadsService: Pick<SquadsService, 'isEnabled'>,
  ) {}

  async onModuleInit() {
    const readiness = this.getStartupReadiness();

    if (!readiness.ready) {
      const message = this.getFailureMessage(readiness);
      this.logger.error(message);
      throw new Error(message);
    }
  }

  getStartupReadiness(): WalletSyncReadiness {
    return this.composeReadiness(this.getStaticChecks());
  }

  async getReadiness(): Promise<WalletSyncReadiness> {
    const startupReadiness = this.getStartupReadiness();

    if (!this.env.SOLANA_SYNC_ENABLED || !startupReadiness.ready) {
      return startupReadiness;
    }

    const dynamicChecks = await this.getConnectionReadinessChecks(
      new PublicKey(this.env.PROGRAM_ID_WALLET_WHITELIST),
    );

    return this.composeReadiness([...startupReadiness.checks, ...dynamicChecks]);
  }

  async assertLiveSyncReady() {
    const readiness = await this.getReadiness();

    if (!readiness.ready) {
      throw new Error(this.getFailureMessage(readiness));
    }
  }

  getFailureMessage(readiness: WalletSyncReadiness): string {
    const failures = readiness.checks
      .filter((check) => check.status === 'error')
      .map((check) => check.detail);

    if (failures.length === 0) {
      return 'Wallet sync is not ready for live Solana execution.';
    }

    return `Wallet sync is not ready for live Solana execution: ${failures.join('; ')}`;
  }

  protected async getConnectionReadinessChecks(
    programId: PublicKey,
  ): Promise<WalletSyncReadinessCheck[]> {
    const connection = new Connection(this.env.SOLANA_RPC_URL, 'confirmed');

    try {
      await connection.getLatestBlockhash('confirmed');
    } catch (error) {
      return [
        {
          name: 'solana-rpc',
          status: 'error',
          detail: `Solana RPC is unreachable at ${this.env.SOLANA_RPC_URL}: ${this.toErrorMessage(error)}`,
        },
        {
          name: 'wallet-whitelist-program',
          status: 'skipped',
          detail: 'Skipped wallet whitelist program lookup because Solana RPC is unavailable.',
        },
      ];
    }

    const checks: WalletSyncReadinessCheck[] = [
      {
        name: 'solana-rpc',
        status: 'ok',
        detail: `Solana RPC responded successfully at ${this.env.SOLANA_RPC_URL}.`,
      },
    ];

    try {
      const accountInfo = await connection.getAccountInfo(programId, 'confirmed');

      if (!accountInfo) {
        checks.push({
          name: 'wallet-whitelist-program',
          status: 'error',
          detail: `Wallet whitelist program ${programId.toBase58()} was not found on ${this.env.SOLANA_NETWORK}.`,
        });
      } else if (!accountInfo.executable) {
        checks.push({
          name: 'wallet-whitelist-program',
          status: 'error',
          detail: `Wallet whitelist program ${programId.toBase58()} exists but is not executable.`,
        });
      } else {
        checks.push({
          name: 'wallet-whitelist-program',
          status: 'ok',
          detail: `Wallet whitelist program ${programId.toBase58()} is deployed and executable.`,
        });
      }
    } catch (error) {
      checks.push({
        name: 'wallet-whitelist-program',
        status: 'error',
        detail: `Wallet whitelist program lookup failed for ${programId.toBase58()}: ${this.toErrorMessage(error)}`,
      });
    }

    return checks;
  }

  private composeReadiness(checks: WalletSyncReadinessCheck[]): WalletSyncReadiness {
    return {
      enabled: this.env.SOLANA_SYNC_ENABLED,
      ready: !checks.some((check) => check.status === 'error'),
      mode: this.getMode(),
      network: this.env.SOLANA_NETWORK,
      rpcUrl: this.env.SOLANA_RPC_URL,
      signingMode: this.env.SOLANA_SIGNING_MODE,
      checks,
    };
  }

  private getStaticChecks(): WalletSyncReadinessCheck[] {
    if (!this.env.SOLANA_SYNC_ENABLED) {
      return [
        {
          name: 'live-sync',
          status: 'skipped',
          detail: 'Live Solana sync is disabled; wallet approvals remain in preview mode.',
        },
      ];
    }

    const checks: WalletSyncReadinessCheck[] = [
      {
        name: 'live-sync',
        status: 'ok',
        detail: `Live Solana sync is enabled in ${this.getMode()} mode.`,
      },
    ];

    if (!isValidSolanaAddress(this.env.PROGRAM_ID_WALLET_WHITELIST)) {
      checks.push({
        name: 'wallet-whitelist-program-id',
        status: 'error',
        detail: 'PROGRAM_ID_WALLET_WHITELIST is not a valid Solana public key.',
      });
    } else {
      checks.push({
        name: 'wallet-whitelist-program-id',
        status: 'ok',
        detail: `PROGRAM_ID_WALLET_WHITELIST is set to ${this.env.PROGRAM_ID_WALLET_WHITELIST}.`,
      });
    }

    checks.push(this.getAuthoritySignerCheck(this.authoritySignerService.getStatus()));

    if (!this.env.SQUADS_MULTISIG_ENABLED) {
      checks.push({
        name: 'squads-governance',
        status: 'skipped',
        detail: 'Squads multisig is disabled; direct signer execution will be used.',
      });
      return checks;
    }

    if (!this.env.SQUADS_MULTISIG_ADDRESS) {
      checks.push({
        name: 'squads-governance',
        status: 'error',
        detail: 'SQUADS_MULTISIG_ADDRESS is required when Squads multisig is enabled.',
      });
      return checks;
    }

    if (!isValidSolanaAddress(this.env.SQUADS_MULTISIG_ADDRESS)) {
      checks.push({
        name: 'squads-governance',
        status: 'error',
        detail: 'SQUADS_MULTISIG_ADDRESS is not a valid Solana public key.',
      });
      return checks;
    }

    if (!this.squadsService.isEnabled()) {
      checks.push({
        name: 'squads-governance',
        status: 'error',
        detail: 'Squads multisig is enabled but the governance service is not initialized.',
      });
      return checks;
    }

    checks.push({
      name: 'squads-governance',
      status: 'ok',
      detail: `Squads multisig is configured for ${this.env.SQUADS_MULTISIG_ADDRESS}.`,
    });

    return checks;
  }

  private getAuthoritySignerCheck(status: AuthoritySignerStatus): WalletSyncReadinessCheck {
    if (!status.configured) {
      return {
        name: 'authority-signer',
        status: 'error',
        detail:
          status.signingMode === 'environment'
            ? 'AUTHORITY_KEYPAIR_JSON is required when SOLANA_SIGNING_MODE is set to environment.'
            : 'AUTHORITY_KEYPAIR_PATH is required when SOLANA_SIGNING_MODE is set to filesystem.',
      };
    }

    if (!status.initialized) {
      return {
        name: 'authority-signer',
        status: 'error',
        detail: status.error ?? 'Solana authority signer failed to initialize.',
      };
    }

    return {
      name: 'authority-signer',
      status: 'ok',
      detail: `Authority signer loaded in ${status.signingMode} mode as ${status.publicKey}.`,
    };
  }

  private getMode(): WalletSyncReadiness['mode'] {
    if (!this.env.SOLANA_SYNC_ENABLED) {
      return 'preview';
    }

    return this.env.SQUADS_MULTISIG_ENABLED ? 'squads' : 'direct';
  }

  private toErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
