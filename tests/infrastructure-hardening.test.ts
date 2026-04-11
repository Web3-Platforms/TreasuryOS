import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Railway deploy config keeps production health checks and restart hardening', () => {
  const config = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'railway.json'), 'utf8'),
  ) as {
    build?: {
      builder?: string;
      buildCommand?: string;
    };
    deploy?: {
      startCommand?: string;
      environment?: string;
      healthcheckPath?: string;
      restartPolicyType?: string;
      restartPolicyMaxRetries?: number;
    };
  };

  const railwayDispatcher = fs.readFileSync(
    path.join(repoRoot, 'scripts/railway-service-command.mjs'),
    'utf8',
  );

  assert.equal(config.build?.builder, 'RAILPACK');
  assert.equal(
    config.build?.buildCommand,
    'npm ci --include=dev && node ./scripts/railway-service-command.mjs build',
  );
  assert.equal(
    config.deploy?.startCommand,
    'node ./scripts/railway-service-command.mjs start',
  );
  assert.equal(config.deploy?.environment, 'production');
  assert.equal(config.deploy?.healthcheckPath, '/api/health');
  assert.equal(config.deploy?.restartPolicyType, 'ON_FAILURE');
  assert.ok((config.deploy?.restartPolicyMaxRetries ?? 0) >= 3);
  assert.match(
    railwayDispatcher,
    /"api-gateway",[\s\S]*?startWorkspace: "@treasuryos\/api-gateway",[\s\S]*?buildWorkspaces: \[[\s\S]*?"@treasuryos\/types",[\s\S]*?"@treasuryos\/compliance-rules",[\s\S]*?"@treasuryos\/sdk",[\s\S]*?"@treasuryos\/api-gateway"/,
  );
  assert.match(
    railwayDispatcher,
    /"@treasuryos\/api-gateway",[\s\S]*?startWorkspace: "@treasuryos\/api-gateway",[\s\S]*?buildWorkspaces: \[[\s\S]*?"@treasuryos\/types",[\s\S]*?"@treasuryos\/compliance-rules",[\s\S]*?"@treasuryos\/sdk",[\s\S]*?"@treasuryos\/api-gateway"/,
  );
  assert.match(
    railwayDispatcher,
    /"kyc-service",[\s\S]*?startWorkspace: "@treasuryos\/kyc-service",[\s\S]*?buildWorkspaces: \[[\s\S]*?"@treasuryos\/types",[\s\S]*?"@treasuryos\/sdk",[\s\S]*?"@treasuryos\/kyc-service"/,
  );
  assert.match(
    railwayDispatcher,
    /"@treasuryos\/kyc-service",[\s\S]*?startWorkspace: "@treasuryos\/kyc-service",[\s\S]*?buildWorkspaces: \[[\s\S]*?"@treasuryos\/types",[\s\S]*?"@treasuryos\/sdk",[\s\S]*?"@treasuryos\/kyc-service"/,
  );
  assert.match(
    railwayDispatcher,
    /"bank-adapter",[\s\S]*?startWorkspace: "@treasuryos\/bank-adapter",[\s\S]*?buildWorkspaces: \[[\s\S]*?"@treasuryos\/bank-adapter"/,
  );
  assert.match(
    railwayDispatcher,
    /"@treasuryos\/bank-adapter",[\s\S]*?startWorkspace: "@treasuryos\/bank-adapter",[\s\S]*?buildWorkspaces: \[[\s\S]*?"@treasuryos\/bank-adapter"/,
  );
  assert.match(
    railwayDispatcher,
    /"reporter",[\s\S]*?startWorkspace: "@treasuryos\/reporter",[\s\S]*?buildWorkspaces: \[[\s\S]*?"@treasuryos\/types",[\s\S]*?"@treasuryos\/reporter"/,
  );
  assert.match(
    railwayDispatcher,
    /"@treasuryos\/reporter",[\s\S]*?startWorkspace: "@treasuryos\/reporter",[\s\S]*?buildWorkspaces: \[[\s\S]*?"@treasuryos\/types",[\s\S]*?"@treasuryos\/reporter"/,
  );
  assert.match(railwayDispatcher, /Unsupported RAILWAY_SERVICE_NAME/);
});

test('CI workflow runs dedicated hardening checks with npm ci', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8');

  assert.match(workflow, /^  hardening-tests:/m);
  assert.match(workflow, /Run security and infrastructure hardening tests/);
  assert.match(workflow, /tests\/dashboard-security-headers\.test\.ts/);
  assert.match(workflow, /tests\/api-gateway-production-env\.test\.ts/);
  assert.match(workflow, /tests\/infrastructure-hardening\.test\.ts/);
  assert.match(workflow, /\bnpm ci\b/);
  assert.doesNotMatch(workflow, /\bnpm install\b/);
});

test('secondary Railway service packages keep valid production start commands', () => {
  const apiGateway = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'apps/api-gateway/package.json'), 'utf8'),
  ) as { scripts?: { ['start:prod']?: string } };
  const bankAdapter = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'apps/bank-adapter/package.json'), 'utf8'),
  ) as { scripts?: { ['start:prod']?: string } };
  const kycService = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'apps/kyc-service/package.json'), 'utf8'),
  ) as { scripts?: { ['start:prod']?: string } };
  const reporter = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'apps/reporter/package.json'), 'utf8'),
  ) as { scripts?: { ['start:prod']?: string } };

  assert.equal(apiGateway.scripts?.['start:prod'], 'node dist/apps/api-gateway/src/main.js');
  assert.equal(bankAdapter.scripts?.['start:prod'], 'node dist/main.js');
  assert.equal(kycService.scripts?.['start:prod'], 'node dist/apps/kyc-service/src/main.js');
  assert.equal(reporter.scripts?.['start:prod'], 'node dist/apps/reporter/src/main.js');
});

