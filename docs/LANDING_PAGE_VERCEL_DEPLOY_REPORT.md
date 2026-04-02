# Landing Page Vercel Deploy Report

Task:
- `deploy-landing-page`

What was done:
- Verified that `apps/landing-page` typechecks and builds locally with:
  - `npm run typecheck`
  - `npm run build`
- Confirmed that the linked Vercel project `landing-page` already had the required production environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
- Inspected repeated failed production deployments and found the project root directory was unset, so Git-triggered builds cloned the monorepo root, picked up the repository `vercel.json`, and attempted to build `@treasuryos/dashboard` instead of the landing page.
- Updated the Vercel project root directory to `apps/landing-page` so future deployments target the correct application inside the monorepo.
- Deployed a clean staged bundle that preserved the monorepo path `apps/landing-page` while avoiding the large root upload path and link confusion from direct CLI deploy attempts.

What was verified:
- The production deployment `landing-page-nnk04v2lv-ehabkhedrfathy-2862s-projects.vercel.app` reached `READY`.
- Vercel aliased that deployment to the public custom domain `https://www.treasuryos.xyz`.
- `https://www.treasuryos.xyz` returned `HTTP 200`.
- The live HTML on `https://www.treasuryos.xyz` contains the expected TreasuryOS landing-page content.

Why this matters:
- TreasuryOS now has its public landing page live on the intended custom domain in addition to the dashboard and branded API surfaces.
- The `landing-page` Vercel project is now aligned with the monorepo structure, so future Git-triggered deployments should build `apps/landing-page` rather than the dashboard app.

Operational notes:
- The failed historical `landing-page` deployments were caused by the Vercel project building from the repository root instead of the landing-page workspace.
- The public smoke target for this surface should be `https://www.treasuryos.xyz`.

Current next ready task:
- `execute-launch-cutover`

Status:
- Completed
