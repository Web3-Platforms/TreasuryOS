# TreasuryOS — Multi-Platform Deployment Guide

**Date**: 2026-03-28  
**Project Stage**: MVP Complete — Ready for Deployment

---

## Architecture Overview

TreasuryOS is a monorepo with two deployable services:

| Service         | Technology              | Port | Purpose                    |
| --------------- | ----------------------- | ---- | -------------------------- |
| **Dashboard**   | Next.js 14 (App Router) | 3000 | Compliance Officer Console |
| **API Gateway** | NestJS 10               | 3001 | REST API backend           |

**Infrastructure Dependencies**:
- PostgreSQL 15 (persistence)
- Redis 7 (task queues)
- Solana RPC (on-chain whitelist sync)

---

## Platform 1: Vercel (Dashboard Only)

> **Best for**: Frontend dashboard. Vercel natively supports Next.js monorepos.

### Setup
1. Connect your GitHub repo to Vercel.
2. In the Vercel project settings:
   - **Root Directory**: `.` (monorepo root)
   - **Build Command**: `npm run build -w @treasuryos/dashboard`
   - **Output Directory**: `apps/dashboard/.next`
   - **Framework Preset**: Next.js

3. Set environment variables:
   ```
   API_BASE_URL=https://your-api-gateway-url.com/api
   NEXT_PUBLIC_API_URL=https://your-api-gateway-url.com/api
   JWT_SECRET=<your-production-secret>
   ```

4. Deploy from `main` branch.

### Config File
A `vercel.json` has been created at the project root with API rewrites and security headers.

### Notes
- Vercel can only host the **Dashboard** (Next.js). The API Gateway requires a container runtime (see Railway/Replit below).
- The `output: "standalone"` setting in `next.config.mjs` is already enabled.

---

## Platform 2: Netlify (Dashboard Only)

> **Best for**: Alternative frontend hosting with edge functions.

### Setup
1. Connect your GitHub repo to Netlify.
2. Netlify will auto-detect the `netlify.toml` configuration.
3. Install the `@netlify/plugin-nextjs` plugin (configured in `netlify.toml`).
4. Set environment variables in the Netlify dashboard:
   ```
   API_BASE_URL=https://your-api-gateway-url.com/api
   NEXT_PUBLIC_API_URL=https://your-api-gateway-url.com/api
   JWT_SECRET=<your-production-secret>
   ```

### Config File
A `netlify.toml` has been created with build commands, Node 22, and API proxy redirects.

### Notes
- Like Vercel, Netlify hosts only the **Dashboard**.
- API requests are proxied via the redirect rule in `netlify.toml`.

---

## Platform 3: Cloudflare (Edge Proxy / Workers)

> **Best for**: CDN layer, DDoS protection, and edge caching in front of your services.

### Recommended Architecture
Cloudflare is best used as an **edge proxy** in front of TreasuryOS rather than hosting the NestJS backend directly (NestJS relies on Node.js APIs not available in Cloudflare Workers).

### Setup
1. Add your domain to Cloudflare.
2. Configure DNS records pointing to your Railway API Gateway host.
3. Enable **Cloudflare Proxy** (orange cloud) for DDoS protection and caching.
4. Add WAF rules for API rate limiting:
   ```
   Rule: Rate limit /api/auth/login to 10 requests/minute per IP
   Rule: Rate limit /api/* to 100 requests/minute per IP
   ```

### Advanced (Cloudflare Pages for Dashboard)
You can also deploy the Next.js dashboard via **Cloudflare Pages**:
```bash
npx wrangler pages project create treasuryos-dashboard
npx wrangler pages deploy apps/dashboard/.next --project-name=treasuryos-dashboard
```

### Notes
- The NestJS API Gateway is NOT compatible with Cloudflare Workers (requires `fs`, `pg`, `crypto` modules).
- Use Cloudflare as an edge layer, not a primary host for the backend.

---

## Platform 4: Replit (Development / Demo)

> **Best for**: Quick demos, hackathons, and development environments.

### Setup
1. Import the GitHub repo into Replit.
2. Replit will auto-detect `.replit` and `replit.nix` configuration files.
3. Set Secrets in the Replit Secrets panel:
   ```
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   JWT_SECRET=<your-secret>
   AUTH_TOKEN_SECRET=<your-secret>
   ```
4. Click **Run** — the dashboard will start on port 3000.

### Config Files
- `.replit` — Run command and port configuration
- `replit.nix` — System dependencies (Node 22, PostgreSQL 15, Redis)

### Notes
- Replit is best for **development and demos**, not production workloads.
- You may need to use Replit's PostgreSQL add-on or an external database.
- The Solana localnet validator won't run on Replit; use devnet instead.

---

## Local Docker Compose (Staging)

> **Best for**: Local staging environment replicating production.

```bash
docker-compose up --build
```

This starts:
- `db` → PostgreSQL 15 on port 5432
- `redis` → Redis 7 on port 6379
- `api-gateway` → NestJS backend on port 3001
- `dashboard` → Next.js frontend on port 3000

Access the dashboard at `http://localhost:3000`.

---

## Platform 5: Railway (API Gateway — Recommended for Production)

> **Best for**: Deploying the NestJS API Gateway with automatic scaling, managed Postgres add-on, and zero-config deployments.

### Setup

