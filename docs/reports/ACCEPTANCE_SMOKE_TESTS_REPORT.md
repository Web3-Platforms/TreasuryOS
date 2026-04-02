# Acceptance Smoke Tests Report

Task:
- `launch-acceptance-smoke-tests`

What was done:
- Ran a live production smoke suite against:
  - dashboard custom domain `https://treasuryos.aicustombot.net`
  - Railway API service URL `https://treasuryosapi-gateway-production.up.railway.app/api`
- The first smoke pass exposed a real dashboard bug: dynamic `[id]` detail pages were reading Next.js 16 route params synchronously and rendering fallback “not found” states.
- Fixed the dashboard detail-page bug in:
  - `apps/dashboard/app/(dashboard)/entities/[id]/page.tsx`
  - `apps/dashboard/app/(dashboard)/wallets/[id]/page.tsx`
  - `apps/dashboard/app/(dashboard)/transactions/[id]/page.tsx`
- Validated the fix locally with:
  - `API_BASE_URL=http://localhost:3001/api npm run typecheck -w @treasuryos/dashboard`
  - `API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard`
- Deployed the dashboard fix to the live `treasury-os` Vercel project.
- Re-ran the full live smoke suite after the production deploy.

What was verified:
- API health returns `200`.
- Admin login and `GET /api/auth/me` succeed with rotated production credentials.
- Entity draft create, list, detail, and update succeed in production.
- Entity submission correctly returns `503` with “Sumsub KYC is coming soon”.
- Sumsub webhook endpoint correctly returns `503` with “Sumsub KYC is coming soon”.
- Report generate, list, detail, and CSV download succeed.
- Dashboard login page renders.
- Protected dashboard pages redirect unauthenticated traffic to `/login`.
- Dashboard list pages render correctly:
  - `/entities`
  - `/wallets`
  - `/transactions`
  - `/reports`
- Dashboard entity detail pages now render successfully on the live custom domain after the deploy fix.

Production smoke summary:
- Checks run: `22`
- Passed: `22`
- Failed: `0`
- Warnings: `3`

Known warnings that did not fail the smoke gate:
- No wallet detail smoke check ran because there are currently no wallets in production data.
- No transaction case detail smoke check ran because there are currently no transaction cases in production data.
- `https://api.treasuryos.aicustombot.net/api/health` still fails because the Cloudflare traffic record for the API custom domain has not been corrected yet.

Why this matters:
- The first-launch pilot scope is now smoke-tested on the live dashboard custom domain and live API service URL.
- The previously broken dashboard detail pages are fixed in production, so the main dashboard read paths now behave correctly for authenticated operators.
- The remaining launch questions are now external/platform gates rather than an unverified application runtime.

Current next ready task:
- `launch-go-live-cutover`

Status:
- Completed
