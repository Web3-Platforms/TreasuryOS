# Demo Access Incident Report

Task:
- Fix the live demo-access failure after rollout.

User-visible symptom:
- The `Continue with Demo` button rendered on `https://treasuryos.aicustombot.net/login`.
- Clicking it returned the message: `Demo access is temporarily unavailable.`

Impact:
- Public demo access was effectively broken even though the button was visible.
- Manual login remained available, but the frictionless product demo path did not work.

Root cause:
- The live Vercel production environment variables `DEMO_ACCESS_EMAIL` and `DEMO_ACCESS_PASSWORD` had drifted away from the current auditor seed-user credentials.
- The dashboard server action was therefore attempting to authenticate with the wrong credential pair.
- The dashboard collapsed the failed API login into the generic demo-access error message, which hid the true production configuration issue from the UI.

What was verified during investigation:
- The dashboard code path in `apps/dashboard/app/actions.ts` was correct: it reads `DEMO_ACCESS_EMAIL` and `DEMO_ACCESS_PASSWORD`, then calls the existing `/api/auth/login` endpoint.
- The API login route remains throttled at `5` requests per minute, but that was not the root cause of this incident.
- A pull of the live Vercel production environment showed that:
  - demo env keys were present,
  - but the stored email and password did not match the current auditor seed-user values.
- Direct API login with the stale Vercel demo credentials failed.
- Direct API login with the current auditor seed credentials succeeded and returned an access token.

Fix applied:
- Updated the live Vercel production variables:
  - `DEMO_ACCESS_ENABLED=true`
  - `DEMO_ACCESS_EMAIL=<current auditor email>`
  - `DEMO_ACCESS_PASSWORD=<current auditor password>`
- Re-pulled the live Vercel production env and confirmed the stored values now match the current session secret file used for the rotated seed credentials.
- Verified that direct API login with the corrected production demo credentials returns `200` and an access token.
- Redeployed the live `treasury-os` Vercel production deployment and re-aliased `https://treasuryos.aicustombot.net`.

Production validation:
- The login page still renders `Continue with Demo`.
- The production demo credentials now authenticate successfully against `https://treasuryosapi-gateway-production.up.railway.app/api/auth/login`.
- The corrected deployment is live on `https://treasuryos.aicustombot.net`.

Why this happened:
- Demo access currently depends on duplicated credentials in Vercel.
- Seed-user passwords had already been rotated during launch hardening.
- The Vercel demo credentials were not kept in sync with that rotation, so the demo feature silently drifted out of validity.

Operational follow-up:
- Every future seed-password rotation must also update:
  - `DEMO_ACCESS_EMAIL`
  - `DEMO_ACCESS_PASSWORD`
- After updating those variables, redeploy the live dashboard so the active production deployment picks up the new env snapshot.

Longer-term hardening option:
- Replace duplicated demo credentials with either:
  - a dedicated low-privilege demo account managed separately from seed users, or
  - a purpose-built demo-token flow so Vercel does not have to store a password that can drift from launch rotation work.

Status:
- Fixed in production