test('service-local Railway configs build shared workspace dependencies', () => {
  const bankAdapterConfig = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'apps/bank-adapter/railway.json'), 'utf8'),
  ) as { build?: { buildCommand?: string } };
  const kycConfig = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'apps/kyc-service/railway.json'), 'utf8'),
  ) as { build?: { buildCommand?: string } };
  const reporterConfig = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'apps/reporter/railway.json'), 'utf8'),
  ) as { build?: { buildCommand?: string } };

  assert.equal(
    bankAdapterConfig.build?.buildCommand,
    'npm ci --include=dev && npm run build --workspace=@treasuryos/bank-adapter',
  );
  assert.equal(
    kycConfig.build?.buildCommand,
    'npm ci --include=dev && npm run build --workspace=@treasuryos/types && npm run build --workspace=@treasuryos/sdk && npm run build --workspace=@treasuryos/kyc-service',
  );
  assert.equal(
    reporterConfig.build?.buildCommand,
    'npm ci --include=dev && npm run build --workspace=@treasuryos/types && npm run build --workspace=@treasuryos/reporter',
  );
});

test('CD workflow keeps guarded Neon migration steps and Railway comment', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/cd.yml'), 'utf8');

  // Railway deployment is handled by Railway's "Wait for CI" Git integration.
  // The explicit railway up step was intentionally removed to prevent double deploys.
  // Verify the explanatory comment is present so future engineers don't re-add it.
  assert.match(workflow, /Railway.*Wait for CI/);

  // Neon migration safety guards must remain intact.
  assert.match(workflow, /Validate Neon migration secret/);
  assert.match(workflow, /npm run db:migrate:check/);

  // Landing page Vercel deploy hook must still be present.
  assert.match(workflow, /VERCEL_LANDING_DEPLOY_HOOK/);
});

test('uptime workflow monitors the branded API and opens issues on failure', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/uptime.yml'), 'utf8');

  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /APP_URL:\s+https:\/\/treasury-os-five\.vercel\.app/);
  assert.match(workflow, /API_HEALTH_URL:\s+https:\/\/api\.treasuryos\.aicustombot\.net\/api\/health/);
  assert.match(workflow, /Create or update failure issue/);
});
