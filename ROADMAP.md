# TreasuryOS — Production Launch Roadmap

**Date**: 2026-03-29  
**Version**: 1.0  
**Prepared for**: Full crew. Treat this as the source of truth from zero to live.

---

## Architecture Overview (where we are now)

```
Vercel (dashboard)          Railway (api-gateway)
┌────────────────────┐      ┌─────────────────────────────────┐
│  Next.js App Router│ ───► │  NestJS 11 (Node 22)            │
│  middleware.ts     │      │  PORT injected by Railway        │
│  Server Actions    │      │  /api/health  healthcheck        │
│  api-client.ts     │      ├─────────────────────────────────┤
└────────────────────┘      │  Auth   │ Entities │ Wallets     │
          │                 │  KYC    │ Txn Cases│ Reports     │
          │ /api/* rewrite  │  Audit  │ Storage  │ Governance  │
          └────────────────►│         │          │             │
                            └─────────────────────────────────┘
                                        │          │
                          Neon Postgres │          │ Upstash Redis
                          Supabase Storage         │ SumSub KYC
                          AWS KMS (Solana signing) │
                          Squads V4 (multisig)     │
```

---

## Phase 0 — Deployment Foundations ✅ (complete in this PR)

These are the minimal changes needed for the code to build and deploy at all.

| # | Change | File(s) | Status |
|---|--------|---------|--------|
| 0.1 | Switch Railway builder RAILPACK → NIXPACKS | `railway.json`, `nixpacks.toml` | ✅ Done |
| 0.2 | Add `nixpacks.toml` to pin `nodejs_22` (prevents Rust auto-detection from `Cargo.toml`) | `nixpacks.toml` | ✅ Done |
| 0.3 | Rename `proxy.ts` → `middleware.ts` so Next.js actually runs auth guard | `apps/dashboard/middleware.ts` | ✅ Done |
| 0.4 | Remove `output:"standalone"` from Next.js config (Vercel-native, not Docker) | `apps/dashboard/next.config.mjs` | ✅ Done |
| 0.5 | Use `npm ci` in `vercel.json` installCommand (reproducible builds) | `vercel.json` | ✅ Done |
| 0.6 | Fix `AuthService.login()` to return `accessToken` — was returning `{ user }` only, dashboard login completely broken | `apps/api-gateway/src/modules/auth/auth.service.ts` | ✅ Done |
| 0.7 | Fix `SupabaseStrategy` to validate with `AUTH_TOKEN_SECRET` (consistent with tokens we issue) | `apps/api-gateway/src/modules/auth/strategies/supabase.strategy.ts` | ✅ Done |
| 0.8 | Fix `api-client.ts` to read `treasuryos_access_token` cookie instead of dead Supabase `getSession()` call | `apps/dashboard/lib/api-client.ts` | ✅ Done |
| 0.9 | Pin all `"latest"` dependency versions to exact semver ranges in every `package.json` | All `apps/*/package.json`, root `package.json` | ✅ Done |
| 0.10 | Replace `npm install` → `npm ci` in GitHub Actions CI workflow | `.github/workflows/ci.yml` | ✅ Done |
| 0.11 | Fix `docker-compose.yml` env var name `JWT_SECRET` → `AUTH_TOKEN_SECRET` | `docker-compose.yml` | ✅ Done |
| 0.12 | Replace `npm install` → `npm ci` in `netlify.toml` | `netlify.toml` | ✅ Done |

---

## Phase 1 — Staging Deploy (do before any real traffic)

Everything below is an ops/configuration task. Code is ready; environment variables and platform setup are not.

### 1.1 Railway — API Gateway

**Action**: Connect the GitHub repo to a new Railway service.