1. Create a new Railway project at [railway.app](https://railway.app).
2. Click **New Service → GitHub Repo** and connect this repository.
3. Railway will auto-detect `railway.json` and use Nixpacks to build the project.
4. Add environment variables in the Railway service settings:

```
NODE_ENV=production
AUTH_TOKEN_SECRET=<min-32-char-secret>
DATABASE_URL=<neon-or-supabase-pooled-url>
DATABASE_SSL=true
REDIS_URL=<upstash-rediss-url>
REDIS_QUEUE_ENABLED=true
REDIS_QUEUE_NAME=treasuryos:events
PROGRAM_ID_WALLET_WHITELIST=<deployed-program-id>
SOLANA_SIGNING_MODE=environment
AUTHORITY_KEYPAIR_JSON=[1,2,3,...]
DEFAULT_ADMIN_EMAIL=admin@yourcompany.com
DEFAULT_ADMIN_PASSWORD=<strong-password>
DEFAULT_COMPLIANCE_EMAIL=compliance@yourcompany.com
DEFAULT_COMPLIANCE_PASSWORD=<strong-password>
DEFAULT_AUDITOR_EMAIL=auditor@yourcompany.com
DEFAULT_AUDITOR_PASSWORD=<strong-password>
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
SUPABASE_STORAGE_BUCKET=compliance-docs
SQUADS_MULTISIG_ENABLED=true
SQUADS_MULTISIG_ADDRESS=<multisig-pda>
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_SYNC_ENABLED=true
FRONTEND_URL=https://<your-vercel-dashboard-url>
```

5. Railway automatically injects `PORT` — the API Gateway reads it at startup.
6. After deploy, copy the public Railway URL and set it as `API_BASE_URL` in your Vercel dashboard environment.

### Config File

`railway.json` at the project root configures build and start commands, health-check path, and restart policy.

### Notes

- Set `FRONTEND_URL` to your Vercel dashboard URL for correct CORS headers.
- Use the [Railway CLI](https://docs.railway.app/develop/cli) for local development: `railway run npm run dev:api`.
- Railway provides a free Postgres add-on, but Neon is recommended for production (better connection pooling for serverless).

---

## Platform 6: Neon (Managed Postgres)

> **Best for**: Serverless-compatible PostgreSQL for Vercel + Railway deployments. Scales to zero between requests.

### Setup

1. Create a project at [neon.tech](https://neon.tech).
2. Go to **Connection Details** and copy the **Pooled connection string**.
3. Set it as `DATABASE_URL` with `DATABASE_SSL=true` in all services.

```
DATABASE_URL=postgresql://[user]:[password]@[host].neon.tech/[dbname]?sslmode=require
DATABASE_SSL=true
```

4. Run migrations against the Neon database:

```bash
DATABASE_URL="<neon-url>" npm run db:migrate
```

### Notes

- Always use the **pooled** connection string (Session Pooler port 5432 or Transaction Pooler port 5432) for serverless/edge workloads.
- Enable **SSL** (`DATABASE_SSL=true` or `?sslmode=require` in the URL).
- Neon branches are useful for staging environments — create a branch for each PR.

---

## Platform 7: Upstash Redis (Managed Redis with TLS)

> **Best for**: Serverless-compatible Redis for Vercel + Railway. Each command opens a fresh TLS connection — no persistent connections needed.

### Setup

1. Create a Redis database at [upstash.com](https://console.upstash.com).
2. Copy the **Redis URL** (starts with `rediss://`).
3. Set it as `REDIS_URL` in all services:

```
REDIS_URL=rediss://default:<TOKEN>@<host>.upstash.io:6380
REDIS_QUEUE_ENABLED=true
REDIS_QUEUE_NAME=treasuryos:events
```

### Notes

- Use `rediss://` (double-s) for TLS — Upstash requires TLS for all connections.
- The lightweight queue client in `redis-queue.service.ts` handles `rediss://` TLS and AUTH automatically.
- Upstash's free tier provides 10,000 commands/day — sufficient for low-traffic compliance workloads.

---

## Platform 8: Supabase Storage

> **Best for**: Storing compliance documents, KYC artifacts, and audit reports.

### Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Storage → Create a new bucket** and create `compliance-docs` (set to **Private**).
3. Go to **Settings → API** and copy **Project URL** and **service_role key**.
4. Set in the API Gateway environment:

```
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
SUPABASE_STORAGE_BUCKET=compliance-docs
```

### Notes

- Use the `service_role` key **only on the server side** (API Gateway). Never expose it to the browser.
- The `StorageService` in `apps/api-gateway/src/modules/storage/` provides `upload()`, `createSignedUrl()`, and `delete()` methods.
- Signed URLs expire after 1 hour by default — adjust via the `expiresIn` parameter.

---

## Quick Reference Table

| Platform | Dashboard | API Gateway | Database | Best For |
|----------|-----------|------------|----------|----------|
| **Vercel** | ✅ Native | ❌ External | ❌ External | Frontend hosting |
| **Railway** | ❌ External | ✅ Native | ⚠️ Add-on | API backend |
| **Neon** | ❌ N/A | ❌ N/A | ✅ Managed | Serverless Postgres |
| **Upstash** | ❌ N/A | ❌ N/A | ✅ Redis | Serverless Redis |
| **Supabase** | ❌ N/A | ❌ N/A | ✅ Storage | Document storage |
| **Netlify** | ✅ Plugin | ❌ External | ❌ External | Frontend hosting |
| **Cloudflare** | ✅ Pages | ⚠️ Edge only | ❌ External | CDN/WAF layer |
| **Replit** | ✅ Native | ✅ Native | ⚠️ Add-on | Dev/Demo |
| **Docker Compose** | ✅ Container | ✅ Container | ✅ Local | Staging |
