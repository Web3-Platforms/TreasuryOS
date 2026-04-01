# Reporter Railway Check Report

## Summary

I checked the live Railway project for `@treasuryos/reporter` and confirmed that the service exists, but its live deployment state does not match the repository's intended configuration.

The reporter service is not currently healthy or launch-ready on Railway. The good news is that this does not appear to be on the immediate pilot-critical dashboard/API request path, because the dashboard reports page currently talks to the API gateway's `/api/reports` endpoints rather than directly to the reporter service.

## Repository-Expected Reporter Configuration

The repository already includes a dedicated Railway manifest for the reporter service in `infra/railway/reporter.railway.json`.

That file expects Railway to use:

- Build command: `npm ci --include=dev && npm run build --workspace=@treasuryos/reporter`
- Start command: `npm run start:prod --workspace=@treasuryos/reporter`
- Healthcheck path: `/api/health`

The reporter runtime matches that expectation:

- `apps/reporter/src/main.ts` binds `PORT` or `REPORTER_PORT`
- it sets the global API prefix to `/api`
- it logs the health endpoint as `/api/health`
- `apps/reporter/src/common/health.controller.ts` exposes `GET /health`, which becomes `/api/health` after the global prefix is applied

## Live Railway Findings

I inspected the Railway project `treasuryos` and confirmed that the reporter service exists with service ID `f27a1eed-ae6d-4fce-9e1a-12f89c900a78`.

The live Railway state is currently mismatched:

- top-level service start command: `npm run dev --workspace=@treasuryos/reporter`
- attached public domains: none
- attached custom domains: none

The active reporter deployment is stuck in `INITIALIZING` and shows:

- CLI message: `Deploy reporter with dedicated config`
- build command: `npm run build --workspace=@treasuryos/reporter`
- start command: `npm run dev --workspace=@treasuryos/reporter`
- healthcheck path: `null`

The latest reporter deployment is `FAILED` and unexpectedly references the root `railway.json` / API gateway manifest instead of the dedicated reporter manifest:

- config file: `railway.json`
- build command: `npm ci --include=dev && npm run build --workspace=@treasuryos/api-gateway`
- start command: `npm run start:prod --workspace=@treasuryos/api-gateway`
- healthcheck path: `/api/health`
- commit: `a22b62cc3ba9f47474a5d880f0f2cf8ec5a2e616`

## Why This Matters

This strongly suggests that the Railway reporter service is misconfigured in at least one of these ways:

- it is using a development start command instead of the production reporter entrypoint
- it is missing the expected `/api/health` healthcheck on the active reporter deployment
- Railway is, at least for one deployment path, resolving the wrong manifest and picking up the root API gateway `railway.json`

That combination explains why the service is not in a clean healthy state even though the repository already contains a correct-looking dedicated reporter manifest.

## Launch Impact

This looks like a service-readiness problem, but not the main pilot launch blocker right now.

The user-facing reports page in `apps/dashboard/app/(dashboard)/reports/page.tsx` currently loads reports through `fetchApi('reports')`, and the API gateway serves that functionality from `apps/api-gateway/src/modules/reports/reports.controller.ts`.

The reporter app module itself currently wires a health controller plus reporting engine and scheduler services, which makes it look more like a side-service / scheduled worker than the primary request path for dashboard report viewing and downloads.

## Recommended Next Step

The reporter Railway service should be reconfigured and redeployed so the live service matches the repository manifest.

Recommended target configuration:

- Build command: `npm ci --include=dev && npm run build --workspace=@treasuryos/reporter`
- Start command: `npm run start:prod --workspace=@treasuryos/reporter`
- Healthcheck path: `/api/health`

After that, redeploy the reporter service and verify that:

- the deployment leaves `INITIALIZING`
- Railway health checks pass
- the service no longer picks up the root API gateway `railway.json`
- the service responds correctly on `/api/health`