| Variable | Value | Where |
|----------|-------|-------|
| `NODE_ENV` | `production` | Railway → Variables |
| `AUTH_TOKEN_SECRET` | `openssl rand -hex 32` output | Railway → Variables |
| `AUTH_TOKEN_TTL_MINUTES` | `480` | Railway → Variables |
| `DATABASE_URL` | Neon pooled connection string | Railway → Variables |
| `DATABASE_SSL` | `true` | Railway → Variables |
| `UPSTASH_REDIS_REST_URL` | From Upstash Dashboard | Railway → Variables |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash Dashboard | Railway → Variables |
| `FRONTEND_URL` | Your Vercel production URL (no trailing slash) | Railway → Variables |
| `DEFAULT_ADMIN_EMAIL` | Your admin email | Railway → Variables |
| `DEFAULT_ADMIN_PASSWORD` | Strong password (≥12 chars) | Railway → Variables |
| `DEFAULT_COMPLIANCE_EMAIL` | Your compliance officer email | Railway → Variables |
| `DEFAULT_COMPLIANCE_PASSWORD` | Strong password | Railway → Variables |
| `DEFAULT_AUDITOR_EMAIL` | Your auditor email | Railway → Variables |
| `DEFAULT_AUDITOR_PASSWORD` | Strong password | Railway → Variables |
| `PROGRAM_ID_WALLET_WHITELIST` | Devnet program ID (current: `FXFMG4hzBcuRu33mVXyTHESH7FnsmUD6Fajr17FugbRt`) | Railway → Variables |
| `SOLANA_RPC_URL` | `https://api.devnet.solana.com` (devnet) | Railway → Variables |
| `SOLANA_SIGNING_MODE` | `filesystem` (devnet) | Railway → Variables |
| `AUTHORITY_KEYPAIR_PATH` | Path to devnet keypair file | Railway → Variables |
| `SUPABASE_URL` | Your Supabase project URL | Railway → Variables |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key | Railway → Variables |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret (Settings → API) | Railway → Variables |
| `SUPABASE_STORAGE_BUCKET` | `compliance-docs` | Railway → Variables |
| `SUMSUB_APP_TOKEN` | SumSub sandbox token (`sbx:...`) | Railway → Variables |
| `SUMSUB_SECRET_KEY` | SumSub sandbox secret | Railway → Variables |
| `SUMSUB_WEBHOOK_SECRET` | SumSub webhook secret | Railway → Variables |

**After first deploy:**

```bash
# Run database migrations
railway run npm run db:migrate

# Verify health check
curl https://<your-railway-domain>/api/health
# Expected: { "status": "ok", ... }

# Change seed user passwords immediately — the defaults are in plain text!
```

### 1.2 Vercel — Dashboard

**Action**: Import the GitHub repo in Vercel Dashboard. Set root directory to `.` (monorepo root).

| Variable | Value | Where |
|----------|-------|-------|
| `NODE_ENV` | `production` | Vercel → Settings → Environment Variables |
| `API_BASE_URL` | `https://<your-railway-domain>/api` | Vercel → Settings → Environment Variables |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Vercel → Settings → Environment Variables |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase anon/publishable key | Vercel → Settings → Environment Variables |

**After deploy:**
- Verify dashboard login works end-to-end
- Verify `/api/health` rewrite hits Railway (check Network tab)

### 1.3 Cross-Platform Verification

```bash
# 1. CORS — FRONTEND_URL in Railway must match the Vercel domain exactly
#    e.g. FRONTEND_URL=https://treasuryos.vercel.app  (no trailing slash)

# 2. SumSub webhook URL — configure in SumSub Dashboard → Webhooks:
#    https://<your-railway-domain>/api/kyc/webhooks/sumsub

# 3. Smoke test — login → create entity → submit → review
```

---

## Phase 2 — Custom Domains & Security Hardening

### 2.1 Custom Domains

| Domain | Platform | Action |
|--------|----------|--------|
| `api.treasuryos.aicustombot.net` | Railway | Add custom domain → verify TLS |
| `app.treasuryos.aicustombot.net` | Vercel | Add custom domain → verify TLS |

After setting Railway custom domain, update:
- `FRONTEND_URL` in Railway to point at Vercel custom domain
- `API_BASE_URL` in Vercel to `https://api.treasuryos.aicustombot.net/api`
- `vercel.json` rewrite destination: update `https://api.treasuryos.aicustombot.net/api/:path*`

### 2.2 Error Tracking ✅ (complete in this PR)

Sentry has been added to both `api-gateway` and `dashboard`.

