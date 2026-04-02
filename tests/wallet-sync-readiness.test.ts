import assert from 'node:assert/strict';
import test from 'node:test';

import { Keypair } from '@solana/web3.js';

import {
  WalletSyncReadinessService,
  type WalletSyncReadinessCheck,
} from '../apps/api-gateway/src/modules/wallets/wallet-sync-readiness.service.js';

function withApiEnv(overrides: Record<string, string> = {}) {
  const originalEnv = { ...process.env };

  Object.assign(process.env, {
    NODE_ENV: 'test',
    AUTH_TOKEN_SECRET: '12345678901234567890123456789012',
    DEFAULT_ADMIN_EMAIL: 'admin@example.com',
    DEFAULT_ADMIN_PASSWORD: 'password123',
    DEFAULT_COMPLIANCE_EMAIL: 'compliance@example.com',
    DEFAULT_COMPLIANCE_PASSWORD: 'password123',
    DEFAULT_AUDITOR_EMAIL: 'auditor@example.com',
    DEFAULT_AUDITOR_PASSWORD: 'password123',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/treasury_os',
    SOLANA_RPC_URL: 'https://api.testnet.solana.com',
    SOLANA_NETWORK: 'testnet',
    PROGRAM_ID_WALLET_WHITELIST: Keypair.generate().publicKey.toBase58(),
    SOLANA_SIGNING_MODE: 'filesystem',
    SOLANA_SYNC_ENABLED: 'false',
    SQUADS_MULTISIG_ENABLED: 'false',
    ...overrides,
  });

  return {
    restore() {
      process.env = originalEnv;
    },
  };
}

class TestWalletSyncReadinessService extends WalletSyncReadinessService {
  constructor(
    authoritySignerService: { getStatus(): any },
    squadsService: { isEnabled(): boolean },
    private readonly dynamicChecks: WalletSyncReadinessCheck[] = [],
  ) {
    super(authoritySignerService, squadsService);
  }

  protected override async getConnectionReadinessChecks() {
    return this.dynamicChecks;
  }
}

function createSignerStatus(overrides: Partial<ReturnType<typeof baseSignerStatus>> = {}) {
  return {
    ...baseSignerStatus(),
    ...overrides,
  };
}

function baseSignerStatus() {
  return {
    configured: true,
    initialized: true,
    signingMode: 'filesystem' as const,
    publicKey: Keypair.generate().publicKey.toBase58(),
  };
}

test('wallet sync readiness reports preview mode when live sync is disabled', async () => {
  const env = withApiEnv();

  try {
    const service = new TestWalletSyncReadinessService(
      { getStatus: () => createSignerStatus({ configured: false, initialized: false }) },
      { isEnabled: () => false },
    );

    await service.onModuleInit();
    const readiness = await service.getReadiness();

    assert.equal(readiness.enabled, false);
    assert.equal(readiness.mode, 'preview');
    assert.equal(readiness.ready, true);
    assert.equal(readiness.checks.length, 1);
    assert.equal(readiness.checks[0]?.status, 'skipped');
  } finally {
    env.restore();
  }
});

test('wallet sync readiness rejects invalid program ids when live sync is enabled', async () => {
  const env = withApiEnv({
    SOLANA_SYNC_ENABLED: 'true',
    PROGRAM_ID_WALLET_WHITELIST: 'not-a-valid-solana-public-key-12345678901234567890',
  });

  try {
    const service = new TestWalletSyncReadinessService(
      { getStatus: () => createSignerStatus() },
      { isEnabled: () => false },
    );

    await assert.rejects(service.onModuleInit(), /PROGRAM_ID_WALLET_WHITELIST/);
  } finally {
    env.restore();
  }
});

test('wallet sync readiness rejects missing signer material when live sync is enabled', async () => {
  const env = withApiEnv({
    SOLANA_SYNC_ENABLED: 'true',
    SOLANA_SIGNING_MODE: 'environment',
  });

  try {
    const service = new TestWalletSyncReadinessService(
      {
        getStatus: () =>
          createSignerStatus({
            configured: false,
            initialized: false,
            signingMode: 'environment',
            publicKey: undefined,
          }),
      },
      { isEnabled: () => false },
    );

    await assert.rejects(service.onModuleInit(), /AUTHORITY_KEYPAIR_JSON/);
  } finally {
    env.restore();
  }
});

test('wallet sync readiness surfaces RPC failures before live execution', async () => {
  const env = withApiEnv({
    SOLANA_SYNC_ENABLED: 'true',
  });

  try {
    const service = new TestWalletSyncReadinessService(
      { getStatus: () => createSignerStatus() },
      { isEnabled: () => false },
      [
        {
          name: 'solana-rpc',
          status: 'error',
          detail: 'Solana RPC is unreachable at https://api.testnet.solana.com: timeout',
        },
        {
          name: 'wallet-whitelist-program',
          status: 'skipped',
          detail: 'Skipped wallet whitelist program lookup because Solana RPC is unavailable.',
        },
      ],
    );

    const readiness = await service.getReadiness();

    assert.equal(readiness.ready, false);
    await assert.rejects(service.assertLiveSyncReady(), /Solana RPC is unreachable/);
  } finally {
    env.restore();
  }
});

test('wallet sync readiness rejects uninitialized Squads governance when multisig is enabled', async () => {
  const env = withApiEnv({
    SOLANA_SYNC_ENABLED: 'true',
    SQUADS_MULTISIG_ENABLED: 'true',
    SQUADS_MULTISIG_ADDRESS: Keypair.generate().publicKey.toBase58(),
  });

  try {
    const service = new TestWalletSyncReadinessService(
      { getStatus: () => createSignerStatus() },
      { isEnabled: () => false },
    );

    await assert.rejects(service.onModuleInit(), /governance service is not initialized/);
  } finally {
    env.restore();
  }
});
