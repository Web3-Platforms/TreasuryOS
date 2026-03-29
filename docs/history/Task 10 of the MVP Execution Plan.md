# Goal Description

Complete Task 10 of the MVP Execution Plan: "Implement monthly report export and staging deploy."
This represents the final milestone of the MVP. We will connect the existing backend CSV reporting module to the Next.js Dashboard UI and finish the pilot orchestration by providing deterministic Docker configurations tailored for staging deployment!

## Proposed Changes

### Dashboard Reporting Module
[MODIFY] `apps/dashboard/app/actions.ts`
- Add `generateReportAction(month: string)` linking to `POST /reports` in the API Gateway.

[NEW] `apps/dashboard/app/api/download/[id]/route.ts`
- Create a Next.js Server Route to seamlessly stream the raw generated CSV from the `api-gateway` directly to the compliance officer's browser, passing the required HttpOnly token transparently.

[NEW] `apps/dashboard/app/(dashboard)/reports/page.tsx`
- Build the Reports Center showing the historical generation queue and the extracted metrics summary.
- Add a month-picker form to request new operational reports.

[MODIFY] `apps/dashboard/components/app-shell.tsx`
- Complete the sidebar links by pointing `/reports` to the new route.

### Staging Orchestration (Docker & Compose)
[NEW] `Dockerfile` (root level)
- Create a Multi-Stage Turborepo Docker build file, capable of statically pruning dependencies and building the `dashboard` and `api-gateway` applications reliably alongside their local dependencies (like `@treasuryos/types`).

[NEW] `docker-compose.yml` (root level)
- Write the final MVP staging infrastructure orchestration mapping:
  - `postgres` (database)
  - `redis` (task queue base)
  - `api-gateway` (REST Backend)
  - `dashboard` (Next.js SSR Frontend)

[NEW] `.github/workflows/ci.yml`
- Introduce a basic GitHub Actions workflow file that runs `pnpm typecheck` and `pnpm build` across the repository on PRs, finalizing the requested initial CI pipeline for staging checks!

## User Review Required

> [!IMPORTANT]
> The single root `Dockerfile` will be configured using Turborepo's `turbo prune` to deploy efficiently without massive bundle sizes since this is an enterprise monolithic codebase.
> Please review and approve this plan, after which the staging orchestration and reporting systems will be completed!
