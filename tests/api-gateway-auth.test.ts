import 'reflect-metadata';

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import fs from 'node:fs';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { NestFactory } from '@nestjs/core';
import jwt from 'jsonwebtoken';
import { Keypair } from '@solana/web3.js';
import { ChainSyncStatus, UserRole, WalletStatus } from '@treasuryos/types';
import { Pool } from 'pg';

import { AppModule } from '../apps/api-gateway/src/app.module.js';
import { AuthService } from '../apps/api-gateway/src/modules/auth/auth.service.js';
import { DatabaseService } from '../apps/api-gateway/src/modules/database/database.service.js';
import { WalletSyncService } from '../apps/api-gateway/src/modules/wallets/wallet-sync.service.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let databaseMigrated = false;

const TEST_SUPABASE_JWT_SECRET = 'test-supabase-jwt-secret-that-is-32-chars!!';

function withApiEnv(overrides: Record<string, string> = {}) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'treasuryos-auth-'));
  const authorityKeypairPath = path.join(tempRoot, 'id.json');
  const originalEnv = { ...process.env };
  const authorityKeypair = Keypair.generate();

  fs.writeFileSync(authorityKeypairPath, JSON.stringify(Array.from(authorityKeypair.secretKey)));

  Object.assign(process.env, {
    NODE_ENV: 'test',
    API_GATEWAY_PORT: '3001',
    AUTH_TOKEN_SECRET: 'test-secret-that-is-long-enough-for-phase-zero',
    AUTH_TOKEN_TTL_MINUTES: '120',
    PILOT_DATA_FILE: path.join(tempRoot, 'pilot-store.json'),
    PILOT_REPORTS_DIR: path.join(tempRoot, 'reports'),
    PILOT_INSTITUTION_ID: 'pilot-eu-casp',
    PILOT_INSTITUTION_NAME: 'TreasuryOS Pilot Institution',
    PILOT_CUSTOMER_PROFILE: 'eu-regulated-casp',
    SEED_DEFAULT_USERS: 'true',
    DEFAULT_ADMIN_EMAIL: 'admin@treasuryos.local',
    DEFAULT_ADMIN_PASSWORD: 'change-me-admin',
    DEFAULT_COMPLIANCE_EMAIL: 'compliance@treasuryos.local',
    DEFAULT_COMPLIANCE_PASSWORD: 'change-me-compliance',
    DEFAULT_AUDITOR_EMAIL: 'auditor@treasuryos.local',
    DEFAULT_AUDITOR_PASSWORD: 'change-me-auditor',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/treasury_os',
    DATABASE_SSL: 'false',
    REDIS_URL: 'redis://127.0.0.1:6399',
    REDIS_QUEUE_ENABLED: 'false',
    REDIS_QUEUE_NAME: 'treasuryos:test-events',
    KYC_SUMSUB_ENABLED: 'false',
    SUMSUB_APP_TOKEN: 'sumsub-app-token',
    SUMSUB_SECRET_KEY: 'sumsub-secret-key',
    SUMSUB_LEVEL_NAME: 'basic-kyc-level',
    SUMSUB_WEBHOOK_SECRET: 'sumsub-webhook-secret',
    SOLANA_RPC_URL: 'https://api.devnet.solana.com',
    PROGRAM_ID_WALLET_WHITELIST: 'FXFMG4hzBcuRu33mVXyTHESH7FnsmUD6Fajr17FugbRt',
    AUTHORITY_KEYPAIR_PATH: authorityKeypairPath,
    SOLANA_SIGNING_MODE: 'filesystem',
    SOLANA_SYNC_ENABLED: 'false',
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3001',
    SUPABASE_JWT_SECRET: TEST_SUPABASE_JWT_SECRET,
    ...overrides,
  });

  return {
    restore() {
      process.env = originalEnv;
      fs.rmSync(tempRoot, { force: true, recursive: true });
    },
    tempRoot,
  };
}

async function bootstrapApiApp(options: { seedUsers?: boolean } = {}) {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(0);

  if (options.seedUsers !== false) {
    await app.get(DatabaseService).ensureSeedUsers();
  }

  const address = app.getHttpServer().address() as AddressInfo;
  return {
    app,
    baseUrl: `http://127.0.0.1:${address.port}/api`,
  };
}

function runSeedUsersScript(env: NodeJS.ProcessEnv) {
  execFileSync(process.execPath, ['./node_modules/tsx/dist/cli.mjs', 'scripts/seed-default-users.ts'], {
    cwd: repoRoot,
    env,
    stdio: 'pipe',
  });
}

async function login(baseUrl: string, email: string, password: string) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  assert.equal(response.status, 200);
  const data = await response.json() as { accessToken?: string; user?: { id: string; email: string } };
  assert.equal(typeof data.user?.id, 'string');
  assert.equal(typeof data.user?.email, 'string');

  const accessToken = jwt.sign(
    { sub: data.user!.id, email: data.user!.email },
    process.env.AUTH_TOKEN_SECRET!,
    { expiresIn: '1h' },
  );

  return { ...data, accessToken };
}

function signSumsubWebhook(body: string, secret: string) {
  return createHmac('sha256', secret).update(Buffer.from(body)).digest('hex');
}

function ensureDatabaseMigrated() {
  if (databaseMigrated) {
    return;
  }

  execFileSync(process.execPath, ['./node_modules/tsx/dist/cli.mjs', 'scripts/db-migrate.ts'], {
    cwd: repoRoot,
    env: process.env,
    stdio: 'pipe',
  });
  databaseMigrated = true;
}

