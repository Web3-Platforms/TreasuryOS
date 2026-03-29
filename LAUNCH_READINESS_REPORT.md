# TreasuryOS — Launch Readiness Report

**Date**: 2026-03-29  
**Stage**: Pre-Launch / Platform Integration  
**Prepared by**: Engineering

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Repository & Monorepo Structure](#repository--monorepo-structure)
3. [API Gateway — Code Status](#api-gateway--code-status)
4. [Dashboard — Code Status](#dashboard--code-status)
5. [Platform Deployment Status](#platform-deployment-status)
6. [Infrastructure & Integrations](#infrastructure--integrations)
7. [Security Posture](#security-posture)
8. [Known Gaps & Strategic Debt](#known-gaps--strategic-debt)
9. [Pre-Launch Checklist](#pre-launch-checklist)
10. [Recommended Next Steps](#recommended-next-steps)

---

## Executive Summary

TreasuryOS has reached **MVP completion** and all core compliance lifecycle features are implemented and integrated. The platform is ready for **staging deployment** and limited pilot onboarding. Full production mainnet launch requires completion of the items in the [Known Gaps](#known-gaps--strategic-debt) section.

| Area | Status | Notes |
|---|---|---|
| API Gateway (NestJS) | ✅ Complete | All core modules implemented |
| Dashboard (Next.js) | ✅ Complete | App Router, standalone output |
| Railway deployment config | ✅ Ready | `railway.json` with Railpacks |
| Vercel deployment config | ✅ Ready | `vercel.json` at repo root |
| Database (Neon Postgres) | ✅ Ready | Migration scripts present |
| Redis / Upstash | ✅ Ready | REST + TCP fallback supported |
| Supabase Storage | ✅ Ready | StorageModule integrated |
| KYC (SumSub) | ⚠️ Sandbox | Requires production tokens for launch |
| Solana / Anchor Programs | ⚠️ Devnet | Requires mainnet deployment |
| AWS KMS signing | ⚠️ Optional | Configured; keys not provisioned |
| Squads V4 multisig | ⚠️ Optional | Module present; address not set |
| Banking adapters | ⚠️ Simulated | SWIFT/Amina stubs only |

---

## Repository & Monorepo Structure

```
treasury-os/                       ← npm workspace root (Node ≥22, npm ≥10)
├── apps/
│   ├── api-gateway/               ← NestJS 10 — Railway deployment target
│   ├── dashboard/                 ← Next.js (App Router) — Vercel deployment target
│   ├── bank-adapter/              ← SWIFT/Amina adapter (NestJS)
│   ├── kyc-service/               ← SumSub KYC microservice (NestJS)
│   └── reporter/                  ← CSV/PDF report generator (NestJS)
├── packages/
│   ├── types/                     ← Shared TypeScript types
│   ├── compliance-rules/          ← Shared compliance rule engine
│   └── sdk/                       ← Shared Solana SDK utilities
├── programs/                      ← Anchor (Rust) on-chain programs
├── scripts/                       ← DB migration, seed scripts
├── tests/                         ← Integration tests (tsx test runner)
├── railway.json                   ← Railway (Railpacks) config — API Gateway
└── vercel.json                    ← Vercel config — Dashboard
```

**Monorepo tooling**: npm workspaces, TypeScript project references, shared `tsconfig.base.json`.  
**Runtime target**: Node 22 (ES2022 modules, `NodeNext` module resolution).  
**Package manager lock file**: `package-lock.json` present and committed — reproducible builds are guaranteed.

---

## API Gateway — Code Status

**Location**: `apps/api-gateway`  
**Framework**: NestJS 10 with Express platform  
**Language**: TypeScript, compiled to `dist/` via `tsc`  
**Entry point for Railway**: `node apps/api-gateway/dist/main.js`

### Modules

| Module | Path | Status | Notes |
|---|---|---|---|
| `AuthModule` | `modules/auth/` | ✅ Complete | JWT RBAC, public decorator, guards |
| `DatabaseModule` | `modules/database/` | ✅ Complete | Neon Postgres via `pg`, SSL support |
| `EntitiesModule` | `modules/entities/` | ✅ Complete | Institutional entity registry |
| `KycModule` | `modules/kyc/` | ✅ Complete | SumSub integration + webhook verifier |
| `WalletsModule` | `modules/wallets/` | ✅ Complete | Wallet whitelist management |
| `TransactionCasesModule` | `modules/transaction-cases/` | ✅ Complete | Compliance screening workflow |
| `ReportsModule` | `modules/reports/` | ✅ Complete | CSV/audit report generation |
| `AuditModule` | `modules/audit/` | ✅ Complete | Structured audit log |
| `HealthModule` | `modules/health/` | ✅ Complete | `/api/health` with DB probe |
| `SecurityModule` | `modules/security/` | ✅ Complete | Rate limiting via `@nestjs/throttler` |
| `GovernanceModule` | `modules/governance/` | ✅ Complete | Squads V4 multisig integration |
| `StorageModule` | `modules/storage/` | ✅ Complete | Supabase Storage for compliance docs |
| `PlatformModule` | `modules/platform/` | ✅ Complete | Redis queue, structured logging |

### Key Observations

- **Environment validation**: Zod schema in `config/env.ts` validates all env vars at startup. The service refuses to start if required variables are missing or invalid — this is production-grade behaviour.
- **PORT handling**: Railway's injected `PORT` env var is correctly preferred over `API_GATEWAY_PORT`, ensuring seamless Railway deployment.
- **CORS**: Restricted to `FRONTEND_URL` in production; localhost in development. Correctly configured.
- **Security middleware**: `helmet()` for HTTP security headers, `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`, global throttler (100 req/min).
- **Shutdown hooks**: `app.enableShutdownHooks()` ensures graceful termination on Railway's SIGTERM.
- **Vercel adapter**: `src/vercel.ts` exists for optional serverless deployment, though Railway (long-running process) is the primary target.

### Build Pipeline

```
npm ci                                     # Install all workspace deps
npm run build -w @treasuryos/api-gateway   # tsc → apps/api-gateway/dist/
node apps/api-gateway/dist/main.js         # Start production server
```

---

## Dashboard — Code Status

**Location**: `apps/dashboard`  
**Framework**: Next.js (latest) with App Router  
**Output mode**: `standalone` (enables self-contained Docker/Railway deployment if needed)  
**Deployment target**: Vercel

### Key Observations

- **`output: "standalone"`**: Configured in `next.config.mjs`. This produces a self-contained build under `apps/dashboard/.next/standalone`, but Vercel ignores this in favour of its own Next.js integration.
- **Turbopack**: Enabled for development via `turbopack.root`, pointing to the monorepo root. This correctly resolves shared `packages/` during local dev.
- **Supabase SSR**: `@supabase/ssr` is used for server-side auth, keeping the `SUPABASE_SERVICE_KEY` out of client bundles.
- **API routing**: All `/api/*` requests are rewritten to the Railway API Gateway URL (`https://api.treasuryos.aicustombot.net/api/:path*`) via `vercel.json`.
- **Security headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` applied to all routes in `vercel.json`.

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build -w @treasuryos/dashboard",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": "apps/dashboard/.next"
}
```

- **Root directory**: Must be set to `.` (monorepo root) — **do not** point Vercel at `apps/dashboard` directly.
- **Build command**: Runs from the monorepo root, which ensures shared `packages/` are resolved.

---

## Platform Deployment Status

### Railway — API Gateway

| Item | Status | Notes |
|---|---|---|
| `railway.json` created | ✅ Done | Uses **Railpacks** (`RAILPACK` builder) |
| Builder | ✅ Railpacks | Not Nixpacks — faster, more reproducible |
| Build command | ✅ `npm ci && npm run build -w @treasuryos/api-gateway` | Full install + workspace build |
| Start command | ✅ `node apps/api-gateway/dist/main.js` | Direct Node.js invocation |
| `start:prod` npm script | ✅ Added | `apps/api-gateway/package.json` |
| Health check path | ✅ `/api/health` | 30-second timeout |
| Restart policy | ✅ `ON_FAILURE` / 3 retries | Auto-recovery on crash |
| PORT injection | ✅ Handled | `config/env.ts` reads Railway's `PORT` first |
| Custom domain | ⚠️ Pending | Set `api.treasuryos.aicustombot.net` in Railway |

### Vercel — Dashboard

| Item | Status | Notes |
|---|---|---|
| `vercel.json` present | ✅ Done | At repo root |
| Framework detection | ✅ Next.js | Auto-detected |
| API rewrite | ✅ Configured | `/api/*` → Railway URL |
| Security headers | ✅ Configured | Frame, MIME, Referrer |
| `NODE_ENV` | ⚠️ Pending | Set `production` in Vercel env vars |
| `API_BASE_URL` | ⚠️ Pending | Set server-side in Vercel |
| Custom domain | ⚠️ Pending | Set `treasuryos.aicustom.net` in Vercel |

---

## Infrastructure & Integrations

### Neon Postgres

- **Status**: Ready — `DatabaseModule` uses `pg` pool with SSL support.
- **Migration tool**: `scripts/db-migrate.ts` — run `npm run db:migrate` after deploy.
- **Connection string**: Set `DATABASE_URL` + `DATABASE_SSL=true` in Railway.
- **Action required**: Run `railway run npm run db:migrate` after first deploy.

### Upstash Redis

- **Status**: Ready — `PlatformModule` supports both REST API (`UPSTASH_REDIS_REST_URL`) and TCP (`REDIS_URL`), with `rediss://` TLS support for Upstash.
- **Queue**: `treasuryos:events` (configurable via `REDIS_QUEUE_NAME`).
- **Action required**: Set either `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` **or** `REDIS_URL` in Railway.

### Supabase

- **Status**: Ready — `StorageModule` handles compliance document storage.
- **Auth**: `SUPABASE_JWT_SECRET` validates Supabase-issued JWTs in the API Gateway.
- **Action required**: Set `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`, `SUPABASE_STORAGE_BUCKET` in Railway.

### SumSub KYC

- **Status**: Implemented — `KycModule` has full webhook signature verification (HMAC `x-payload-digest`) and entity status transitions.
- **Action required**: Replace sandbox tokens (`sbx:...`) with production tokens before mainnet launch. Set `SUMSUB_APP_TOKEN`, `SUMSUB_SECRET_KEY`, `SUMSUB_WEBHOOK_SECRET` in Railway.

### Solana / Anchor Programs

- **Status**: Devnet — `programs/` contains the Anchor programs (Wallet Whitelist, Compliance Registry).
- **Action required**: Deploy programs to mainnet, set `SOLANA_RPC_URL` (mainnet), `PROGRAM_ID_WALLET_WHITELIST` in Railway, set `SOLANA_SIGNING_MODE=kms`.

### AWS KMS

- **Status**: Code complete — `@solana/keychain-aws-kms` integrated for Ed25519 signing.
- **Action required**: Provision KMS key, set `AWS_KMS_KEY_ID`, `AWS_KMS_PUBLIC_KEY`, `AWS_REGION` in Railway.

### Squads V4 Multisig

- **Status**: Module implemented — `GovernanceModule` wraps `@sqds/multisig`.
- **Action required**: Deploy Squads multisig on-chain, set `SQUADS_MULTISIG_ENABLED=true` and `SQUADS_MULTISIG_ADDRESS` in Railway.

---

## Security Posture

| Control | Status | Notes |
|---|---|---|
| HTTP security headers (Helmet) | ✅ Active | Applied globally in NestJS |
| Rate limiting (Throttler) | ✅ Active | 100 req/60s per IP |
| JWT RBAC | ✅ Active | `AuthGuard` + `RolesGuard` on all routes |
| Input validation (class-validator) | ✅ Active | `ValidationPipe` with whitelist mode |
| Webhook HMAC verification (SumSub) | ✅ Active | `x-payload-digest` verified |
| Supabase JWT validation | ✅ Active | `SUPABASE_JWT_SECRET` checked |
| Environment validation (Zod) | ✅ Active | Service refuses to start on misconfiguration |
| TLS for database | ✅ Configurable | `DATABASE_SSL=true` required in production |
| CORS restricted to `FRONTEND_URL` | ✅ Active | Only in `NODE_ENV=production` |
| Secrets never in source code | ✅ Verified | All values are env vars |
| `.env` in `.gitignore` | ✅ Verified | Committed `.env.example` is placeholders only |
| Graceful shutdown | ✅ Active | NestJS `enableShutdownHooks()` |
| Anchor program security audit | ❌ Pending | Third-party audit required before mainnet |
| Penetration testing | ❌ Pending | Required before institutional client onboarding |

---

## Known Gaps & Strategic Debt

### Critical (must resolve before production launch)

1. **Solana Mainnet**: Programs are on devnet. Mainnet deployment requires:
   - Dedicated RPC endpoint (Helius or Triton recommended for reliability)
   - Updated `PROGRAM_ID_WALLET_WHITELIST` for mainnet
   - AWS KMS configured and `SOLANA_SIGNING_MODE=kms`
   - Anchor program audit completed

2. **SumSub Production Tokens**: Sandbox tokens must be swapped for production tokens.  
   Risk: KYC verification will fail in production with sandbox credentials.

3. **Database Migrations**: Must be run manually after the first Railway deploy:  
   ```bash
   railway run npm run db:migrate
   ```

4. **Seed User Passwords**: Default seeded passwords must be changed immediately after first deploy.

### High (address within first sprint post-launch)

5. **Banking Adapters** (`apps/bank-adapter`): SWIFT/Amina integrations are stub implementations. Production mTLS certificates and live API keys are required for real fund movement.

6. **Observability**: No centralized error tracking configured (Sentry or equivalent). Railway's built-in log streaming is a baseline but is insufficient for production incident response.

7. **CI/CD pipeline**: No GitHub Actions workflow defined for automated build/test/deploy on push to `main`. Currently deploys are triggered manually or via Railway's GitHub integration.

### Medium (address before scale)

8. **`tsconfig.tsbuildinfo` committed**: `apps/dashboard/tsconfig.tsbuildinfo` is tracked by git. This is a build artifact and should be added to `.gitignore`.

9. **`latest` dependency versions**: Several packages in `apps/*` use `"latest"` as the version constraint (e.g. `@nestjs/common`, `next`, `react`). This introduces non-determinism in production builds. Pin to specific semver ranges.

10. **Database write scaling**: The Postgres schema is optimized for transactional compliance workloads. High-frequency transaction event logging may require time-series partitioning or an append-only audit table at scale.

11. **Missing `start` scripts in auxiliary apps**: `apps/kyc-service`, `apps/bank-adapter`, `apps/reporter` have no `start:prod` scripts. These services are not currently deployed to Railway; add scripts before deploying them.

---

## Pre-Launch Checklist

### Railway (API Gateway)

- [ ] Service connected to GitHub repo via Railway dashboard
- [ ] `NODE_ENV=production` set
- [ ] `AUTH_TOKEN_SECRET` set (≥32 chars, `openssl rand -hex 32`)
- [ ] `DATABASE_URL` set (Neon pooled connection string)
- [ ] `DATABASE_SSL=true` set
- [ ] `REDIS_URL` or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set
- [ ] `FRONTEND_URL` set (exact Vercel production URL, no trailing slash)
- [ ] `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` set
- [ ] `DEFAULT_COMPLIANCE_EMAIL` / `DEFAULT_COMPLIANCE_PASSWORD` set
- [ ] `DEFAULT_AUDITOR_EMAIL` / `DEFAULT_AUDITOR_PASSWORD` set
- [ ] `PROGRAM_ID_WALLET_WHITELIST` set
- [ ] `SOLANA_RPC_URL` set
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`, `SUPABASE_STORAGE_BUCKET` set
- [ ] `SUMSUB_APP_TOKEN`, `SUMSUB_SECRET_KEY`, `SUMSUB_WEBHOOK_SECRET` set (production, not sandbox)
- [ ] First deploy succeeds — `railway run npm run db:migrate` executed
- [ ] Health check passing: `GET https://api.treasuryos.aicustombot.net/api/health` → `200 OK`
- [ ] Custom domain `api.treasuryos.aicustombot.net` configured and TLS active
- [ ] Default seed user passwords changed after seeding

### Vercel (Dashboard)

- [ ] Project imported from GitHub repo (root directory = `.`)
- [ ] `NODE_ENV=production` set
- [ ] `API_BASE_URL=https://api.treasuryos.aicustombot.net/api` set (server-side only)
- [ ] Build succeeds with command `npm run build -w @treasuryos/dashboard`
- [ ] Custom domain `treasuryos.aicustom.net` configured and TLS active
- [ ] Dashboard login page loads and reaches API Gateway successfully

### Cross-Platform

- [ ] CORS: `FRONTEND_URL` in Railway matches Vercel domain exactly
- [ ] SumSub webhook URL configured in SumSub Dashboard → `https://api.treasuryos.aicustombot.net/api/kyc/webhooks/sumsub`
- [ ] Webhook signature test passes from SumSub Dashboard
- [ ] `SOLANA_SIGNING_MODE=kms` and AWS KMS configured (for production signing)
- [ ] Anchor programs deployed to mainnet and `PROGRAM_ID_WALLET_WHITELIST` updated
- [ ] `tsconfig.tsbuildinfo` added to `.gitignore`
- [ ] All `"latest"` dependency versions pinned to specific semver ranges

---

## Recommended Next Steps

### Immediate (before any staging traffic)

1. Set all required environment variables in Railway and Vercel (see checklists above).
2. Run `railway run npm run db:migrate` to initialise the database schema.
3. Verify the health check: `curl https://api.treasuryos.aicustombot.net/api/health`.
4. Test the dashboard login flow end-to-end.

### Short-term (within 2 weeks)

5. Add a GitHub Actions workflow for automated build + test on every push and PR.
6. Integrate Sentry (or equivalent) for error tracking in both API Gateway and Dashboard.
7. Pin all `"latest"` dependency versions to specific semver ranges.
8. Add `tsconfig.tsbuildinfo` to `.gitignore`.

### Pre-mainnet (before real funds or institutional clients)

9. Engage a third-party firm for the Anchor program security audit.
10. Deploy Anchor programs to Solana mainnet and update `PROGRAM_ID_WALLET_WHITELIST`.
11. Provision AWS KMS keys and switch `SOLANA_SIGNING_MODE` to `kms`.
12. Obtain production SumSub tokens and complete a live KYC verification test.
13. Obtain mTLS certificates for SWIFT/Amina banking adapters.
14. Deploy Squads V4 multisig on-chain and enable governance for high-value transactions.
15. Complete a penetration test of the API Gateway.
