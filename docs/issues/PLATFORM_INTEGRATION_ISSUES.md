# GitHub Issues — TreasuryOS Platform Integration

This file contains ready-to-create GitHub Issues for each manual setup step
required to run TreasuryOS on the target production stack:
**Vercel + Railway + Neon + Supabase + Upstash + Squads**.

Copy the title and body of each issue below and create it in the repository's
Issues tab. Assign the relevant labels (infrastructure, backend, frontend,
security) and milestone (Platform Launch).

---

## Issue 1 — [Infra] Set up Neon database and run production migrations

**Labels**: `infrastructure`, `database`

**Body**:

### Overview

TreasuryOS requires a PostgreSQL 15+ database.  For the Vercel + Railway
production stack, **Neon** is the recommended provider because it supports
serverless connection pooling (no persistent connections) and branches for
staging environments.

### Steps

1. **Create a Neon account** at https://neon.tech and create a new project
   named `treasuryos-production`.

2. **Copy the pooled connection string** from:  
   Neon Console → Project → Connection Details → **Pooled connection string**  
   It looks like:  
   ```
   postgresql://[user]:[password]@[host]-pooler.neon.tech/[dbname]?sslmode=require
   ```

3. **Set environment variables** in your Railway API Gateway service and
   Vercel dashboard:
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]-pooler.neon.tech/[dbname]?sslmode=require
   DATABASE_SSL=true
   ```

4. **Run database migrations** against the Neon instance from a local machine
   or CI/CD:
   ```bash
   DATABASE_URL="<neon-url>" npm run db:migrate
   ```
   Migrations live in `infra/db/migrations/`. Run `npm run db:migrate:check`
   to verify all migrations are applied.

5. **Create a staging branch** in Neon (optional but recommended):
   Neon Console → Branches → Create Branch → name it `staging`.
   Use the staging branch URL in your Railway staging service.

### Acceptance Criteria

- [ ] Neon project created
- [ ] Pooled connection string set in Railway and Vercel environments
- [ ] All 6 migrations applied (`npm run db:migrate:check` returns success)
- [ ] API Gateway health check (`/api/health`) returns `status: ok`

### References

- `infra/db/migrations/` — SQL migration files
- `apps/api-gateway/src/modules/database/database.service.ts` — DB connection
- `.env.example` — Connection string examples
- `DEPLOYMENT_GUIDE.md` → Platform 7: Neon

---

## Issue 2 — [Infra] Configure Upstash Redis for event queue

**Labels**: `infrastructure`, `backend`

**Body**:

### Overview

TreasuryOS uses Redis as an event queue for audit events and compliance
notifications.  For serverless environments (Vercel + Railway), **Upstash**
is required because it provides a fully managed Redis that works over TLS
without persistent connections.

The `RedisQueueService` has been updated to support Upstash's `rediss://`
scheme (TLS) and password authentication automatically.

### Steps

