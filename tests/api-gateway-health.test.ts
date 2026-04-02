import assert from 'node:assert/strict';
import test from 'node:test';

import { ServiceUnavailableException } from '@nestjs/common';

import { HealthController } from '../apps/api-gateway/src/modules/health/health.controller.js';
import type { WalletSyncReadiness } from '../apps/api-gateway/src/modules/wallets/wallet-sync-readiness.service.js';

function withApiEnv(overrides: Record<string, string> = {}) {
  const originalEnv = { ...process.env };

  Object.assign(process.env, {
    NODE_ENV: 'test',
    AUTH_TOKEN_SECRET: '12345678901234567890123456789012',
    SEED_DEFAULT_USERS: 'true',
    DEFAULT_ADMIN_EMAIL: 'admin@example.com',
    DEFAULT_ADMIN_PASSWORD: 'password123',
    DEFAULT_COMPLIANCE_EMAIL: 'compliance@example.com',
    DEFAULT_COMPLIANCE_PASSWORD: 'password123',
    DEFAULT_AUDITOR_EMAIL: 'auditor@example.com',
    DEFAULT_AUDITOR_PASSWORD: 'password123',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/treasury_os',
    PROGRAM_ID_WALLET_WHITELIST: '3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c',
    ...overrides,
  });

  return {
    restore() {
      process.env = originalEnv;
    },
  };
}

function createReadiness(overrides: Partial<WalletSyncReadiness> = {}): WalletSyncReadiness {
  return {
    enabled: false,
    ready: true,
    mode: 'preview',
    network: 'testnet',
    rpcUrl: 'https://api.testnet.solana.com',
    signingMode: 'filesystem',
    checks: [
      {
        name: 'live-sync',
        status: 'skipped',
        detail: 'Live Solana sync is disabled; wallet approvals remain in preview mode.',
      },
    ],
    ...overrides,
  };
}

test('health live endpoint reports basic service status', async () => {
  const env = withApiEnv();

  try {
    const controller = new HealthController(
      { getPool: () => ({ query: async () => ({}) }) },
      {
        getStartupReadiness: () => createReadiness(),
        getReadiness: async () => createReadiness(),
      },
    );

    const payload = controller.getLive();

    assert.equal(payload.status, 'ok');
    assert.equal(typeof payload.service, 'string');
    assert.equal(typeof payload.version, 'string');
  } finally {
    env.restore();
  }
});

test('health ready endpoint includes wallet sync readiness when dependencies are healthy', async () => {
  const env = withApiEnv();

  try {
    const readiness = createReadiness();
    const controller = new HealthController(
      { getPool: () => ({ query: async () => ({}) }) },
      {
        getStartupReadiness: () => readiness,
        getReadiness: async () => readiness,
      },
    );

    const payload = await controller.getReady();

    assert.equal(payload.status, 'ok');
    assert.equal(payload.checks.database, 'ok');
    assert.equal(payload.checks.walletSync.ready, true);
  } finally {
    env.restore();
  }
});

test('health ready endpoint fails when wallet sync readiness fails', async () => {
  const env = withApiEnv();

  try {
    const controller = new HealthController(
      { getPool: () => ({ query: async () => ({}) }) },
      {
        getStartupReadiness: () => createReadiness(),
        getReadiness: async () =>
          createReadiness({
            enabled: true,
            ready: false,
            mode: 'direct',
            checks: [
              {
                name: 'solana-rpc',
                status: 'error',
                detail: 'Solana RPC is unreachable at https://api.testnet.solana.com: timeout',
              },
            ],
          }),
      },
    );

    await assert.rejects(
      controller.getReady(),
      (error) =>
        error instanceof ServiceUnavailableException &&
        error.getStatus() === 503,
    );
  } finally {
    env.restore();
  }
});
