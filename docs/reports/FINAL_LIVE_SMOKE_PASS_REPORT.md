# Final Live Smoke Pass Report

Task:
- `run-final-smoke-pass`

What was done:
- Confirmed the branded API custom domain is healthy at `https://api.treasuryos.aicustombot.net/api/health`.
- Re-pulled the root Vercel production environment and confirmed `API_BASE_URL=https://api.treasuryos.aicustombot.net/api`.
- Verified that the latest production dashboard deployment is live on commit `cb5ee0e`.
- Ran the final live smoke suite against:
  - dashboard custom domain `https://treasuryos.aicustombot.net`
  - branded API custom domain `https://api.treasuryos.aicustombot.net/api`
- Used the production demo auditor account to validate the authenticated read path without exposing any credentials.

What was verified:
- API health returns `200`.
- Demo login and `GET /api/auth/me` succeed on the branded API custom domain.
- API list endpoints succeed for:
  - entities
  - wallets
  - transaction cases
  - reports
- Dashboard login page renders and demo access is visible.
- Protected dashboard routes redirect unauthenticated traffic to `/login`.
- Authenticated dashboard pages render successfully:
  - `/`
  - `/entities`
  - `/wallets`
  - `/transactions`
  - `/reports`
- Entity detail succeeds through both the API and the dashboard custom domain.
- Report detail succeeds through the API.
- Report CSV download succeeds through:
  - the branded API route
  - the dashboard `/download/[id]` route

Production smoke summary:
- Checks run: `19`
- Passed: `19`
- Failed: `0`
- Warnings: `2`

Warnings that did not fail the smoke gate:
- No production wallets exist yet, so wallet detail smoke was skipped.
- No production transaction cases exist yet, so transaction detail smoke was skipped.

Why this matters:
- The final launch configuration now validates on the actual branded production routes, not just the temporary direct Railway fallback.
- The live dashboard, branded API domain, and report download path are all confirmed healthy together after the DNS fix and Vercel redeploy.
- The remaining launch work is no longer technical validation. It is the final go/no-go cutover decision.

Operational note:
- A root `.vercelignore` now excludes `test-ledger/**` so future manual Vercel CLI uploads do not trip over local validator socket files.

Current next ready task:
- `execute-launch-cutover`

Status:
- Completed
