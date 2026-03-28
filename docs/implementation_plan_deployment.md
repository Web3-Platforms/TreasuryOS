# Goal Description

The goal is to stabilize the TreasuryOS monorepo by fixing the broken test suite (outdated imports) and then adapting the codebase for seamless deployment across five major platforms: **Vercel, Cloudflare (Edge), Netlify, Replit, and GCP (Cloud Run)**.
This involves both architectural adjustments (e.g., Edge-compatibility for backend modules) and platform-specific configuration files.

## User Review Required

> [!IMPORTANT]
> Some platforms (like Cloudflare Workers) require the backend to be "Edge-compatible" (no Node.js FS/Process dependencies). 
> I will attempt to bridge this using `wrangler.toml` and specific polyfills, but some features (like Redis-based reporting) might require a Cloudflare-native equivalent like `D1` or `KV` for full production.
> For the MVP handover, I will prioritize getting the **Dashboard** on Vercel/Netlify and the **API** on GCP/Replit.

## Proposed Changes

### stabilization (Tests)
[MODIFY] `tests/api-gateway-auth.test.ts`
- Replace `PilotStoreService` with `UsersRepository` and `SessionsRepository` (Postgres-based).
- Update `AuthService` instantiation to match the current NestJS structure.
- Fix broken imports for `database.service.ts`.

### Deployment: Vercel & Netlify (Frontend)
[NEW] `vercel.json` & `netlify.toml`
- Configure redirect rules for the dashboard.
- Ensure Environment Variable propagation for `NEXT_PUBLIC_API_URL`.

### Deployment: Cloudflare (Edge)
[NEW] `wrangler.toml` (apps/api-gateway)
- Export the NestJS app for Cloudflare Workers using the `@cloudflare/workers-types`.
- Add compatibility flags for Node.js modules where possible.

### Deployment: GCP (Cloud Run)
[MODIFY] `Dockerfile` & `docker-compose.yml`
- Already authored in Task 10, but will add `gcloud` deployment scripts for one-click Cloud Run service creation.

### Deployment: Replit (Template)
[NEW] `.replit` & `replit.nix`
- Configure the Replit environment to automatically install `solana-cli`, `node-22`, and `postgresql`.

## Verification Plan

### Automated Tests
- `npm run build`: Full monorepo build check.
- `npm test`: FIXING the currently failing `api-gateway-auth.test.ts`.
- `node scripts/simulate-transaction.ts`: Verify API connectivity.

### Manual Verification
- Generate a formal **Deployment Report** with step-by-step instructions for each platform.
