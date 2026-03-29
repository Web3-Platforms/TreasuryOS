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
- Vercel can only host the **Dashboard** (Next.js). The API Gateway requires a container runtime (see GCP/Replit below).
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
2. Configure DNS records pointing to your API Gateway host (GCP Cloud Run, Railway, etc.).
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

## Platform 4: GCP Cloud Run (Full Stack — Recommended for Production)

> **Best for**: Production deployment. Both Dashboard and API Gateway run as managed containers.

### Prerequisites
- Google Cloud SDK (`gcloud`) installed
- Docker installed locally
- A GCP project with billing enabled

### One-Click Deploy
```bash
chmod +x scripts/deploy-gcp.sh
./scripts/deploy-gcp.sh YOUR_GCP_PROJECT_ID us-central1
```

This script will:
1. Enable required GCP APIs (Cloud Run, Artifact Registry)
2. Build multi-stage Docker images for both services
3. Push to Artifact Registry
4. Deploy both services to Cloud Run
5. Print the live URLs

### Manual Deploy
```bash
# Build API Gateway
docker build --target api-gateway-runner --build-arg APP_NAME=api-gateway -t treasuryos-api .

# Build Dashboard
docker build --target dashboard-runner --build-arg APP_NAME=dashboard -t treasuryos-dashboard .

# Push to your container registry and deploy via `gcloud run deploy`
```

### Environment Variables (Cloud Run)
Set these in the Cloud Run service configuration:
```
DATABASE_URL=postgresql://user:pass@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE
REDIS_URL=redis://your-redis-host:6379
JWT_SECRET=<production-secret-min-32-chars>
AUTH_TOKEN_SECRET=<production-secret-min-32-chars>
DEFAULT_ADMIN_EMAIL=admin@yourcompany.com
DEFAULT_ADMIN_PASSWORD=<strong-password>
DEFAULT_COMPLIANCE_EMAIL=compliance@yourcompany.com
DEFAULT_COMPLIANCE_PASSWORD=<strong-password>
DEFAULT_AUDITOR_EMAIL=auditor@yourcompany.com
DEFAULT_AUDITOR_PASSWORD=<strong-password>
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PROGRAM_ID_WALLET_WHITELIST=<your-deployed-program-id>
AUTHORITY_KEYPAIR_PATH=/secrets/authority-keypair.json
SOLANA_SYNC_ENABLED=true
```

---

## Platform 5: Replit (Development / Demo)

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

## Quick Reference Table

| Platform | Dashboard | API Gateway | Database | Best For |
|----------|-----------|------------|----------|----------|
| **Vercel** | ✅ Native | ❌ External | ❌ External | Frontend hosting |
| **Netlify** | ✅ Plugin | ❌ External | ❌ External | Frontend hosting |
| **Cloudflare** | ✅ Pages | ⚠️ Edge only | ❌ External | CDN/WAF layer |
| **GCP Cloud Run** | ✅ Container | ✅ Container | ✅ Cloud SQL | Full production |
| **Replit** | ✅ Native | ✅ Native | ⚠️ Add-on | Dev/Demo |
| **Docker Compose** | ✅ Container | ✅ Container | ✅ Local | Staging |
