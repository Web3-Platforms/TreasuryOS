# TreasuryOS — Deployment Guide

**Services**: API Gateway (Railway) · Dashboard (Vercel)  
**Domains**: `api.treasuryos.aicustombot.net` · `treasuryos.aicustom.net`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Railway — API Gateway](#railway--api-gateway)
3. [Vercel — Dashboard](#vercel--dashboard)
4. [Environment Variable Reference](#environment-variable-reference)
5. [Domain Configuration](#domain-configuration)
6. [Health Check Endpoints](#health-check-endpoints)
7. [Database Migrations](#database-migrations)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
Browser
  │
  ├─► Vercel (Dashboard)          https://treasuryos.aicustom.net
  │     Next.js 14 (App Router)
  │     Calls API via server-side API_BASE_URL
  │
  └─► Railway (API Gateway)       https://api.treasuryos.aicustombot.net
        NestJS 10
        ├─► Neon Postgres          (DATABASE_URL)
        ├─► Upstash Redis          (REDIS_URL / UPSTASH_REDIS_REST_*)
        ├─► Supabase Storage       (SUPABASE_*)
        ├─► SumSub KYC             (SUMSUB_*)
        └─► Solana RPC             (SOLANA_RPC_URL)
```

The Dashboard **never** talks to the database directly. All data flows through the API Gateway.

---

## Railway — API Gateway

### Prerequisites

- A [Railway](https://railway.app) account
- This repository connected to Railway via GitHub
- A Neon Postgres database (see [Neon docs](https://neon.tech/docs))
- An Upstash Redis database (see [Upstash docs](https://upstash.com/docs/redis))

### Step 1 — Create the Railway Service

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
2. Select this repository.
3. Railway detects `railway.json` automatically and uses Railpacks to build.

The `railway.json` at the repo root configures:

```json
{
  "$schema": "https://schema.railway.com/railway.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci --include=dev && npm run build -w @treasuryos/api-gateway"
  },
  "deploy": {
    "startCommand": "npm run start:prod --workspace=@treasuryos/api-gateway",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Step 2 — Set Environment Variables

In the Railway service dashboard → **Variables**, add the following. See the
[Environment Variable Reference](#environment-variable-reference) section for
full descriptions.

**Required — Core**

| Variable | Example Value |
|---|---|
| `NODE_ENV` | `production` |
| `AUTH_TOKEN_SECRET` | *(output of `openssl rand -hex 32`)* |
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `DATABASE_SSL` | `true` |
| `REDIS_URL` | `rediss://default:<token>@<host>.upstash.io:6380` |
| `FRONTEND_URL` | `https://treasuryos.aicustom.net` |
| `PROGRAM_ID_WALLET_WHITELIST` | *(your deployed Solana program ID)* |

**Required — Seed Users** *(used once on first deploy)*

| Variable | Example Value |
|---|---|
| `DEFAULT_ADMIN_EMAIL` | `admin@yourcompany.com` |
| `DEFAULT_ADMIN_PASSWORD` | *(strong password, min 12 chars)* |
| `DEFAULT_COMPLIANCE_EMAIL` | `compliance@yourcompany.com` |
| `DEFAULT_COMPLIANCE_PASSWORD` | *(strong password, min 12 chars)* |
| `DEFAULT_AUDITOR_EMAIL` | `auditor@yourcompany.com` |
| `DEFAULT_AUDITOR_PASSWORD` | *(strong password, min 12 chars)* |

**Optional — KYC (SumSub)**

| Variable | Example Value |
|---|---|
| `SUMSUB_APP_TOKEN` | `sbx:<token>` (sandbox) or `<token>` (production) |
| `SUMSUB_SECRET_KEY` | *(from SumSub Dashboard → Developers → App Tokens)* |
| `SUMSUB_WEBHOOK_SECRET` | *(from SumSub Dashboard → Webhooks)* |
| `SUMSUB_LEVEL_NAME` | `basic-kyc-level` |

**Optional — Supabase**

| Variable | Example Value |
|---|---|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | *(service_role key — server-side only)* |
| `SUPABASE_JWT_SECRET` | *(from Supabase → Settings → API → JWT Secret)* |
| `SUPABASE_STORAGE_BUCKET` | `compliance-docs` |

**Optional — Upstash REST API**

| Variable | Example Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | `https://<host>.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | *(from Upstash Console → REST API)* |

**Optional — Solana / Governance**

| Variable | Example Value |
|---|---|
| `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` |
| `SOLANA_SYNC_ENABLED` | `true` |
| `SOLANA_SIGNING_MODE` | `environment` (production) or `filesystem` (dev) |
| `SQUADS_MULTISIG_ENABLED` | `true` |
| `SQUADS_MULTISIG_ADDRESS` | *(your Squads multisig PDA)* |

> **Note**: Railway automatically injects `PORT` at runtime. Do not set it manually.

### Step 3 — Run Database Migrations

After the first deploy, run migrations against your Neon database using the
Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Authenticate
railway login

# Run migrations in the Railway environment
railway run npm run db:migrate
```

Or run migrations locally against the production database:

```bash
DATABASE_URL="<your-neon-url>" npm run db:migrate
```

### Step 4 — Verify the Deployment

```bash
curl https://api.treasuryos.aicustombot.net/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "api-gateway",
  "version": "0.1.0",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "scope": {
    "customerProfile": "eu-regulated-casp",
    "institutionId": "pilot-eu-casp",
    "queueName": "treasuryos:events"
  }
}
```

### Step 5 — GitHub Actions CD Secrets

The repository includes `.github/workflows/cd.yml`, which deploys the API
Gateway on pushes to `main` and runs Neon migrations when SQL files change.

Add these repository-level GitHub Actions secrets before relying on automated
deployments:

| Secret | Used by | Purpose |
|---|---|---|
| `RAILWAY_TOKEN` | `deploy-api` | Railway **Project Token** used by `railway up --service '@treasuryos/api-gateway' --detach` |
| `NEON_DATABASE_URL` | `migrate-neon` | Runs `npm run db:migrate` and `npm run db:migrate:check` when migrations change |

Create `RAILWAY_TOKEN` from the target Railway project's settings as a
**Project Token**. This workflow uses `RAILWAY_TOKEN` for project-scoped deploy
operations; `RAILWAY_API_TOKEN` is the separate account/workspace token used for
account-level API access and is not required by `.github/workflows/cd.yml`.

If `RAILWAY_TOKEN` is missing or invalid, the deploy job fails before Railway
deployment starts. If `NEON_DATABASE_URL` is missing, migration verification
fails on any push that changes `infra/db/migrations/*`.

---

## Vercel — Dashboard

### Prerequisites

- A [Vercel](https://vercel.com) account
- The API Gateway already deployed on Railway (you need its URL)

### Step 1 — Import the Project

1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository**.
2. Select this repository.
3. Vercel detects `vercel.json` at the repo root automatically.

The `vercel.json` configures:
- **Build command**: `npm run build -w @treasuryos/dashboard`
- **Output directory**: `apps/dashboard/.next`
- **Framework**: Next.js
- **Security headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`

### Step 2 — Set Environment Variables

In the Vercel project → **Settings → Environment Variables**, add:

**Required**

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `API_BASE_URL` | `https://api.treasuryos.aicustombot.net/api` | Server-side only — do NOT prefix with `NEXT_PUBLIC_` |

**Optional**

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.treasuryos.aicustombot.net/api` | Only if client-side API calls are needed |

> **Important**: `API_BASE_URL` is a **server-side** variable used by Next.js
> Server Components and API routes. It is never exposed to the browser. Do not
> rename it to `NEXT_PUBLIC_API_BASE_URL` unless you explicitly need client-side
> access and understand the security implications.

### Step 3 — Deploy

Vercel deploys automatically on every push to `main`. To trigger a manual
deploy:

```bash
npx vercel --prod
```

### Step 4 — Verify the Deployment

Open `https://treasuryos.aicustom.net` in a browser. The login page should
load and successfully reach the API Gateway.

---

## Environment Variable Reference

Full list of all variables consumed by the API Gateway, with their source and
whether they are required.

| Variable | Service | Required | Description |
|---|---|---|---|
| `NODE_ENV` | Both | Yes | Runtime environment (`development` / `production`) |
| `PORT` | Railway | Injected | Listen port — set automatically by Railway |
| `API_GATEWAY_PORT` | Railway | No | Local fallback port (default: `3001`) |
| `AUTH_TOKEN_SECRET` | Railway | Yes | ≥32-char secret for signing auth tokens |
| `AUTH_TOKEN_TTL_MINUTES` | Railway | No | Token lifetime in minutes (default: `480`) |
| `DATABASE_URL` | Railway | Yes | Postgres connection string |
| `DATABASE_SSL` | Railway | Prod | Enable TLS for managed Postgres |
| `REDIS_URL` | Railway | Yes | Redis connection URL (`redis://` or `rediss://`) |
| `UPSTASH_REDIS_REST_URL` | Railway | No | Upstash REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Railway | No | Upstash REST token |
| `REDIS_QUEUE_ENABLED` | Railway | No | Enable event queue (default: `true`) |
| `REDIS_QUEUE_NAME` | Railway | No | Queue name (default: `treasuryos:events`) |
| `FRONTEND_URL` | Railway | Prod | Vercel dashboard URL for CORS |
| `API_BASE_URL` | Vercel | Yes | Full API Gateway URL for server-side calls |
| `DEFAULT_ADMIN_EMAIL` | Railway | Yes | Seed admin account email |
| `DEFAULT_ADMIN_PASSWORD` | Railway | Yes | Seed admin account password |
| `DEFAULT_COMPLIANCE_EMAIL` | Railway | Yes | Seed compliance officer email |
| `DEFAULT_COMPLIANCE_PASSWORD` | Railway | Yes | Seed compliance officer password |
| `DEFAULT_AUDITOR_EMAIL` | Railway | Yes | Seed auditor email |
| `DEFAULT_AUDITOR_PASSWORD` | Railway | Yes | Seed auditor password |
| `SUMSUB_APP_TOKEN` | Railway | No | SumSub application token |
| `SUMSUB_SECRET_KEY` | Railway | No | SumSub API secret key |
| `SUMSUB_WEBHOOK_SECRET` | Railway | No | SumSub webhook HMAC secret |
| `SUMSUB_LEVEL_NAME` | Railway | No | KYC verification level (default: `basic-kyc-level`) |
| `SOLANA_RPC_URL` | Railway | Yes | Solana RPC endpoint |
| `PROGRAM_ID_WALLET_WHITELIST` | Railway | Yes | Deployed whitelist program ID |
| `SOLANA_SIGNING_MODE` | Railway | No | `filesystem` (dev/file-mounted) or `environment` (prod secret) |
| `SOLANA_SYNC_ENABLED` | Railway | No | Enable on-chain sync (default: `false`) |
| `AUTHORITY_KEYPAIR_PATH` | Railway | No | Mounted or local Solana keypair file |
| `AUTHORITY_KEYPAIR_JSON` | Railway | No | JSON array for Railway-injected signer material |
| `SQUADS_MULTISIG_ENABLED` | Railway | No | Enable Squads multisig (default: `false`) |
| `SQUADS_MULTISIG_ADDRESS` | Railway | No | Squads multisig PDA |
| `SUPABASE_URL` | Railway | No | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Railway | No | Supabase service_role key |
| `SUPABASE_JWT_SECRET` | Railway | No | Supabase JWT secret |
| `SUPABASE_STORAGE_BUCKET` | Railway | No | Supabase storage bucket name |
| `PILOT_INSTITUTION_ID` | Railway | No | Institution identifier (default: `pilot-eu-casp`) |
| `PILOT_INSTITUTION_NAME` | Railway | No | Institution display name |
| `PILOT_CUSTOMER_PROFILE` | Railway | No | Compliance profile (default: `eu-regulated-casp`) |
| `PILOT_REPORTS_DIR` | Railway | No | Report output directory (default: `data/reports`) |
| `RAILWAY_ENVIRONMENT` | Railway | Injected | Set automatically by Railway — read-only |

---

## Domain Configuration

### API Gateway — `api.treasuryos.aicustombot.net`

1. In Railway → service → **Settings → Networking → Custom Domain**.
2. Add `api.treasuryos.aicustombot.net`.
3. Railway provides a CNAME target for the live service domain.
4. In your DNS provider, create:
   ```
   CNAME  api.treasuryos.aicustombot.net  →  treasuryosapi-gateway-production.up.railway.app
   ```
   If you use Cloudflare, start with **Proxy status = DNS only** until the
   health check succeeds cleanly.
5. Railway provisions a TLS certificate automatically via Let's Encrypt.
6. Verify:
   ```bash
   curl https://api.treasuryos.aicustombot.net/api/health
   ```

### Dashboard — `treasuryos.aicustom.net`

1. In Vercel → project → **Settings → Domains**.
2. Add `treasuryos.aicustom.net`.
3. Vercel provides a CNAME target (e.g. `cname.vercel-dns.com`).
4. In your DNS provider, create:
   ```
   CNAME  treasuryos.aicustom.net  →  cname.vercel-dns.com
   ```
5. Vercel provisions a TLS certificate automatically.
6. Verify by opening `https://treasuryos.aicustom.net` in a browser.

### Cross-Service CORS

After both domains are live, update the Railway `FRONTEND_URL` variable:

```
FRONTEND_URL=https://treasuryos.aicustom.net
```

This tells the API Gateway to allow cross-origin requests from the dashboard.
Railway will redeploy automatically when you save the variable.

---

## Health Check Endpoints

### API Gateway

```
GET /api/health
```

Returns `200 OK` when the service is running and the database is reachable.
Returns `503 Service Unavailable` if the database connection fails.

```bash
# Quick check
curl -s https://api.treasuryos.aicustombot.net/api/health | jq .

# Expect:
# {
#   "status": "ok",
#   "service": "api-gateway",
#   "version": "0.1.0",
#   "timestamp": "...",
#   "scope": { ... }
# }
```

Railway polls `/api/health` every 30 seconds (configured in `railway.json`).
A non-2xx response triggers an automatic restart after 3 failures.

### SumSub Webhook

```
POST /api/kyc/webhooks/sumsub
```

Public endpoint — no auth required. Verifies the `x-payload-digest` HMAC
header before processing. Returns `200` on success, `401` if the signature
is invalid.

---

## Database Migrations

Migrations are managed by the script at `scripts/db-migrate.ts`.

```bash
# Run all pending migrations
npm run db:migrate

# Check migration status without applying
npm run db:migrate:check

# Run against a specific database
DATABASE_URL="postgresql://..." npm run db:migrate
```

**Production workflow**:

1. Deploy the new code to Railway.
2. Run `railway run npm run db:migrate` to apply migrations.
3. Railway's health check confirms the service is healthy before routing traffic.

> Migrations are **not** run automatically on deploy. Always run them manually
> after deploying a version that includes schema changes.

---

## Troubleshooting

### Service fails to start — `AUTH_TOKEN_SECRET must be at least 32 characters`

The `AUTH_TOKEN_SECRET` variable is missing or too short. Generate a valid
secret and set it in Railway:

```bash
openssl rand -hex 32
```

### Service fails to start — `DATABASE_URL` validation error

The `DATABASE_URL` is missing or malformed. Ensure it is a valid Postgres
connection string. For Neon, use the **pooled** connection string from the
Neon Console → Connection Details.

### `503 Service Unavailable` from `/api/health`

The API Gateway cannot reach the database. Check:

1. `DATABASE_URL` is set correctly in Railway.
2. `DATABASE_SSL=true` is set (required for Neon and most managed Postgres).
3. The Neon project is not suspended (free tier suspends after inactivity).
4. Railway's outbound IP is not blocked by a database firewall rule.

### CORS errors in the browser

The browser is blocked by CORS. Check:

1. `FRONTEND_URL` in Railway matches the exact origin of the dashboard
   (including `https://` and no trailing slash).
2. The dashboard is making requests to the correct `API_BASE_URL`.
3. Redeploy the API Gateway after updating `FRONTEND_URL`.

### Vercel build fails — `Cannot find module '@treasuryos/dashboard'`

Ensure the Vercel project settings match `vercel.json`:

- **Build Command**: `npm run build -w @treasuryos/dashboard`
- **Output Directory**: `apps/dashboard/.next`
- **Root Directory**: `.` (monorepo root — do not set to `apps/dashboard`)

### SumSub webhooks return `401 Unauthorized`

The `SUMSUB_WEBHOOK_SECRET` does not match the secret configured in the
SumSub Dashboard → Webhooks. Rotate the secret in SumSub, update the Railway
variable, and redeploy.

### Railway deploy succeeds but health check times out

The build succeeded but the process is not listening on the injected `PORT`.
Verify that `railway.json` `startCommand` is correct and that the app reads
`process.env.PORT` at startup (the API Gateway does this automatically via
`env.ts`).