async function resetDatabase() {
  ensureDatabaseMigrated();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pool.query(
      `
        truncate table
          ai_advisories,
          auth_sessions,
          audit_events,
          provider_webhooks,
          report_jobs,
          transaction_cases,
          wallets,
          entities,
          app_users
        restart identity cascade
      `,
    );
  } finally {
    await pool.end();
  }
}

test('auth service validates credentials and returns user info', async () => {
  const fixture = withApiEnv();
  let app: Awaited<ReturnType<typeof bootstrapApiApp>>['app'] | undefined;
  try {
    await resetDatabase();
    const started = await bootstrapApiApp();
    app = started.app;

    const authService = app.get(AuthService);

    const loginResponse = await authService.login(
      {
        email: 'admin@treasuryos.local',
        password: 'change-me-admin',
      },
      {
        ipAddress: '127.0.0.1',
        userAgent: 'node-test',
      },
    );

    assert.equal(loginResponse.user.email, 'admin@treasuryos.local');
    assert.deepEqual(loginResponse.user.roles, [UserRole.Admin]);

    await assert.rejects(
      authService.login({ email: 'admin@treasuryos.local', password: 'wrong-password' }, {}),
      /Invalid credentials/,
    );
  } finally {
    if (app) {
      await app.close();
    }

    fixture.restore();
  }
});

