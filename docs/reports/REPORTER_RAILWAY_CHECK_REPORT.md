# Reporter Railway Check Report

## Summary

I checked the live Railway project for `@treasuryos/reporter`, confirmed that
the service existed in a broken state, and then re-ran the deployment with the
repository's dedicated reporter manifest.

The reporter service is now healthy on Railway after a dedicated manual
redeploy. The good news is that this was never on the immediate pilot-critical
dashboard/API request path, because the dashboard reports page currently talks
to the API gateway's `/api/reports` endpoints rather than directly to the
reporter service.

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

## Recheck and Recovery Result

I re-checked the service and verified locally that the reporter workspace still
builds cleanly with:

- `npm run build -w @treasuryos/reporter`

I then linked a temporary Railway workspace directly to
`@treasuryos/reporter` and deployed a clean source bundle that:

- copied the repository's tracked files into a staging directory
- replaced the staged root `railway.json` with `infra/railway/reporter.railway.json`
- targeted the live reporter service directly

The first clean deploy was skipped because the service only deploys when files
matching `/apps/reporter/**` change:

- skipped deployment: `9d3572c1-a3d7-4e69-90fd-0879098d84d2`
- skipped reason: `No changes to watched files`

To force a real rebuild without changing the repository, I added a harmless
staging-only trigger file under `apps/reporter/` and redeployed again.

That recovery deploy succeeded:

- deployment ID: `32eb6b2e-b824-468f-9649-89dfe459eb1b`
- deployment status: `SUCCESS`
- build command: `npm ci --include=dev && npm run build --workspace=@treasuryos/reporter`
- start command: `npm run start:prod --workspace=@treasuryos/reporter`
- healthcheck path: `/api/health`

The successful runtime logs show the expected reporter startup:

- Nest app booted successfully
- `HealthController` mapped `GET /api/health`
- reporter bound to Railway's injected port and logged:
  - `Reporter listening on http://localhost:8080/api/health [production]`

The live Railway CLI service status now reports:

- service: `@treasuryos/reporter`
- deployment ID: `32eb6b2e-b824-468f-9649-89dfe459eb1b`
- status: `SUCCESS`
- stopped: `false`

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

## Operational Note

The service is healthy now, but the Railway history still shows why it drifted:

- repo-driven reporter deployments have previously picked up the root
  API-gateway `railway.json`
- manual dedicated reporter deploys can also be skipped unless a changed file
  matches `/apps/reporter/**`

So the current service is recovered, but future operator work on reporter should
remember:

- use the dedicated reporter manifest
- ensure the deployment includes a real change under `apps/reporter/**`, or
- clean up the Railway-side reporter source configuration so it no longer risks
  falling back to the root API manifest path
