import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadApiGatewayEnv,
  resolveApiGatewayCorsOrigins,
} from '../apps/api-gateway/src/config/env.js';

function createProductionEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    NODE_ENV: 'production',
    AUTH_TOKEN_SECRET: '12345678901234567890123456789012',
    SEED_DEFAULT_USERS: 'true',
    DEFAULT_ADMIN_EMAIL: 'admin@example.com',
    DEFAULT_ADMIN_PASSWORD: 'password123',
    DEFAULT_COMPLIANCE_EMAIL: 'compliance@example.com',
    DEFAULT_COMPLIANCE_PASSWORD: 'password123',
    DEFAULT_AUDITOR_EMAIL: 'auditor@example.com',
    DEFAULT_AUDITOR_PASSWORD: 'password123',
    DATABASE_URL: 'postgresql://postgres:postgres@db.example.com:5432/treasury_os',
    DATABASE_SSL: 'true',
    REDIS_QUEUE_ENABLED: 'false',
    FRONTEND_URL: 'https://app.example.com',
    PROGRAM_ID_WALLET_WHITELIST: '3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c',
    ...overrides,
  };
}

test('api gateway accepts hardened production environment settings', () => {
  const env = loadApiGatewayEnv(createProductionEnv());

  assert.equal(env.NODE_ENV, 'production');
  assert.equal(env.DATABASE_SSL, true);
  assert.equal(env.FRONTEND_URL, 'https://app.example.com');
  assert.deepEqual(resolveApiGatewayCorsOrigins(env), ['https://app.example.com']);
});

test('api gateway rejects production boot without FRONTEND_URL', () => {
  const env = createProductionEnv();
  delete env.FRONTEND_URL;

  assert.throws(
    () => loadApiGatewayEnv(env),
    /FRONTEND_URL is required in production/,
  );
});

test('api gateway rejects FRONTEND_URL values with trailing slashes', () => {
  assert.throws(
    () =>
      loadApiGatewayEnv(
        createProductionEnv({
          FRONTEND_URL: 'https://app.example.com/',
        }),
      ),
    /FRONTEND_URL must not include a trailing slash/,
  );
});

test('api gateway rejects DATABASE_SSL=false in production', () => {
  assert.throws(
    () =>
      loadApiGatewayEnv(
        createProductionEnv({
          DATABASE_SSL: 'false',
        }),
      ),
    /DATABASE_SSL must be true in production/,
  );
});

test('api gateway rejects partial Upstash REST configuration', () => {
  assert.throws(
    () =>
      loadApiGatewayEnv(
        createProductionEnv({
          UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
        }),
      ),
    /UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together/,
  );
});

test('api gateway rejects loopback Redis queue targets in production', () => {
  assert.throws(
    () =>
      loadApiGatewayEnv(
        createProductionEnv({
          REDIS_QUEUE_ENABLED: 'true',
          REDIS_URL: 'redis://localhost:6379',
        }),
      ),
    /Configure Upstash REST credentials or a non-loopback REDIS_URL/,
  );
});

test('api gateway allows production queues when a real Redis transport is configured', () => {
  const env = loadApiGatewayEnv(
    createProductionEnv({
      REDIS_QUEUE_ENABLED: 'true',
      REDIS_URL: 'rediss://default:token@cache.example.com:6380',
    }),
  );

  assert.equal(env.REDIS_QUEUE_ENABLED, true);
  assert.equal(env.REDIS_URL, 'rediss://default:token@cache.example.com:6380');
});

test('api gateway rejects openai-compatible AI config without an API key', () => {
  assert.throws(
    () =>
      loadApiGatewayEnv(
        createProductionEnv({
          AI_ADVISORY_ENABLED: 'true',
          AI_PROVIDER: 'openai-compatible',
          AI_ADVISORY_MODEL: 'gpt-4.1-mini',
        }),
      ),
    /AI_PROVIDER_API_KEY is required/,
  );
});

test('api gateway accepts openai-compatible AI config with provider credentials', () => {
  const env = loadApiGatewayEnv(
    createProductionEnv({
      AI_ADVISORY_ENABLED: 'true',
      AI_PROVIDER: 'openai-compatible',
      AI_PROVIDER_API_KEY: 'test-openai-key',
      AI_PROVIDER_BASE_URL: 'https://llm.example.com/v1',
      AI_ADVISORY_MODEL: 'gpt-4.1-mini',
      AI_PROMPT_VERSION: 'tx-case-v2',
    }),
  );

  assert.equal(env.AI_PROVIDER, 'openai-compatible');
  assert.equal(env.AI_ADVISORY_MODEL, 'gpt-4.1-mini');
  assert.equal(env.AI_PROVIDER_API_KEY, 'test-openai-key');
});

test('api gateway rejects openrouter AI config without an API key', () => {
  assert.throws(
    () =>
      loadApiGatewayEnv(
        createProductionEnv({
          AI_ADVISORY_ENABLED: 'true',
          AI_PROVIDER: 'openrouter',
          AI_ADVISORY_MODEL: 'openai/gpt-4.1-mini',
        }),
      ),
    /AI_PROVIDER_API_KEY is required/,
  );
});

test('api gateway accepts openrouter AI config and resolves the default base URL', () => {
  const env = loadApiGatewayEnv(
    createProductionEnv({
      AI_ADVISORY_ENABLED: 'true',
      AI_PROVIDER: 'openrouter',
      AI_PROVIDER_API_KEY: 'test-openrouter-key',
      AI_ADVISORY_MODEL: 'openai/gpt-4.1-mini',
      AI_PROMPT_VERSION: 'tx-case-v2',
    }),
  );

  assert.equal(env.AI_PROVIDER, 'openrouter');
  assert.equal(env.AI_ADVISORY_MODEL, 'openai/gpt-4.1-mini');
  assert.equal(env.AI_PROVIDER_API_KEY, 'test-openrouter-key');
  assert.equal(env.AI_PROVIDER_BASE_URL, 'https://openrouter.ai/api/v1');
});

test('api gateway development CORS keeps localhost origins plus optional frontend', () => {
  const env = loadApiGatewayEnv(
    createProductionEnv({
      NODE_ENV: 'development',
      DATABASE_SSL: 'false',
      FRONTEND_URL: 'https://preview.example.com',
    }),
  );

  assert.deepEqual(resolveApiGatewayCorsOrigins(env), [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://preview.example.com',
  ]);
});
