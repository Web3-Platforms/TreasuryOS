import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const expectedHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
  {
    key: 'Origin-Agent-Cluster',
    value: '?1',
  },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), display-capture=(), fullscreen=(self), geolocation=(), microphone=(), payment=(), publickey-credentials-get=(self), usb=(), browsing-topics=()',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'off',
  },
  {
    key: 'X-Download-Options',
    value: 'noopen',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Permitted-Cross-Domain-Policies',
    value: 'none',
  },
].sort((left, right) => left.key.localeCompare(right.key));

type HeaderEntry = {
  key: string;
  value: string;
};

function readGlobalDashboardHeaders(relativePath: string): HeaderEntry[] {
  const config = JSON.parse(
    fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'),
  ) as {
    headers?: Array<{
      source?: string;
      headers?: HeaderEntry[];
    }>;
  };

  assert.ok(Array.isArray(config.headers), `${relativePath} must define a headers array`);
  const rule = config.headers.find((entry) => entry.source === '/(.*)');
  assert.ok(rule, `${relativePath} must define a global /(.*) header rule`);
  assert.ok(Array.isArray(rule.headers), `${relativePath} must define headers for the global rule`);

  return [...rule.headers].sort((left, right) => left.key.localeCompare(right.key));
}

test('root Vercel config applies the hardened dashboard browser headers', () => {
  assert.deepEqual(readGlobalDashboardHeaders('vercel.json'), expectedHeaders);
});

test('dashboard-local Vercel config stays aligned with the root browser header policy', () => {
  assert.deepEqual(readGlobalDashboardHeaders('apps/dashboard/vercel.json'), expectedHeaders);
});