1. **Create an Upstash account** at https://console.upstash.com and create a
   new Redis database named `treasuryos-events`.
   - Select the region closest to your Railway deployment (e.g., `us-east-1`).
   - Enable **TLS** (it's on by default for Upstash).

2. **Copy the Redis URL** from:  
   Upstash Console → Database → Details → **Redis URL**  
   It looks like:  
   ```
   rediss://default:<TOKEN>@<host>.upstash.io:6380
   ```

3. **Set environment variables** in your Railway API Gateway service:
   ```
   REDIS_URL=rediss://default:<TOKEN>@<host>.upstash.io:6380
   REDIS_QUEUE_ENABLED=true
   REDIS_QUEUE_NAME=treasuryos:events
   ```

4. **Verify the connection** by checking the health endpoint after deployment:
   The `ping()` call in `RedisQueueService` is invoked on every health check.

### What Changed in This PR

- `apps/api-gateway/src/modules/platform/redis-queue.service.ts` — Added TLS
  (`rediss://`) and password (`AUTH` command) support.
- The warning `"Redis URL authentication is not supported"` has been removed.

### Acceptance Criteria

- [ ] Upstash database created
- [ ] `REDIS_URL` set in Railway environment with `rediss://` prefix
- [ ] API Gateway starts without Redis warnings in logs
- [ ] Events are enqueued (check Upstash Console → Data Browser)

### References

- `apps/api-gateway/src/modules/platform/redis-queue.service.ts`
- `.env.example` — Upstash URL format
- `DEPLOYMENT_GUIDE.md` → Platform 8: Upstash Redis

---

## Issue 3 — [Infra] Deploy API Gateway to Railway

**Labels**: `infrastructure`, `backend`, `deployment`

**Body**:

### Overview

The NestJS API Gateway cannot run on Vercel (requires Node.js `fs`, `pg`, and
`crypto` modules not available on Edge Runtime).  **Railway** is the
recommended host for the API Gateway.

A `railway.json` has been added to the repository root with the build command,
start command, health-check path, and restart policy.

### Steps

1. **Create a Railway account** at https://railway.app.

2. **Create a new Railway project** → New Service → Deploy from GitHub Repo →
   select `Web3-Platforms/TreasuryOS`.

3. Railway will detect `railway.json` and use these settings automatically:
   - **Build command**: `npm install && npm run build -w @treasuryos/api-gateway`
   - **Start command**: `node apps/api-gateway/dist/main.js`
   - **Health check path**: `/api/health`

4. **Set all required environment variables** (see `.env.example` for the full
   list). Minimum required:
   ```
   NODE_ENV=production
   AUTH_TOKEN_SECRET=<min-32-char-secret>
   DATABASE_URL=<neon-pooled-url>
   DATABASE_SSL=true
   REDIS_URL=<upstash-rediss-url>
   PROGRAM_ID_WALLET_WHITELIST=FXFMG4hzBcuRu33mVXyTHESH7FnsmUD6Fajr17FugbRt
   AUTHORITY_KEYPAIR_PATH=/tmp/authority.json
   DEFAULT_ADMIN_EMAIL=admin@yourcompany.com
   DEFAULT_ADMIN_PASSWORD=<strong-password>
   DEFAULT_COMPLIANCE_EMAIL=compliance@yourcompany.com
   DEFAULT_COMPLIANCE_PASSWORD=<strong-password>
   DEFAULT_AUDITOR_EMAIL=auditor@yourcompany.com
   DEFAULT_AUDITOR_PASSWORD=<strong-password>
   FRONTEND_URL=https://<your-vercel-url>.vercel.app
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   SOLANA_SYNC_ENABLED=false
   ```

5. **Copy the Railway public URL** (e.g. `https://treasuryos-api.up.railway.app`).

6. **Set `API_BASE_URL`** in the Vercel dashboard environment to:
   `https://treasuryos-api.up.railway.app/api`

### Acceptance Criteria

- [ ] Railway service created and deployed
- [ ] `railway.json` detected and build succeeds
- [ ] `GET https://<railway-url>/api/health` returns `{"status":"ok"}`
- [ ] Vercel dashboard successfully calls Railway API (login works)

### References

- `railway.json` — Railway deployment configuration
- `apps/api-gateway/src/main.ts` — Reads `PORT` from Railway env
- `.env.example` — All environment variables
- `DEPLOYMENT_GUIDE.md` → Platform 6: Railway

---

## Issue 4 — [Infra] Deploy Dashboard to Vercel

**Labels**: `infrastructure`, `frontend`, `deployment`

**Body**:

### Overview

The Next.js dashboard is deployed to **Vercel**.  A `vercel.json` is already
present at the repository root configuring the monorepo build.

### Steps

1. **Create a Vercel account** at https://vercel.com.

2. **Import the repository**: New Project → Import Git Repository →
   `Web3-Platforms/TreasuryOS`.

3. Vercel will auto-detect `vercel.json`. Confirm these settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (repository root)
   - **Build Command**: `npm run build -w @treasuryos/dashboard`
   - **Output Directory**: `apps/dashboard/.next`

4. **Set environment variables** in the Vercel project:
   ```
   NODE_ENV=production
   API_BASE_URL=https://<railway-api-url>/api
   NEXT_PUBLIC_API_BASE_URL=https://<railway-api-url>/api
   AUTH_TOKEN_SECRET=<same-secret-as-railway>
   ```

5. **Deploy** from the `main` branch.

6. **Copy the Vercel deployment URL** and set it as `FRONTEND_URL` in Railway
   so the API Gateway allows CORS from the dashboard origin.

### Acceptance Criteria

- [ ] Vercel project created and dashboard deployed
- [ ] Login page is accessible at the Vercel URL
- [ ] Dashboard successfully authenticates via Railway API
- [ ] Security headers are present (`X-Frame-Options: DENY`, etc.)

### References

- `vercel.json` — Vercel configuration
- `apps/dashboard/next.config.mjs` — Next.js config with standalone output
- `.env.example` — Environment variables
- `DEPLOYMENT_GUIDE.md` → Platform 1: Vercel

---

## Issue 5 — [Infra] Configure Supabase Storage for compliance documents

**Labels**: `infrastructure`, `backend`, `compliance`

**Body**:

### Overview

TreasuryOS stores compliance documents, KYC artifacts, and audit reports in
**Supabase Storage**.  A new `StorageService` has been added in this PR.

### Steps

1. **Create a Supabase account** at https://supabase.com and create a project
   named `treasuryos`.

2. **Create a private Storage bucket**:  
   Supabase Dashboard → Storage → New Bucket → name: `compliance-docs`,
   set to **Private** (not public).

3. **Get API credentials**:  
   Supabase Dashboard → Settings → API:
   - **Project URL** → copy to `SUPABASE_URL`
   - **service_role** key → copy to `SUPABASE_SERVICE_KEY`

4. **Set environment variables** in the Railway API Gateway service:
   ```
   SUPABASE_URL=https://<ref>.supabase.co
   SUPABASE_SERVICE_KEY=<service_role_key>
   SUPABASE_STORAGE_BUCKET=compliance-docs
   ```

5. **Integrate `StorageService`** in modules that handle document uploads
   (KYC documents, audit reports). The service is globally available — inject
   it via the constructor:
   ```typescript
   constructor(private readonly storageService: StorageService) {}
   ```

6. **Set up a Storage policy** in Supabase to allow service_role access only:
   SQL Editor:
   ```sql
   CREATE POLICY "Service role only" ON storage.objects
     FOR ALL USING (auth.role() = 'service_role');
   ```

### What Was Added in This PR

- `apps/api-gateway/src/modules/storage/storage.service.ts`
  — `upload()`, `createSignedUrl()`, `delete()` methods
- `apps/api-gateway/src/modules/storage/storage.module.ts`
  — Global NestJS module registered in `AppModule`

### Acceptance Criteria

- [ ] Supabase project created
- [ ] `compliance-docs` private bucket created
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_STORAGE_BUCKET` set in Railway
- [ ] `StorageService.isEnabled()` returns `true` in production
- [ ] Test upload succeeds: `storageService.upload('test.txt', 'hello', 'text/plain')`

### References

- `apps/api-gateway/src/modules/storage/storage.service.ts`
- `.env.example` — Supabase env var descriptions
- `DEPLOYMENT_GUIDE.md` → Platform 9: Supabase Storage

---

## Issue 6 — [Governance] Configure Squads V4 multisig for treasury operations

**Labels**: `security`, `governance`, `blockchain`

**Body**:

### Overview

High-value treasury transactions (wallet whitelist updates, large transfers)
require on-chain $n$-of-$m$ approval via **Squads V4** on Solana.  The
`SquadsService` is already implemented and integrated into the governance flow.

The service is currently **disabled** (`SQUADS_MULTISIG_ENABLED=false`).  This
issue tracks the steps to enable it for production.

### Steps

1. **Create a Squads V4 multisig**:
   - Go to https://v4.squads.so and connect your institution's Solana wallet.
   - Click **Create Squad** → configure $n$-of-$m$ threshold (e.g. 2-of-3).
   - Add all institutional signers (Compliance Officer, CFO, Legal).
   - Copy the **Multisig PDA address** (base58 public key).

2. **Set environment variables** in the Railway API Gateway service:
   ```
   SQUADS_MULTISIG_ENABLED=true
   SQUADS_MULTISIG_ADDRESS=<multisig-pda-base58>
   ```

3. **Fund the multisig vault** with SOL for transaction fees (minimum 0.1 SOL
   for devnet testing, 1+ SOL for mainnet).

4. **Update the governance flow**: Review the logic in
   `apps/api-gateway/src/modules/governance/squads.service.ts` and integrate
   `SquadsService.proposeTransaction()` into any high-value treasury actions.

5. **Test on devnet first**: Set `SOLANA_RPC_URL=https://api.devnet.solana.com`
   and `SQUADS_MULTISIG_ADDRESS` to a devnet multisig before enabling on
   mainnet.

### What Is Already Implemented

- `apps/api-gateway/src/modules/governance/squads.service.ts`
  — `proposeTransaction()` creates a Squads vault transaction and proposal
- `apps/api-gateway/src/modules/governance/governance.module.ts`
  — Global module registered in `AppModule`
- Env vars `SQUADS_MULTISIG_ENABLED` and `SQUADS_MULTISIG_ADDRESS` are
  validated and documented in `.env.example`

### Acceptance Criteria

- [ ] Squads V4 multisig created on Solana (devnet first, then mainnet)
- [ ] `SQUADS_MULTISIG_ENABLED=true` and `SQUADS_MULTISIG_ADDRESS` set in Railway
- [ ] API Gateway logs `"Squads Governance initialized for multisig: <address>"`
- [ ] `SquadsService.isEnabled()` returns `true`
- [ ] A test proposal is successfully created via `proposeTransaction()`

### References

- `apps/api-gateway/src/modules/governance/squads.service.ts`
- `apps/api-gateway/src/config/env.ts` — `SQUADS_MULTISIG_*` env vars
- `.env.example` — Squads configuration section
- `NEXT_ACTIONS.md` — Phase 3: Governance & AI

---

## Issue 7 — [Security] Generate and store production secrets

**Labels**: `security`, `infrastructure`

**Body**:

### Overview

Several environment variables require cryptographically secure random values
that must be generated before the first production deployment.

### Steps

1. **Generate `AUTH_TOKEN_SECRET`** (minimum 32 characters):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set secrets in Railway** (API Gateway) and **Vercel** (Dashboard):
   ```
   AUTH_TOKEN_SECRET=<generated-64-char-hex>
   DEFAULT_ADMIN_PASSWORD=<strong-password>
   DEFAULT_COMPLIANCE_PASSWORD=<strong-password>
   DEFAULT_AUDITOR_PASSWORD=<strong-password>
   ```

3. **Default users are seeded automatically** on first startup from
   `DEFAULT_*_EMAIL` and `DEFAULT_*_PASSWORD` env vars.  Change these
   passwords immediately after first login.

4. **Consider AWS KMS** for institutional-grade key management:
   - Set `SOLANA_SIGNING_MODE=kms`
   - Provision an AWS KMS Ed25519 key and set `AWS_KMS_KEY_ID`, `AWS_REGION`,
     `AWS_KMS_PUBLIC_KEY`
   - See `apps/api-gateway/src/modules/security/kms.service.ts`

### Acceptance Criteria

- [ ] `AUTH_TOKEN_SECRET` is a random 32+ character value (not the example value)
- [ ] Default user passwords are set to strong values
- [ ] Default passwords are changed on first login
- [ ] `AUTHORITY_KEYPAIR_PATH` points to a valid (non-example) Solana keypair

### References

- `apps/api-gateway/src/config/env.ts` — Secret validation (min 32 chars)
- `apps/api-gateway/src/modules/security/kms.service.ts` — KMS integration
- `.env.example` — All secret variable names

---

## Issue 8 — [Infra] Set up CI/CD environment variables for Neon + Upstash

**Labels**: `infrastructure`, `ci-cd`

**Body**:

### Overview

The GitHub Actions CI pipeline currently uses local Postgres and Redis Docker
services.  Once Neon and Upstash are provisioned, the CI pipeline should also
be tested against them (or at minimum with the same SSL/TLS configuration).

### Steps

1. **Add GitHub Actions Secrets** in repository Settings → Secrets and
   variables → Actions:
   ```
   NEON_DATABASE_URL     – Neon staging branch pooled URL
   UPSTASH_REDIS_URL     – Upstash dev database URL (rediss://)
   AUTH_TOKEN_SECRET     – 32+ char random value for CI
   VERCEL_TOKEN          – Vercel deploy token (for preview deployments)
   RAILWAY_TOKEN         – Railway token (for staging deployments)
   ```

2. **Update `.github/workflows/ci.yml`** to optionally run tests against Neon
   when `NEON_DATABASE_URL` is available:
   ```yaml
   DATABASE_URL: ${{ secrets.NEON_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/treasury_os' }}
   ```

3. **Add a Vercel Preview deployment step** to the CI workflow that deploys the
   dashboard on every PR.

4. **Add a Railway staging deployment step** that deploys the API Gateway to a
   Railway staging environment on merge to `main`.

### Acceptance Criteria

- [ ] GitHub Actions secrets created
- [ ] CI workflow updated to support Neon/Upstash secrets
- [ ] Preview deployments work on PRs (Vercel)
- [ ] Staging deployment works on merge to `main` (Railway)

### References

- `.github/workflows/ci.yml` — Current CI pipeline
- `DEPLOYMENT_GUIDE.md` — Full deployment instructions