test('default users can be bootstrapped manually when auto-seeding is disabled', async () => {
  const fixture = withApiEnv({
    SEED_DEFAULT_USERS: 'false',
  });
  let app: Awaited<ReturnType<typeof bootstrapApiApp>>['app'] | undefined;

  try {
    await resetDatabase();
    const started = await bootstrapApiApp({ seedUsers: false });
    app = started.app;

    const rejectedLogin = await fetch(`${started.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@treasuryos.local',
        password: 'change-me-admin',
      }),
    });

    assert.equal(rejectedLogin.status, 401);

    runSeedUsersScript(process.env);

    const loginResponse = await login(started.baseUrl, 'admin@treasuryos.local', 'change-me-admin');
    assert.equal(loginResponse.user?.email, 'admin@treasuryos.local');
  } finally {
    if (app) {
      await app.close();
    }

    fixture.restore();
  }
});

test('entity submission returns service unavailable when Sumsub KYC is disabled', async () => {
  const fixture = withApiEnv();
  let app: Awaited<ReturnType<typeof bootstrapApiApp>>['app'] | undefined;

  try {
    await resetDatabase();
    const started = await bootstrapApiApp();
    app = started.app;

    const complianceLogin = await login(started.baseUrl, 'compliance@treasuryos.local', 'change-me-compliance');
    const auditorLogin = await login(started.baseUrl, 'auditor@treasuryos.local', 'change-me-auditor');

    const createEntityResponse = await fetch(`${started.baseUrl}/entities`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        legalName: 'Sumsub Disabled GmbH',
        jurisdiction: 'EU',
        riskLevel: 'medium',
      }),
    });
    assert.equal(createEntityResponse.status, 201);
    const createdEntity = await createEntityResponse.json();

    const submitEntityResponse = await fetch(`${started.baseUrl}/entities/${createdEntity.id}/submit`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
      },
    });
    assert.equal(submitEntityResponse.status, 503);
    const submitEntityError = await submitEntityResponse.json() as { message?: string | string[] };
    assert.match(String(submitEntityError.message), /coming soon/i);

    const entityAfterFailedSubmitResponse = await fetch(`${started.baseUrl}/entities/${createdEntity.id}`, {
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
      },
    });
    assert.equal(entityAfterFailedSubmitResponse.status, 200);
    const entityAfterFailedSubmit = await entityAfterFailedSubmitResponse.json();
    assert.equal(entityAfterFailedSubmit.status, 'draft');
    assert.equal(entityAfterFailedSubmit.kycApplicantId, undefined);
  } finally {
    if (app) {
      await app.close();
    }

    fixture.restore();
  }
});

test('pilot manual KYC bypass approves an entity and unlocks wallet requests when Sumsub is disabled', async () => {
  const fixture = withApiEnv({ PILOT_ALLOW_MANUAL_KYC_BYPASS: 'true' });
  let app: Awaited<ReturnType<typeof bootstrapApiApp>>['app'] | undefined;

  try {
    await resetDatabase();
    const started = await bootstrapApiApp();
    app = started.app;

    const complianceLogin = await login(started.baseUrl, 'compliance@treasuryos.local', 'change-me-compliance');
    const auditorLogin = await login(started.baseUrl, 'auditor@treasuryos.local', 'change-me-auditor');

    const createEntityResponse = await fetch(`${started.baseUrl}/entities`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        legalName: 'Pilot Canary GmbH',
        jurisdiction: 'EU',
        riskLevel: 'medium',
      }),
    });
    assert.equal(createEntityResponse.status, 201);
    const createdEntity = await createEntityResponse.json();
    assert.equal(createdEntity.status, 'draft');
    assert.equal(createdEntity.kycStatus, 'Pending');

    const approveResponse = await fetch(`${started.baseUrl}/entities/${createdEntity.id}/approve`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        notes: 'Pilot manual KYC bypass for the first Solana canary',
      }),
    });
    assert.equal(approveResponse.status, 201);
    const approvedEntity = await approveResponse.json();
    assert.equal(approvedEntity.status, 'approved');
    assert.equal(approvedEntity.kycStatus, 'Approved');
    assert.equal(approvedEntity.latestKycReviewAnswer, 'GREEN');
    assert.equal(typeof approvedEntity.reviewedAt, 'string');

    const entityDetailResponse = await fetch(`${started.baseUrl}/entities/${createdEntity.id}`, {
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
      },
    });
    assert.equal(entityDetailResponse.status, 200);
    const entityDetail = await entityDetailResponse.json();
    assert.equal(entityDetail.status, 'approved');
    assert.equal(entityDetail.kycStatus, 'Approved');

    const walletRequestResponse = await fetch(`${started.baseUrl}/wallets`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        entityId: createdEntity.id,
        walletAddress: Keypair.generate().publicKey.toBase58(),
        label: 'Pilot treasury wallet',
      }),
    });
    assert.equal(walletRequestResponse.status, 201);
    const requestedWallet = await walletRequestResponse.json();
    assert.equal(requestedWallet.status, 'submitted');
    assert.equal(requestedWallet.chainSyncStatus, 'pending');
    assert.ok(requestedWallet.whitelistEntry);

    const auditResponse = await fetch(`${started.baseUrl}/audit/events?limit=25`, {
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
      },
    });
    assert.equal(auditResponse.status, 200);
    const auditPayload = await auditResponse.json() as {
      events: Array<{
        action: string;
        metadata?: Record<string, unknown>;
        resourceId: string;
        summary: string;
      }>;
    };
    const bypassAudit = auditPayload.events.find(
      (event) => event.action === 'entity.approved' && event.resourceId === createdEntity.id,
    );

    assert.ok(bypassAudit);
    assert.equal(bypassAudit.metadata?.manualKycBypass, true);
    assert.match(bypassAudit.summary, /pilot manual kyc bypass/i);
  } finally {
    if (app) {
      await app.close();
    }

    fixture.restore();
  }
});

test('editing an approved entity resets verification and allows pilot reapproval', async () => {
  const fixture = withApiEnv({ PILOT_ALLOW_MANUAL_KYC_BYPASS: 'true' });
  let app: Awaited<ReturnType<typeof bootstrapApiApp>>['app'] | undefined;

  try {
    await resetDatabase();
    const started = await bootstrapApiApp();
    app = started.app;

    const complianceLogin = await login(started.baseUrl, 'compliance@treasuryos.local', 'change-me-compliance');
    const auditorLogin = await login(started.baseUrl, 'auditor@treasuryos.local', 'change-me-auditor');

    const createEntityResponse = await fetch(`${started.baseUrl}/entities`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        legalName: 'Editable Pilot Entity GmbH',
        jurisdiction: 'EU',
        riskLevel: 'medium',
      }),
    });
    assert.equal(createEntityResponse.status, 201);
    const createdEntity = await createEntityResponse.json();

    const initialApproveResponse = await fetch(`${started.baseUrl}/entities/${createdEntity.id}/approve`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ notes: 'Initial pilot approval' }),
    });
    assert.equal(initialApproveResponse.status, 201);

    const updateEntityResponse = await fetch(`${started.baseUrl}/entities/${createdEntity.id}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        legalName: 'Editable Pilot Entity Holdings GmbH',
        notes: 'Updated entity profile before resubmission',
        riskLevel: 'high',
      }),
    });
    assert.equal(updateEntityResponse.status, 200);
    const updatedEntity = await updateEntityResponse.json();
    assert.equal(updatedEntity.status, 'draft');
    assert.equal(updatedEntity.kycStatus, 'Pending');
    assert.equal(updatedEntity.legalName, 'Editable Pilot Entity Holdings GmbH');
    assert.equal(updatedEntity.riskLevel, 'high');
    assert.equal(updatedEntity.kycApplicantId, undefined);
    assert.equal(updatedEntity.latestKycReviewAnswer, undefined);
    assert.equal(updatedEntity.reviewedAt, undefined);
    assert.equal(updatedEntity.submittedAt, undefined);

    const auditResponse = await fetch(`${started.baseUrl}/audit/events?limit=25`, {
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
      },
    });
    assert.equal(auditResponse.status, 200);
    const auditPayload = await auditResponse.json() as {
      events: Array<{
        action: string;
        metadata?: Record<string, unknown>;
        resourceId: string;
      }>;
    };
    const updateAudit = auditPayload.events.find(
      (event) => event.action === 'entity.updated' && event.resourceId === createdEntity.id,
    );
    assert.ok(updateAudit);
    assert.equal(updateAudit.metadata?.workflowReset, true);
    assert.equal(updateAudit.metadata?.previousStatus, 'approved');
    assert.equal(updateAudit.metadata?.previousKycStatus, 'Approved');

    const reapproveResponse = await fetch(`${started.baseUrl}/entities/${createdEntity.id}/approve`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ notes: 'Re-approved after entity update' }),
    });
    assert.equal(reapproveResponse.status, 201);
    const reapprovedEntity = await reapproveResponse.json();
    assert.equal(reapprovedEntity.status, 'approved');
    assert.equal(reapprovedEntity.kycStatus, 'Approved');
  } finally {
    if (app) {
      await app.close();
    }

    fixture.restore();
  }
});

