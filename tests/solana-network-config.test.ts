import assert from 'node:assert/strict';
import test from 'node:test';

import { loadApiGatewayEnv } from '../apps/api-gateway/src/config/env.js';
import { loadKycServiceEnv } from '../apps/kyc-service/src/config/env.js';

test('api gateway accepts explicit Solana testnet network labels', () => {
  const env = loadApiGatewayEnv({
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
    PROGRAM_ID_WALLET_WHITELIST: '3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c',
  });

  assert.equal(env.SOLANA_RPC_URL, 'https://api.testnet.solana.com');
  assert.equal(env.SOLANA_NETWORK, 'testnet');
});

test('kyc service defaults Solana network to devnet but accepts testnet overrides', () => {
  const defaultEnv = loadKycServiceEnv({
    NODE_ENV: 'test',
    SOLANA_RPC_URL: 'https://api.devnet.solana.com',
    PROGRAM_ID_COMPLIANCE_REGISTRY: 'ASG5VS1jFQSsLfyuACNvfK2oFsoBd4TQjJBK1uvznorm',
  });
  assert.equal(defaultEnv.SOLANA_NETWORK, 'devnet');

  const testnetEnv = loadKycServiceEnv({
    NODE_ENV: 'test',
    SOLANA_RPC_URL: 'https://api.testnet.solana.com',
    SOLANA_NETWORK: 'testnet',
    PROGRAM_ID_COMPLIANCE_REGISTRY: 'ASG5VS1jFQSsLfyuACNvfK2oFsoBd4TQjJBK1uvznorm',
  });
  assert.equal(testnetEnv.SOLANA_NETWORK, 'testnet');
});