- `@sentry/nestjs@10.46.0` installed in `apps/api-gateway`
- `@sentry/nextjs@10.46.0` installed in `apps/dashboard`
- `main.ts` initialises Sentry before `NestFactory.create()` if `SENTRY_DSN` is set
- `next.config.mjs` wrapped with `withSentryConfig` (gracefully no-ops if DSN absent)
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` added to dashboard

**Remaining ops action**: Set `SENTRY_DSN` in Railway and `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` in Vercel environment variables.

### 2.3 Seed User Management

The default seed users (`user_admin`, `user_compliance`, `user_auditor`) are upserted every time the service starts with the passwords from environment variables. This is fine for staging but you must:

1. Set strong, unique passwords (≥16 chars, mixed case + symbols) for all three seed users
2. Rotate credentials after each environment migration
3. For mainnet launch, disable the auto-seeding or move it to a one-time migration

### 2.4 GitHub Actions — CD for Railway ✅ (complete in this PR)

`.github/workflows/cd.yml` updated:
- `npm install` → `npm ci`
- Added `deploy-api` job: installs Railway CLI and runs `railway up --service api-gateway --detach`
- `migrate-neon` job now runs only when migration files changed, after `deploy-api` succeeds

**Remaining ops action**: Add `RAILWAY_TOKEN` secret to the GitHub repository (Settings → Secrets → Actions).

---

## Phase 3 — Observability & Reliability

### 3.1 Structured Logging Pipeline

`StructuredLoggingMiddleware` is in place. Connect Railway's log drain to a log aggregator:

- **Option A (free)**: Railway built-in log explorer (sufficient for pilot)
- **Option B (recommended)**: Datadog / Logtail / BetterStack log drain

Set up in Railway Dashboard → Service → Integrations → Log Drains.

### 3.2 Uptime Monitoring

Add a synthetic monitor for the health check:

```
URL:      https://api.treasuryos.aicustombot.net/api/health
Interval: 1 minute
Alert:    on non-200 response
```

Use BetterUptime, Checkly, or Railway's built-in health check alerts.

### 3.3 Rate Limiting Tuning ✅ (complete in this PR)

Three named throttlers are now configured in `app.module.ts`:

| Endpoint | Limit | Throttler name |
|----------|-------|----------------|
| `POST /api/auth/login` | 5 req/min per IP | `login` |
| `GET /api/reports/:id/download` | 20 req/min per user | `reports` |
| All other authenticated routes | 200 req/min per user | `default` |

`@Throttle()` decorators applied directly to `AuthController.login` and `ReportsController.downloadReport`.

### 3.4 Database Connection Pooling

The current pool (`max: 5` in production) is safe for Neon's free tier. When upgrading to a paid tier:

1. Increase `max` to 10–20 in `database.service.ts`
2. Add PgBouncer config to Neon connection string: `?pgbouncer=true&sslmode=require`

---

## Phase 4 — KYC & Compliance Integration (Production)

### 4.1 SumSub — Sandbox → Production

**Why this matters**: Sandbox tokens (`sbx:...`) will silently fail in production. All KYC verifications will return errors.

**Steps**:
1. Log in to SumSub Dashboard → Settings → Apps → Create Production App
2. Obtain production `App Token` and `Secret Key`
3. Configure production webhook URL: `https://api.treasuryos.aicustombot.net/api/kyc/webhooks/sumsub`
4. Update Railway env vars: `SUMSUB_APP_TOKEN`, `SUMSUB_SECRET_KEY`, `SUMSUB_WEBHOOK_SECRET`
5. Run a live test KYC verification end-to-end before going live

### 4.2 KYC Level Configuration

`SUMSUB_LEVEL_NAME` defaults to `basic-kyc-level`. For regulated CASP operations under MiCA:

- Create a custom level in SumSub Dashboard with appropriate document checks (ID + liveness + address proof)
- Name it `mica-casp-level` (or your preferred name)
- Update `SUMSUB_LEVEL_NAME` in Railway

### 4.3 Entity KYC Lifecycle

The webhook path `POST /api/kyc/webhooks/sumsub` is implemented. Verify the entity status transition machine works for all SumSub review outcomes:

| SumSub Event | Expected Entity Status |
|-------------|----------------------|
| `applicantReviewed` (GREEN) | `approved` |
| `applicantReviewed` (RED) | `rejected` |
| `applicantPending` | `kyc_pending` |

---

## Phase 5 — Solana Mainnet & KMS

### 5.1 AWS KMS Setup (required for production Solana signing)

The filesystem keypair approach (`SOLANA_SIGNING_MODE=filesystem`) is only for development. **Never use filesystem keypairs in production** — the private key would be stored as plain text in an environment variable.

**Steps**:
1. Create an AWS KMS key (Ed25519 key type, `GENERATE_VERIFY_MAC`)  
   Region: choose geographically close to Railway deployment
2. Grant the Railway service's IAM role `kms:Sign` and `kms:GetPublicKey` permissions
3. Export the public key as base58: `aws kms get-public-key --key-id <KEY_ID>`
4. Set Railway env vars:
   ```
   SOLANA_SIGNING_MODE=kms
   AWS_KMS_KEY_ID=<key-id>
   AWS_KMS_PUBLIC_KEY=<base58-public-key>
   AWS_REGION=<region>
   ```
5. Remove `AUTHORITY_KEYPAIR_PATH` from Railway (no longer needed)

### 5.2 Solana Programs — Devnet → Mainnet

The on-chain programs (`programs/wallet-whitelist`, `programs/compliance-registry`) are deployed on devnet.

