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
      environment?: string;
      healthcheckPath?: string;
      restartPolicyType?: string;
      restartPolicyMaxRetries?: number;
    };
  };

  assert.equal(config.build?.builder, 'RAILPACK');
  assert.equal(config.build?.buildCommand, 'npm ci --include=dev && npm run build --workspace=@treasuryos/api-gateway');
  assert.equal(config.deploy?.environment, 'production');
  assert.equal(config.deploy?.healthcheckPath, '/api/health');
  assert.equal(config.deploy?.restartPolicyType, 'ON_FAILURE');
  assert.ok((config.deploy?.restartPolicyMaxRetries ?? 0) >= 3);
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

test('CD workflow keeps guarded Railway deploy and Neon migration steps', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/cd.yml'), 'utf8');

  assert.match(workflow, /Validate Railway deploy secret/);
  assert.match(workflow, /Validate Neon migration secret/);
  assert.match(workflow, /railway up --service '@treasuryos\/api-gateway' --detach/);
  assert.match(workflow, /npm run db:migrate:check/);
});

test('uptime workflow monitors the branded API and opens issues on failure', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/uptime.yml'), 'utf8');

  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /APP_URL:\s+https:\/\/treasury-os-five\.vercel\.app/);
  assert.match(workflow, /API_HEALTH_URL:\s+https:\/\/api\.treasuryos\.aicustombot\.net\/api\/health/);
  assert.match(workflow, /Create or update failure issue/);
});
