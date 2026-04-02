# Deploy and Migrate Report

Task:
- `launch-deploy-and-migrate`

What was done:
- Applied the production database migrations on Railway for the live API environment.
- Fixed the API healthcheck path so deploy health no longer depends on lazy seed-user initialization.
- Redeployed `@treasuryos/api-gateway` successfully on Railway production.
- Added `apps/dashboard/vercel.json` so Vercel builds the monorepo correctly from the dashboard root directory.
- Deployed the dashboard successfully to Vercel production and attached it to `treasuryos.aicustombot.net`.
- Updated Vercel production `API_BASE_URL` to the healthy Railway service URL `https://treasuryosapi-gateway-production.up.railway.app/api` and redeployed the dashboard so the live app no longer depends on the broken API custom domain.

What was verified:
- `https://treasuryosapi-gateway-production.up.railway.app/api/health` returns `200 OK`.
- `https://treasuryos.aicustombot.net` serves the live dashboard and redirects unauthenticated traffic to `/login`.
- Vercel production builds now complete successfully with the dashboard-root config.

Why this matters:
- The failed deploy chain is now broken: both the API and dashboard have healthy live deployments again.
- The launch dashboard path is operational even before the public API custom domain is corrected in Cloudflare.
- Database schema and application runtime are aligned in production instead of depending on an outdated deploy state.

Current next ready tasks:
- `launch-observability-enable`
- `launch-security-hardening`
- `launch-acceptance-smoke-tests`

Status:
- Completed