**Prerequisites before mainnet deployment**:
- [ ] Third-party security audit of Anchor programs (required for institutional use)
- [ ] Dedicated RPC endpoint (Helius: `https://mainnet.helius-rpc.com/?api-key=<KEY>` or Triton)
- [ ] SOL funding for the program authority account (deployment + transaction fees)

**Steps**:
```bash
# Switch Anchor to mainnet
# In Anchor.toml: cluster = "mainnet-beta"

anchor build
anchor deploy --provider.cluster mainnet-beta

# Note the new program IDs and update Railway:
# SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<KEY>
# PROGRAM_ID_WALLET_WHITELIST=<new-mainnet-program-id>
```

### 5.3 Squads V4 Multisig — Optional but Recommended for High-Value Operations

**When to enable**: If any single wallet approval/rejection involves moving or whitelisting wallets that control real funds.

**Steps**:
1. Deploy a Squads V4 multisig at `https://app.squads.so/squads`
2. Add the institution's signers (2-of-3 or 3-of-5 threshold)
3. Set Railway env vars:
   ```
   SQUADS_MULTISIG_ENABLED=true
   SQUADS_MULTISIG_ADDRESS=<multisig-PDA>
   ```
4. All wallet whitelisting transactions will now go through multisig approval

---

## Phase 6 — Banking Adapters (Post-MVP)

`apps/bank-adapter` contains stub implementations for:
- SWIFT GPI (`apps/bank-adapter/src/swift/swift-gpi.service.ts`)
- Amina Bank (`apps/bank-adapter/src/amina/amina.service.ts`)

These are **not deployed**. ADR `docs/adr/0005-bank-rails-post-mvp.md` marks this as post-MVP.

**To activate for real fund movement**:
1. Obtain production mTLS certificates from SWIFT/Amina
2. Implement the ISO20022 message format in `swift-gpi.service.ts`
3. Add `start:prod` script to `apps/bank-adapter/package.json`
4. Create a separate Railway service for `bank-adapter`
5. Configure as a separate deployment with its own `railway.json` in `apps/bank-adapter/`

---

## Phase 7 — Scale & Multi-Tenancy

This phase applies when the platform serves more than the initial pilot institution.

### 7.1 Multi-Tenant Schema

The current schema is single-tenant (one `PILOT_INSTITUTION_ID`). To support multiple institutions:

1. Add `institution_id` column to all major tables (`entities`, `wallets`, `transaction_cases`, `report_jobs`)
2. Add migration `007_multi_tenant_schema.sql`
3. Prefix all queries with `WHERE institution_id = $n`
4. Add institution management API endpoints

### 7.2 Dashboard per Institution

Options:
- **Option A**: Single Vercel deployment, institution selected at login (simplest)
- **Option B**: Separate Vercel deployments per institution subdomain (better isolation)

### 7.3 Postgres Scale

At high transaction volumes, the `provider_webhooks` and `audit_events` tables will grow unboundedly.

**Recommended actions**:
- Partition `audit_events` by month (`CREATE TABLE PARTITION BY RANGE (created_at)`)
- Archive webhook events older than 90 days to cold storage
- Add read replicas for report generation queries

---

## Phase 8 — AI-Assisted Screening (Planned)

`NEXT_ACTIONS.md` mentions LLM-based risk scoring. When ready:

1. Add `ai-screening` module to `apps/api-gateway/src/modules/`
2. Integrate with OpenAI / Anthropic API for transaction narrative analysis
3. Add `AI_RISK_SCORE` field to `transaction_cases` table (migration `008_ai_screening.sql`)
4. Add `AI_SCREENING_ENABLED` env var (default: `false`)

---

## Pre-Launch Security Checklist

Before allowing any real institutional clients:

- [ ] All default seed user passwords changed
- [ ] `AUTH_TOKEN_SECRET` is ≥32 random bytes (not the default placeholder)
- [ ] `DATABASE_SSL=true` verified — Neon connection refuses non-TLS
- [ ] `FRONTEND_URL` in Railway exactly matches Vercel domain (CORS test)
- [ ] SumSub webhook HMAC signature test passed from SumSub Dashboard
- [ ] `/api/health` returns `200 OK` from public internet
- [ ] Anchor program security audit completed (third-party)
- [ ] AWS KMS configured for Solana signing (no filesystem keypairs)
- [ ] Penetration test completed on API Gateway
- [ ] Sentry error tracking active in both Railway and Vercel
- [ ] Uptime monitor active on health check endpoint
- [ ] Incident response runbook written

---

## Quick Reference — Deploy Commands

