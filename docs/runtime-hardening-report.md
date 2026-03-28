# Runtime Hardening Report

Date: `2026-03-28`

## Scope

This pass reviewed the known runtime warnings from the previous delivery, re-ran the dependency audit, fixed actionable issues, and re-verified the workspace.

## Issues Reviewed

### 1. Nest wildcard route warning

Problem:

- Nest emitted a `LegacyRouteConverter` warning because the global logging middleware used `*` as the route path.

Fix:

- Updated the middleware registration to use `*path` in [`apps/api-gateway/src/app.module.ts`](../apps/api-gateway/src/app.module.ts).

Result:

- The warning no longer appears in the test run.

### 2. Redis queue noise in tests and local runs

Problem:

- Tests and local runs without Redis produced repeated `Redis enqueue failed` warnings.

Fix:

- Added `REDIS_QUEUE_ENABLED` to the API gateway environment schema in [`apps/api-gateway/src/config/env.ts`](../apps/api-gateway/src/config/env.ts).
- Updated the queue client in [`apps/api-gateway/src/modules/platform/redis-queue.service.ts`](../apps/api-gateway/src/modules/platform/redis-queue.service.ts) so:
  - queueing can be disabled explicitly
  - unavailability warnings are emitted once instead of on every call
- Disabled the queue in tests via [`tests/api-gateway-auth.test.ts`](../tests/api-gateway-auth.test.ts).
- Documented the setting in [`.env.example`](../.env.example), [`README.md`](../README.md), and [`docs/setup-notes.md`](./setup-notes.md).

Result:

- The Redis warning spam is gone from the test suite.

### 3. Dependency vulnerabilities

Problem:

- `npm audit` reported 3 high-severity vulnerabilities, all caused by `path-to-regexp@8.3.0`.

Fix:

- Added a root override for `path-to-regexp@8.4.0` in [`package.json`](../package.json).
- Added the resolved package at the workspace root so npm installs and hoists the patched version consistently.
- Refreshed the lockfile with `npm install`.

Result:

- `npm audit --json` now reports `0` vulnerabilities.

## Verification

The following commands passed after remediation:

- `npm audit --json`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run db:migrate:check`

## Current Residual Risks

These are not active breakages, but they still matter:

- The report export is still a pilot CSV summary, not a production regulator filing format.
- The lightweight Redis client still does not support authenticated Redis URLs.
- Several package manifests still use `latest`, which increases future dependency drift risk even though the current lockfile is now clean.
