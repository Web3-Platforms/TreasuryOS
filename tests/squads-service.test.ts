import assert from 'node:assert/strict';
import test from 'node:test';

import { Keypair } from '@solana/web3.js';

import { SquadsService } from '../apps/api-gateway/src/modules/governance/squads.service.js';
import { AuthoritySignerService } from '../apps/api-gateway/src/modules/security/authority-signer.service.js';

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

class TestSquadsService extends SquadsService {
  importCalls = 0;

  constructor() {
    super(
      {
        getSigner: () => Keypair.generate(),
      } as AuthoritySignerService,
    );
  }

  protected override async importMultisigModule() {
    this.importCalls += 1;
    throw new Error('multisig import failed');
  }
}

test('squads service skips loading the Squads SDK when multisig is disabled', async () => {
  const env = withApiEnv({
    SQUADS_MULTISIG_ENABLED: 'false',
    SOLANA_SYNC_ENABLED: 'false',
  });

  try {
    const service = new TestSquadsService();

    await service.onModuleInit();

    assert.equal(service.importCalls, 0);
    assert.equal(service.isEnabled(), false);
  } finally {
    env.restore();
  }
});

test('squads service tolerates Squads SDK load failures in preview mode', async () => {
  const env = withApiEnv({
    SQUADS_MULTISIG_ENABLED: 'true',
    SQUADS_MULTISIG_ADDRESS: Keypair.generate().publicKey.toBase58(),
    SOLANA_SYNC_ENABLED: 'false',
  });

  try {
    const service = new TestSquadsService();

    await service.onModuleInit();

    assert.equal(service.importCalls, 1);
    assert.equal(service.isEnabled(), false);
  } finally {
    env.restore();
  }
});

test('squads service fails fast when live sync requires a working Squads SDK', async () => {
  const env = withApiEnv({
    SQUADS_MULTISIG_ENABLED: 'true',
    SQUADS_MULTISIG_ADDRESS: Keypair.generate().publicKey.toBase58(),
    SOLANA_SYNC_ENABLED: 'true',
  });

  try {
    const service = new TestSquadsService();

    await assert.rejects(service.onModuleInit(), /Failed to load @sqds\/multisig/);
    assert.equal(service.importCalls, 1);
  } finally {
    env.restore();
  }
});
