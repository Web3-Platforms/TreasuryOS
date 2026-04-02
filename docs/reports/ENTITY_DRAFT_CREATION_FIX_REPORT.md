# Entity Draft Creation Fix Report

Task:
- Fix the broken `New Draft` flow in the dashboard Entities screen.

Problem found:
- The `New Draft` control on `/entities` was rendered as a plain button with no route, click handler, form, or server action behind it.
- As a result, operators could not create draft entities from the dashboard even though the UI suggested the feature existed.

What changed:
- Added a real entity draft creation route at `apps/dashboard/app/(dashboard)/entities/new/page.tsx`.
- Added a client-side draft creation form in `apps/dashboard/components/create-entity-form.tsx`.
- Added a server action in `apps/dashboard/app/actions.ts` that posts to the existing API `POST /entities` endpoint and redirects the operator to the newly created entity detail page.
- Updated the Entities list page so `New Draft` is now a real link instead of a dead button.
- Added role-aware gating so only Admin and Compliance Officer users see the draft creation affordance, matching the API RBAC rules.
- Added current-user and RBAC helpers to keep dashboard role checks aligned and reusable.
- Extended the entity detail page to display stored notes so newly entered draft metadata remains visible after creation.
- Updated the Vercel install command in both `apps/dashboard/vercel.json` and the root `vercel.json` to use `npm ci --include=dev`, because the dashboard build relies on workspace dev dependencies during production deploys.

Why this fixes the issue:
- The dashboard now has the full dependency chain required for entity creation:
  - authenticated current-user lookup,
  - role-aware access check,
  - real `/entities/new` page,
  - validated form submission,
  - server action to create the entity through the API,
  - list/detail cache revalidation,
  - redirect to the created entity.

Launch-scope behavior:
- New drafts are limited to `EU` jurisdiction because the API already enforces the pilot-launch Phase 0 restriction.
- KYC submission remains disabled for launch scope, but draft creation is now available again.

Validation:
- `API_BASE_URL=http://localhost:3001/api npm run typecheck -w @treasuryos/dashboard`
- `API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard`
- `npm run build -w @treasuryos/api-gateway`
- Deployed the dashboard fix to Vercel production and confirmed the deployment is aliased to `https://treasuryos.aicustombot.net`
- Verified the fresh production deployment with authenticated `vercel curl` checks:
  - Admin sees the `New Draft` link on `/entities`
  - Admin can open `/entities/new` and receives the full draft form
  - Auditor does not see `New Draft` on `/entities`
  - Auditor opening `/entities/new` receives the expected `Draft Creation Unavailable` message

Operator note:
- Public demo access currently uses the Auditor role, and the Auditor role intentionally cannot create entity drafts.
- That means the `New Draft` control is hidden for demo users and only available for Admin / Compliance Officer logins.