test('wallet approval moves into proposal_pending when Squads proposal creation is used', async () => {
  const fixture = withApiEnv({
    PILOT_ALLOW_MANUAL_KYC_BYPASS: 'true',
    SQUADS_MULTISIG_ENABLED: 'true',
    SQUADS_MULTISIG_ADDRESS: Keypair.generate().publicKey.toBase58(),
  });
  let app: Awaited<ReturnType<typeof bootstrapApiApp>>['app'] | undefined;

  try {
    await resetDatabase();
    const started = await bootstrapApiApp();
    app = started.app;

    const complianceLogin = await login(started.baseUrl, 'compliance@treasuryos.local', 'change-me-compliance');
    const auditorLogin = await login(started.baseUrl, 'auditor@treasuryos.local', 'change-me-auditor');

    const createEntityResponse = await fetch(`${started.baseUrl}/entities`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        legalName: 'Squads Pending Wallet Entity GmbH',
        jurisdiction: 'EU',
        riskLevel: 'medium',
      }),
    });
    assert.equal(createEntityResponse.status, 201);
    const createdEntity = await createEntityResponse.json();

    const approveEntityResponse = await fetch(`${started.baseUrl}/entities/${createdEntity.id}/approve`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        notes: 'Pilot bypass approval for governance test',
      }),
    });
    assert.equal(approveEntityResponse.status, 201);

    const walletAddress = Keypair.generate().publicKey.toBase58();
    const requestWalletResponse = await fetch(`${started.baseUrl}/wallets`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        entityId: createdEntity.id,
        walletAddress,
        label: 'Governance pending wallet',
      }),
    });
    assert.equal(requestWalletResponse.status, 201);
    const requestedWallet = await requestWalletResponse.json();
    assert.equal(requestedWallet.status, WalletStatus.Submitted);
    assert.equal(requestedWallet.chainSyncStatus, ChainSyncStatus.Pending);

    const reviewWalletResponse = await fetch(`${started.baseUrl}/wallets/${requestedWallet.id}/review`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        notes: 'Move wallet into review before governance submission',
      }),
    });
    assert.equal(reviewWalletResponse.status, 201);

    const walletSyncService = app.get(WalletSyncService);
    walletSyncService.syncApprovedWallet = async () => ({
      chainSyncStatus: ChainSyncStatus.ProposalPending,
      executionPath: 'squads',
      signature: 'squads-proposal-7',
      whitelistEntry: '4kU8iv2wUSr9mt1C5iT68f1b7xWQ7HToTQBWaoZ5iXfP',
    });

    const approveWalletResponse = await fetch(`${started.baseUrl}/wallets/${requestedWallet.id}/approve`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        notes: 'Approve into Squads proposal path',
      }),
    });
    assert.equal(approveWalletResponse.status, 201);
    const approvedWallet = await approveWalletResponse.json();
    assert.equal(approvedWallet.status, WalletStatus.ProposalPending);
    assert.equal(approvedWallet.chainSyncStatus, ChainSyncStatus.ProposalPending);
    assert.equal(approvedWallet.chainTxSignature, 'squads-proposal-7');

    const auditResponse = await fetch(`${started.baseUrl}/audit/events?limit=25`, {
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
      },
    });
    assert.equal(auditResponse.status, 200);
    const auditPayload = await auditResponse.json() as {
      events: Array<{
        action: string;
        metadata?: Record<string, unknown>;
        resourceId: string;
      }>;
    };
    const walletApprovalAudit = auditPayload.events.find(
      (event) => event.action === 'wallet.approved' && event.resourceId === requestedWallet.id,
    );
    assert.ok(walletApprovalAudit);
    assert.equal(walletApprovalAudit.metadata?.chainSyncStatus, ChainSyncStatus.ProposalPending);
    assert.equal(walletApprovalAudit.metadata?.executionPath, 'squads');

    const screeningResponse = await fetch(`${started.baseUrl}/transaction-cases`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1250,
        asset: 'USDC',
        destinationWallet: Keypair.generate().publicKey.toBase58(),
        entityId: createdEntity.id,
        referenceId: 'tx-squads-pending-1',
        sourceWallet: walletAddress,
      }),
    });
    assert.equal(screeningResponse.status, 409);
    const screeningError = await screeningResponse.json() as { message?: string | string[] };
    const screeningMessage = Array.isArray(screeningError.message)
      ? screeningError.message.join(' ')
      : screeningError.message ?? '';
    assert.match(screeningMessage, /waiting for multisig proposal execution/i);

    const reportMonth = new Date().toISOString().slice(0, 7);
    const generateReportResponse = await fetch(`${started.baseUrl}/reports`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        month: reportMonth,
      }),
    });
    assert.equal(generateReportResponse.status, 201);
    const generatedReport = await generateReportResponse.json();
    assert.equal(generatedReport.metrics.approvedWalletCount, 1);

    const downloadReportResponse = await fetch(`${started.baseUrl}/reports/${generatedReport.id}/download`, {
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
      },
    });
    assert.equal(downloadReportResponse.status, 200);
    const reportCsv = await downloadReportResponse.text();
    assert.match(
      reportCsv,
      /approved_wallet_count,1,("?)(Wallets approved, pending governance execution, or synced during the reporting month)\1/,
    );
  } finally {
    if (app) {
      await app.close();
    }

    fixture.restore();
  }
});

