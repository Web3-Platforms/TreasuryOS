import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isRepoRootCandidate(candidatePath: string) {
  return (
    fs.existsSync(path.join(candidatePath, 'apps')) &&
    fs.existsSync(path.join(candidatePath, 'package-lock.json')) &&
    fs.existsSync(path.join(candidatePath, 'railway.json'))
  );
}

function searchUpwardForRepoRoot(startPath: string) {
  let currentPath = path.resolve(startPath);

  while (true) {
    if (isRepoRootCandidate(currentPath)) {
      return currentPath;
    }

    const parentPath = path.dirname(currentPath);

    if (parentPath === currentPath) {
      return null;
    }

    currentPath = parentPath;
  }
}

export function resolveApiGatewayRepoRoot(options?: {
  currentFileDir?: string;
  currentWorkingDirectory?: string;
}) {
  const currentFileDir = options?.currentFileDir ?? __dirname;
  const currentWorkingDirectory = options?.currentWorkingDirectory ?? process.cwd();

  return (
    searchUpwardForRepoRoot(currentWorkingDirectory) ??
    searchUpwardForRepoRoot(currentFileDir) ??
    path.resolve(currentFileDir, '../../../../')
  );
}

const repoRoot = resolveApiGatewayRepoRoot();

const stringBooleanSchema = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }

    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Railway injects PORT; we check PORT first, then fall back to API_GATEWAY_PORT.
  PORT: z.coerce.number().int().min(1).max(65535).optional(),
  API_GATEWAY_PORT: z.coerce.number().int().min(1).max(65535).default(3001),

  AUTH_TOKEN_SECRET: z.string().min(32, 'AUTH_TOKEN_SECRET must be at least 32 characters long'),
  AUTH_TOKEN_TTL_MINUTES: z.coerce.number().int().min(15).max(10080).default(480),

  PILOT_REPORTS_DIR: z.string().min(1).default('data/reports'),
  PILOT_INSTITUTION_ID: z.string().min(3).default('pilot-eu-casp'),
  PILOT_INSTITUTION_NAME: z.string().min(3).default('TreasuryOS Pilot Institution'),
  PILOT_CUSTOMER_PROFILE: z.string().min(3).default('eu-regulated-casp'),
  PILOT_ALLOW_MANUAL_KYC_BYPASS: stringBooleanSchema.default(false),

  SEED_DEFAULT_USERS: stringBooleanSchema.default(true),
  DEFAULT_ADMIN_EMAIL: z.string().email(),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8),
  DEFAULT_COMPLIANCE_EMAIL: z.string().email(),
  DEFAULT_COMPLIANCE_PASSWORD: z.string().min(8),
  DEFAULT_AUDITOR_EMAIL: z.string().email(),
  DEFAULT_AUDITOR_PASSWORD: z.string().min(8),

  // ── Database (Neon) ──────────────────────────────────────────
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/treasury_os'),
  DATABASE_SSL: stringBooleanSchema.default(false),

  // ── Redis / Upstash ──────────────────────────────────────────
  // Accepts redis:// (local) and rediss:// (Upstash TLS)
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  REDIS_QUEUE_ENABLED: stringBooleanSchema.default(true),
  REDIS_QUEUE_NAME: z.string().min(3).default('treasuryos:events'),

  // Upstash REST API (preferred for cloud deployments)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // ── CORS ─────────────────────────────────────────────────────
  FRONTEND_URL: z.string().optional(),

  // ── KYC ──────────────────────────────────────────────────────
  KYC_SUMSUB_ENABLED: stringBooleanSchema.default(false),
  SUMSUB_LEVEL_NAME: z.string().min(1).default('basic-kyc-level'),
  SUMSUB_APP_TOKEN: z.string().optional(),
  SUMSUB_SECRET_KEY: z.string().optional(),
  SUMSUB_WEBHOOK_SECRET: z.string().optional(),

  // ── Solana ───────────────────────────────────────────────────
  SOLANA_RPC_URL: z.string().url().default('https://api.devnet.solana.com'),
  SOLANA_NETWORK: z.enum(['devnet', 'testnet', 'mainnet-beta', 'custom']).default('devnet'),
  PROGRAM_ID_WALLET_WHITELIST: z.string().min(32),
  // Local development can read the Solana authority from a filesystem keypair.
  AUTHORITY_KEYPAIR_PATH: z.string().optional(),
  // Railway can inject the same JSON array used by the Solana CLI keypair file.
  AUTHORITY_KEYPAIR_JSON: z.string().optional(),
  SOLANA_SIGNING_MODE: z.enum(['filesystem', 'environment']).default('filesystem'),
  SQUADS_MULTISIG_ENABLED: stringBooleanSchema.default(false),
  SQUADS_MULTISIG_ADDRESS: z.string().optional(),
  SOLANA_SYNC_ENABLED: stringBooleanSchema.default(false),

  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),

  // ── Supabase ───────────────────────────────────────────────────────────────
  // Storage: for compliance document storage.
  // Auth: SUPABASE_JWT_SECRET is used to validate Supabase-issued JWTs.
  //   Obtain from: Supabase Dashboard → Settings → API → JWT Secret
  SUPABASE_JWT_SECRET: z.string().min(32).optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().optional(),

  // ── Sentry ────────────────────────────────────────────────────────────────
  // Optional: when set, enables error tracking for the API gateway.
  // Obtain from: Sentry Dashboard → Settings → Projects → <project> → Client Keys (DSN)
  SENTRY_DSN: z.string().url().optional(),

  // ── Railway ───────────────────────────────────────────────────────────────
  // Railway injects RAILWAY_ENVIRONMENT and PORT automatically.
  // These are read-only and do not need to be set manually.
  RAILWAY_ENVIRONMENT: z.string().optional(),
});

export type ApiGatewayEnv = Omit<
  z.infer<typeof envSchema>,
  'PILOT_REPORTS_DIR' | 'PORT'
> & {
  PILOT_REPORTS_DIR: string;
  REPO_ROOT: string;
  /** Resolved listen port: Railway PORT → API_GATEWAY_PORT → 3001 */
  LISTEN_PORT: number;
};

function resolveRepoPath(targetPath: string) {
  return path.isAbsolute(targetPath) ? targetPath : path.resolve(repoRoot, targetPath);
}

function loadDotEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const contents = fs.readFileSync(filePath, 'utf8');
  const values: Record<string, string> = {};

  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    values[key] = value;
  }

  return values;
}

export function loadApiGatewayEnv(env: NodeJS.ProcessEnv = process.env): ApiGatewayEnv {
  // In production, env vars are injected by Railway/Vercel — skip .env file loading
  const fileEnv = env.NODE_ENV === 'production' ? {} : loadDotEnvFile(path.join(repoRoot, '.env'));

  const parsed = envSchema.parse({
    ...fileEnv,
    ...env,
  });

  return {
    ...parsed,
    PILOT_REPORTS_DIR: resolveRepoPath(parsed.PILOT_REPORTS_DIR),
    REPO_ROOT: repoRoot,
    // Railway injects PORT; prefer it over API_GATEWAY_PORT
    LISTEN_PORT: parsed.PORT ?? parsed.API_GATEWAY_PORT,
  };
}