```bash
# ── Local development ──────────────────────────────────────────
npm ci                           # Install all workspace deps
npm run dev:api                  # Start API gateway on :3001
npm run dev:dashboard            # Start Next.js dashboard on :3000
npm run db:migrate               # Run pending migrations (local Postgres)

# ── Build validation ───────────────────────────────────────────
npm run typecheck                # TypeScript check all workspaces
npm run build                    # Compile all workspaces
npm test                         # Run all tests

# ── Railway ────────────────────────────────────────────────────
# (Railway triggers builds automatically on git push to main)
railway run npm run db:migrate   # Run migrations against Neon
railway logs                     # Tail live logs

# ── Database ──────────────────────────────────────────────────
npm run db:migrate               # Apply pending migrations
npm run db:migrate:check         # Fail if any migrations are pending (CI)
npm run seed:registry            # Seed compliance registry on-chain

# ── Testing ───────────────────────────────────────────────────
npm test                                             # All tests
node ./node_modules/tsx/dist/cli.mjs \
  --tsconfig tsconfig.test.json --test \
  tests/transaction-rules.test.ts                   # Unit tests only
```

---

## Environment Variable Quick Reference

| Variable | Used by | Required | Notes |
|----------|---------|----------|-------|
| `NODE_ENV` | API, Dashboard | ✅ | `production` on Railway + Vercel |
| `AUTH_TOKEN_SECRET` | API | ✅ | ≥32 chars, `openssl rand -hex 32` |
| `AUTH_TOKEN_TTL_MINUTES` | API | — | Default: 480 (8h) |
| `DATABASE_URL` | API | ✅ | Neon pooled URL |
| `DATABASE_SSL` | API | ✅ | `true` for Neon |
| `UPSTASH_REDIS_REST_URL` | API | ✅ | Upstash REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | API | ✅ | Upstash REST token |
| `FRONTEND_URL` | API | ✅ | Vercel domain (CORS) |
| `API_BASE_URL` | Dashboard | ✅ | Railway domain + `/api` |
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Dashboard | ✅ | Supabase anon key |
| `SUPABASE_URL` | API | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | API | ✅ | Supabase service_role key |
| `SUPABASE_JWT_SECRET` | API | — | For Supabase-issued JWT validation |
| `SUPABASE_STORAGE_BUCKET` | API | — | Default: `compliance-docs` |
| `SUMSUB_APP_TOKEN` | API | ✅ | Production: use non-sandbox token |
| `SUMSUB_SECRET_KEY` | API | ✅ | Production: use non-sandbox secret |
| `SUMSUB_WEBHOOK_SECRET` | API | ✅ | From SumSub Dashboard |
| `SOLANA_RPC_URL` | API | ✅ | Devnet or mainnet RPC endpoint |
| `PROGRAM_ID_WALLET_WHITELIST` | API | ✅ | Deployed program ID |
| `SOLANA_SIGNING_MODE` | API | ✅ | `filesystem` (dev) or `kms` (prod) |
| `AUTHORITY_KEYPAIR_PATH` | API | dev only | Not for production |
| `AWS_KMS_KEY_ID` | API | prod | When `SOLANA_SIGNING_MODE=kms` |
| `AWS_KMS_PUBLIC_KEY` | API | prod | When `SOLANA_SIGNING_MODE=kms` |
| `AWS_REGION` | API | prod | When `SOLANA_SIGNING_MODE=kms` |
| `SQUADS_MULTISIG_ENABLED` | API | — | Default: `false` |
| `SQUADS_MULTISIG_ADDRESS` | API | — | When multisig enabled |
| `DEFAULT_ADMIN_EMAIL` | API | ✅ | Seed user — change password post-deploy |
| `DEFAULT_ADMIN_PASSWORD` | API | ✅ | Change immediately after deploy |
| `DEFAULT_COMPLIANCE_EMAIL` | API | ✅ | Seed user |
| `DEFAULT_COMPLIANCE_PASSWORD` | API | ✅ | Change immediately after deploy |
| `DEFAULT_AUDITOR_EMAIL` | API | ✅ | Seed user |
| `DEFAULT_AUDITOR_PASSWORD` | API | ✅ | Change immediately after deploy |
| `PILOT_INSTITUTION_ID` | API | — | Default: `pilot-eu-casp` |
| `PILOT_INSTITUTION_NAME` | API | — | Default: `TreasuryOS Pilot Institution` |
| `REDIS_QUEUE_ENABLED` | API | — | Default: `true` |
| `SENTRY_DSN` | API | — | Sentry ingest URL; enables error tracking when set |
| `NEXT_PUBLIC_SENTRY_DSN` | Dashboard | — | Sentry DSN for client-side error tracking |