test('rbac, onboarding, wallet governance, transaction review, AI advisories, and reporting work end to end when Sumsub is enabled', async () => {
  const fixture = withApiEnv({
    AI_ADVISORY_ENABLED: 'true',
    AI_PROVIDER: 'openai-compatible',
    AI_PROVIDER_API_KEY: 'test-openai-key',
    AI_PROVIDER_BASE_URL: 'https://llm.example.com/v1',
    AI_PROVIDER_TIMEOUT_MS: '3000',
    AI_ADVISORY_MODEL: 'gpt-4.1-mini',
    AI_PROMPT_VERSION: 'tx-case-v2',
    AI_ADVISORY_FALLBACK: 'deterministic',
    KYC_SUMSUB_ENABLED: 'true',
  });
  const originalFetch = globalThis.fetch;
  const sumsubWebhookSecret = process.env.SUMSUB_WEBHOOK_SECRET!;
  let llmMode: 'success' | 'failure' = 'success';
  let llmRequestCount = 0;
  let app: Awaited<ReturnType<typeof bootstrapApiApp>>['app'] | undefined;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (url.startsWith('https://llm.example.com/v1/chat/completions')) {
      llmRequestCount += 1;

      if (llmMode === 'failure') {
        return new Response(JSON.stringify({ error: { message: 'provider unavailable' } }), {
          status: 503,
          headers: {
            'content-type': 'application/json',
          },
        });
      }

      return new Response(JSON.stringify({
        id: 'chatcmpl-test-1',
        model: 'gpt-4.1-mini',
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary:
                  'Case tx-review-1 is a human-reviewed EU treasury transfer flagged by deterministic screening thresholds and should remain in manual review context.',
                recommendation:
                  'Keep the case in human review until beneficiary evidence and wallet ownership are explicitly reconciled in the review record.',
                riskFactors: [
                  'The travel-rule threshold screening rule fired for this transfer.',
                  'The entity is operating in a regulated treasury workflow that still requires human evidence review.',
                ],
                checklist: [
                  'Verify the beneficiary evidence attached to the case record.',
                  'Confirm source and destination wallet ownership against entity records.',
                ],
                confidence: 0.68,
              }),
            },
          },
        ],
      }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    }

    if (url.startsWith('https://api.sumsub.com')) {
      return new Response(JSON.stringify({ id: 'sumsub-applicant-1' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    }

    return originalFetch(input, init);
  };

  try {
    await resetDatabase();
    const started = await bootstrapApiApp();
    app = started.app;

    const complianceLogin = await login(started.baseUrl, 'compliance@treasuryos.local', 'change-me-compliance');
    const auditorLogin = await login(started.baseUrl, 'auditor@treasuryos.local', 'change-me-auditor');

    const auditorCreate = await fetch(`${started.baseUrl}/entities`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        legalName: 'ACME Treasury GmbH',
        jurisdiction: 'EU',
        riskLevel: 'medium',
      }),
    });
    assert.equal(auditorCreate.status, 403);

    const createEntityResponse = await fetch(`${started.baseUrl}/entities`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        legalName: 'ACME Treasury GmbH',
        jurisdiction: 'EU',
        riskLevel: 'medium',
      }),
    });
    assert.equal(createEntityResponse.status, 201);
    const createdEntity = await createEntityResponse.json();
    assert.equal(createdEntity.status, 'draft');

    const submitEntityResponse = await fetch(`${started.baseUrl}/entities/${createdEntity.id}/submit`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
      },
    });
    assert.equal(submitEntityResponse.status, 201);
    const submittedEntity = await submitEntityResponse.json();
    assert.equal(submittedEntity.status, 'kyc_pending');
    assert.equal(submittedEntity.kycApplicantId, 'sumsub-applicant-1');

    const webhookPayload = {
      applicantId: 'sumsub-applicant-1',
      correlationId: 'corr-green-1',
      createdAtMs: '2026-03-28 07:00:00.000',
      externalUserId: createdEntity.externalUserId,
      levelName: 'basic-kyc-level',
      reviewResult: {
        reviewAnswer: 'GREEN',
      },
      reviewStatus: 'completed',
      sandboxMode: true,
      type: 'applicantReviewed',
    };
    const webhookBody = JSON.stringify(webhookPayload);
    const webhookSignature = signSumsubWebhook(webhookBody, sumsubWebhookSecret);

    const webhookResponse = await fetch(`${started.baseUrl}/kyc/webhooks/sumsub`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-payload-digest': webhookSignature,
        'x-payload-digest-alg': 'HMAC_SHA256_HEX',
      },
      body: webhookBody,
    });
    assert.equal(webhookResponse.status, 200);
    const webhookResult = await webhookResponse.json();
    assert.equal(webhookResult.verified, true);
    assert.equal(webhookResult.duplicate, false);

    const entityAfterWebhookResponse = await fetch(`${started.baseUrl}/entities/${createdEntity.id}`, {
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
      },
    });
    assert.equal(entityAfterWebhookResponse.status, 200);
    const entityAfterWebhook = await entityAfterWebhookResponse.json();
    assert.equal(entityAfterWebhook.status, 'under_review');
    assert.equal(entityAfterWebhook.kycStatus, 'Approved');

    const duplicateWebhookResponse = await fetch(`${started.baseUrl}/kyc/webhooks/sumsub`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-payload-digest': webhookSignature,
        'x-payload-digest-alg': 'HMAC_SHA256_HEX',
      },
      body: webhookBody,
    });
    assert.equal(duplicateWebhookResponse.status, 200);
    const duplicateWebhookResult = await duplicateWebhookResponse.json();
    assert.equal(duplicateWebhookResult.duplicate, true);

    const prematureWalletRequest = await fetch(`${started.baseUrl}/wallets`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        entityId: createdEntity.id,
        walletAddress: Keypair.generate().publicKey.toBase58(),
        label: 'Pre-approval wallet',
      }),
    });
    assert.equal(prematureWalletRequest.status, 409);

    const auditorApprove = await fetch(`${started.baseUrl}/entities/${createdEntity.id}/approve`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    assert.equal(auditorApprove.status, 403);

    const complianceApprove = await fetch(`${started.baseUrl}/entities/${createdEntity.id}/approve`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        notes: 'KYC review completed successfully',
      }),
    });
    assert.equal(complianceApprove.status, 201);
    const approvedEntity = await complianceApprove.json();
    assert.equal(approvedEntity.status, 'approved');

    const walletAddress = Keypair.generate().publicKey.toBase58();

    const secondWalletRequest = await fetch(`${started.baseUrl}/wallets`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        entityId: createdEntity.id,
        walletAddress,
        label: 'Primary treasury wallet',
      }),
    });
    assert.equal(secondWalletRequest.status, 201);
    const requestedWallet = await secondWalletRequest.json();
    assert.equal(requestedWallet.status, 'submitted');
    assert.equal(requestedWallet.chainSyncStatus, 'pending');
    assert.ok(requestedWallet.whitelistEntry);

    const walletListResponse = await fetch(`${started.baseUrl}/wallets?entityId=${createdEntity.id}`, {
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
      },
    });
    assert.equal(walletListResponse.status, 200);
    const walletList = await walletListResponse.json();
    assert.ok(walletList.wallets.some((wallet: { id: string }) => wallet.id === requestedWallet.id));

    const reviewWalletResponse = await fetch(`${started.baseUrl}/wallets/${requestedWallet.id}/review`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        notes: 'Reviewed against internal treasury policy',
      }),
    });
    assert.equal(reviewWalletResponse.status, 201);
    const reviewWallet = await reviewWalletResponse.json();
    assert.equal(reviewWallet.status, 'under_review');

    const walletSyncService = app.get(WalletSyncService);
    walletSyncService.syncApprovedWallet = async () => ({
      chainSyncStatus: ChainSyncStatus.Sent,
      executionPath: 'direct',
      signature: '5N4P6xZ5YJ7aH8K9mQ2rS3tU4vW5xY6z7A8b9C0d1E2F3G4H5J6K7L8M9N',
      whitelistEntry: '9GpQFBNjN5qE6MfkW3UN2oWUtYr4A1v1C3m4v1Adq2Yx',
    });

    const auditorApproveWallet = await fetch(`${started.baseUrl}/wallets/${requestedWallet.id}/approve`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    assert.equal(auditorApproveWallet.status, 403);

    const approveWalletResponse = await fetch(`${started.baseUrl}/wallets/${requestedWallet.id}/approve`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        notes: 'Approved for devnet whitelist sync',
      }),
    });
    assert.equal(approveWalletResponse.status, 201);
    const approvedWallet = await approveWalletResponse.json();
    assert.equal(approvedWallet.status, 'synced');
    assert.equal(approvedWallet.chainSyncStatus, 'sent');
    assert.ok(approvedWallet.chainTxSignature);

    const walletDetailResponse = await fetch(`${started.baseUrl}/wallets/${requestedWallet.id}`, {
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
      },
    });
    assert.equal(walletDetailResponse.status, 200);
    const walletDetail = await walletDetailResponse.json();
    assert.equal(walletDetail.chainTxSignature, approvedWallet.chainTxSignature);
    assert.equal(walletDetail.whitelistEntry, approvedWallet.whitelistEntry);

    const clearedScreeningResponse = await fetch(`${started.baseUrl}/transaction-cases`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 250,
        asset: 'usdc',
        destinationWallet: Keypair.generate().publicKey.toBase58(),
        entityId: createdEntity.id,
        referenceId: 'tx-clear-1',
        sourceWallet: walletAddress,
      }),
    });
    assert.equal(clearedScreeningResponse.status, 200);
    const clearedScreening = await clearedScreeningResponse.json();
    assert.equal(clearedScreening.caseOpened, false);
    assert.equal(clearedScreening.screeningDecision, 'cleared');

    const openedCaseResponse = await fetch(`${started.baseUrl}/transaction-cases`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 2500,
        asset: 'USDC',
        destinationWallet: Keypair.generate().publicKey.toBase58(),
        entityId: createdEntity.id,
        referenceId: 'tx-review-1',
        sourceWallet: walletAddress,
      }),
    });
    assert.equal(openedCaseResponse.status, 200);
    const openedCasePayload = await openedCaseResponse.json();
    assert.equal(openedCasePayload.caseOpened, true);
    assert.equal(openedCasePayload.case.caseStatus, 'open');
    assert.ok(openedCasePayload.triggeredRules.includes('amount_threshold'));

    const rejectedCaseResponse = await fetch(`${started.baseUrl}/transaction-cases`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 75,
        asset: 'USDC',
        destinationWallet: Keypair.generate().publicKey.toBase58(),
        entityId: createdEntity.id,
        manualReviewRequested: true,
        referenceId: 'tx-review-2',
        sourceWallet: walletAddress,
      }),
    });
    assert.equal(rejectedCaseResponse.status, 200);
    const rejectedCasePayload = await rejectedCaseResponse.json();
    assert.equal(rejectedCasePayload.caseOpened, true);
    assert.ok(rejectedCasePayload.triggeredRules.includes('manual_review_requested'));

    const escalatedCaseResponse = await fetch(`${started.baseUrl}/transaction-cases`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${complianceLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1100,
        asset: 'USDC',
        destinationWallet: Keypair.generate().publicKey.toBase58(),
        entityId: createdEntity.id,
        referenceId: 'tx-review-3',
        sourceWallet: walletAddress,
      }),
    });
    assert.equal(escalatedCaseResponse.status, 200);
    const escalatedCasePayload = await escalatedCaseResponse.json();
    assert.equal(escalatedCasePayload.caseOpened, true);

    const caseQueueResponse = await fetch(`${started.baseUrl}/transaction-cases?entityId=${createdEntity.id}`, {
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
      },
    });
    assert.equal(caseQueueResponse.status, 200);
    const caseQueue = await caseQueueResponse.json();
    assert.equal(caseQueue.cases.length, 3);

    const reviewCaseResponse = await fetch(
      `${started.baseUrl}/transaction-cases/${openedCasePayload.case.id}/review`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${complianceLogin.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Analyst started transaction review',
        }),
      },
    );
    assert.equal(reviewCaseResponse.status, 201);
    const reviewCase = await reviewCaseResponse.json();
    assert.equal(reviewCase.caseStatus, 'under_review');

    const approveCaseResponse = await fetch(
      `${started.baseUrl}/transaction-cases/${openedCasePayload.case.id}/approve`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${complianceLogin.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Transfer approved after treasury verification',
          evidenceRef: 'case-evidence-approve-1',
        }),
      },
    );
    assert.equal(approveCaseResponse.status, 201);
    const approvedCase = await approveCaseResponse.json();
    assert.equal(approvedCase.caseStatus, 'approved');
    assert.equal(approvedCase.evidenceRef, 'case-evidence-approve-1');

    const rejectCaseResponse = await fetch(
      `${started.baseUrl}/transaction-cases/${rejectedCasePayload.case.id}/reject`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${complianceLogin.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Rejected due to missing beneficiary evidence',
          evidenceRef: 'case-evidence-reject-1',
        }),
      },
    );
    assert.equal(rejectCaseResponse.status, 201);
    const rejectedCase = await rejectCaseResponse.json();
    assert.equal(rejectedCase.caseStatus, 'rejected');

    const escalateCaseResponse = await fetch(
      `${started.baseUrl}/transaction-cases/${escalatedCasePayload.case.id}/escalate`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${complianceLogin.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Escalated for additional off-platform treasury sign-off',
          evidenceRef: 'case-evidence-escalate-1',
        }),
      },
    );
    assert.equal(escalateCaseResponse.status, 201);
    const escalatedCase = await escalateCaseResponse.json();
    assert.equal(escalatedCase.caseStatus, 'escalated');

    const caseDetailResponse = await fetch(
      `${started.baseUrl}/transaction-cases/${openedCasePayload.case.id}`,
      {
        headers: {
          authorization: `Bearer ${auditorLogin.accessToken}`,
        },
      },
    );
    assert.equal(caseDetailResponse.status, 200);
    const caseDetail = await caseDetailResponse.json();
    assert.ok(caseDetail.reviewNotes.includes('Transfer approved after treasury verification'));

    const advisoryResponse = await fetch(
      `${started.baseUrl}/ai/transaction-cases/${openedCasePayload.case.id}/advisory`,
      {
        headers: {
          authorization: `Bearer ${auditorLogin.accessToken}`,
        },
      },
    );
    assert.equal(advisoryResponse.status, 200);
    const advisoryPayload = await advisoryResponse.json();
    assert.equal(advisoryPayload.enabled, true);
    assert.equal(advisoryPayload.advisory.resourceId, openedCasePayload.case.id);
    assert.equal(advisoryPayload.advisory.model, 'gpt-4.1-mini');
    assert.equal(advisoryPayload.advisory.provider, 'openai-compatible');
    assert.equal(advisoryPayload.advisory.promptVersion, 'tx-case-v2');
    assert.equal(advisoryPayload.advisory.fallbackUsed, false);
    assert.equal(llmRequestCount, 1);
    assert.match(advisoryPayload.advisory.summary, /tx-review-1/);
    assert.ok(
      advisoryPayload.advisory.riskFactors.some((factor: string) =>
        factor.includes('travel-rule threshold'),
      ),
    );
    assert.ok(
      advisoryPayload.advisory.checklist.some((item: string) =>
        item.includes('evidence'),
      ),
    );

    const cachedAdvisoryResponse = await fetch(
      `${started.baseUrl}/ai/transaction-cases/${openedCasePayload.case.id}/advisory`,
      {
        headers: {
          authorization: `Bearer ${auditorLogin.accessToken}`,
        },
      },
    );
    assert.equal(cachedAdvisoryResponse.status, 200);
    const cachedAdvisory = await cachedAdvisoryResponse.json();
    assert.equal(cachedAdvisory.advisory.id, advisoryPayload.advisory.id);
    assert.equal(llmRequestCount, 1);

    const feedbackResponse = await fetch(
      `${started.baseUrl}/ai/advisories/${advisoryPayload.advisory.id}/feedback`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auditorLogin.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          helpfulness: 'helpful',
          disposition: 'edited',
          note: 'Useful summary, but the recommendation needed our standard escalation wording.',
        }),
      },
    );
    assert.equal(feedbackResponse.status, 201);
    const feedbackPayload = await feedbackResponse.json();
    assert.equal(feedbackPayload.advisoryId, advisoryPayload.advisory.id);
    assert.equal(feedbackPayload.helpfulness, 'helpful');
    assert.equal(feedbackPayload.disposition, 'edited');

    await new Promise((resolve) => setTimeout(resolve, 20));
    llmMode = 'failure';
    await app.get(DatabaseService).pool.query(
      `
        update transaction_cases
        set review_notes = $1,
            updated_at = now()
        where id = $2
      `,
      [
        'Transfer approved after treasury verification\nAnalyst addendum added to force advisory regeneration',
        openedCasePayload.case.id,
      ],
    );

    const regeneratedAdvisoryResponse = await fetch(
      `${started.baseUrl}/ai/transaction-cases/${openedCasePayload.case.id}/advisory`,
      {
        headers: {
          authorization: `Bearer ${auditorLogin.accessToken}`,
        },
      },
    );
    assert.equal(regeneratedAdvisoryResponse.status, 200);
    const regeneratedAdvisory = await regeneratedAdvisoryResponse.json();
    assert.equal(regeneratedAdvisory.advisory.id, advisoryPayload.advisory.id);
    assert.equal(regeneratedAdvisory.advisory.generatedAt, advisoryPayload.advisory.generatedAt);
    assert.notEqual(regeneratedAdvisory.advisory.updatedAt, advisoryPayload.advisory.updatedAt);
    assert.equal(regeneratedAdvisory.advisory.provider, 'deterministic');
    assert.equal(regeneratedAdvisory.advisory.fallbackUsed, true);
    assert.match(String(regeneratedAdvisory.notice), /deterministic fallback/i);
    assert.equal(llmRequestCount, 2);

    const reusedFallbackResponse = await fetch(
      `${started.baseUrl}/ai/transaction-cases/${openedCasePayload.case.id}/advisory`,
      {
        headers: {
          authorization: `Bearer ${auditorLogin.accessToken}`,
        },
      },
    );
    assert.equal(reusedFallbackResponse.status, 200);
    const reusedFallback = await reusedFallbackResponse.json();
    assert.equal(reusedFallback.advisory.id, advisoryPayload.advisory.id);
    assert.equal(reusedFallback.advisory.provider, 'deterministic');
    assert.equal(reusedFallback.advisory.fallbackUsed, true);
    assert.equal(reusedFallback.advisory.updatedAt, regeneratedAdvisory.advisory.updatedAt);
    assert.match(String(reusedFallback.notice), /temporarily reusing/i);
    assert.equal(llmRequestCount, 2);

    llmMode = 'success';
    await app.get(DatabaseService).pool.query(
      `
        update ai_advisories
        set updated_at = now() - interval '2 minutes'
        where id = $1
      `,
      [advisoryPayload.advisory.id],
    );
    const recoveredAdvisoryResponse = await fetch(
      `${started.baseUrl}/ai/transaction-cases/${openedCasePayload.case.id}/advisory`,
      {
        headers: {
          authorization: `Bearer ${auditorLogin.accessToken}`,
        },
      },
    );
    assert.equal(recoveredAdvisoryResponse.status, 200);
    const recoveredAdvisory = await recoveredAdvisoryResponse.json();
    assert.equal(recoveredAdvisory.advisory.id, advisoryPayload.advisory.id);
    assert.equal(recoveredAdvisory.advisory.provider, 'openai-compatible');
    assert.equal(recoveredAdvisory.advisory.fallbackUsed, false);
    assert.equal(recoveredAdvisory.notice, undefined);
    assert.equal(llmRequestCount, 3);

    const reportMonth = new Date().toISOString().slice(0, 7);
    const generateReportResponse = await fetch(`${started.baseUrl}/reports`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        month: reportMonth,
      }),
    });
    assert.equal(generateReportResponse.status, 201);
    const generatedReport = await generateReportResponse.json();
    assert.equal(generatedReport.status, 'generated');
    assert.equal(generatedReport.metrics.totalCaseCount, 3);
    assert.equal(generatedReport.metrics.approvedCaseCount, 1);
    assert.equal(generatedReport.metrics.rejectedCaseCount, 1);
    assert.equal(generatedReport.metrics.escalatedCaseCount, 1);
    assert.equal(generatedReport.metrics.openCaseCount, 1);

    const reportsListResponse = await fetch(`${started.baseUrl}/reports?month=${reportMonth}`, {
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
      },
    });
    assert.equal(reportsListResponse.status, 200);
    const reportsList = await reportsListResponse.json();
    assert.ok(reportsList.reports.some((report: { id: string }) => report.id === generatedReport.id));

    const downloadReportResponse = await fetch(`${started.baseUrl}/reports/${generatedReport.id}/download`, {
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
      },
    });
    assert.equal(downloadReportResponse.status, 200);
    assert.match(downloadReportResponse.headers.get('content-type') ?? '', /text\/csv/);
    const reportCsv = await downloadReportResponse.text();
    assert.ok(reportCsv.includes(`report_month,${reportMonth}`));
    assert.ok(reportCsv.includes(openedCasePayload.case.id));
    assert.ok(reportCsv.includes(rejectedCasePayload.case.id));
    assert.ok(reportCsv.includes(escalatedCasePayload.case.id));

    const auditResponse = await fetch(`${started.baseUrl}/audit/events?limit=25`, {
      headers: {
        authorization: `Bearer ${auditorLogin.accessToken}`,
      },
    });
    assert.equal(auditResponse.status, 200);
    const auditPayload = await auditResponse.json();
    assert.ok(auditPayload.events.some((event: { action: string }) => event.action === 'entity.approved'));
    assert.ok(auditPayload.events.some((event: { action: string }) => event.action === 'ai_feedback.recorded'));
    assert.ok(auditPayload.events.some((event: { action: string }) => event.action === 'wallet.approved'));
    assert.ok(auditPayload.events.some((event: { action: string }) => event.action === 'transaction_case.approved'));
    assert.ok(auditPayload.events.some((event: { action: string }) => event.action === 'report.generated'));
  } finally {
    globalThis.fetch = originalFetch;

    if (app) {
      await app.close();
    }

    fixture.restore();
  }
});
