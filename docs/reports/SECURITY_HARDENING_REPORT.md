# Security Hardening Report

Task:
- `launch-security-hardening`

What was done:
- Audited the live authentication and security posture across the API gateway code, Railway production variables, and the existing `SECURITY.md` runbook.
- Confirmed the current production auth baseline remains aligned with launch requirements:
  - `FRONTEND_URL=https://treasuryos.aicustombot.net`
  - `NODE_ENV=production`
  - `AUTH_TOKEN_TTL_MINUTES=480`
  - login throttling `5/min`, reports throttling `20/min`, default API throttling `200/min`
- Generated new strong 24-character passwords for the admin, compliance, and auditor seed users and stored them only in a session-local file outside the repository with restricted permissions.
- Updated Railway production variables for `DEFAULT_ADMIN_PASSWORD`, `DEFAULT_COMPLIANCE_PASSWORD`, and `DEFAULT_AUDITOR_PASSWORD`.
- Verified that the live Railway runtime environment matched the rotated password values.
- Found that the production `app_users` rows still held stale password hashes after the variable rotation and redeploy attempt.
- Synced the three seed-user records directly in the production database using the same `scrypt` password hashing algorithm as `apps/api-gateway/src/common/passwords.ts`.
- Updated `SECURITY.md` so future rotations explicitly require live login verification and document the manual hash-sync fallback if a redeploy does not refresh the stored seed-user hashes.

What was verified:
- All three production seed-user records now match the rotated credentials:
  - `user_admin`
  - `user_compliance`
  - `user_auditor`
- Live admin login against `https://treasuryosapi-gateway-production.up.railway.app/api/auth/login` returns `200 OK`.
- The live login response returns the expected admin identity and an access token.

Why this matters:
- The launch accounts no longer depend on the previously seeded passwords.
- The production authentication path is now verified with the rotated credentials instead of assuming that a variable update propagated correctly.
- The security runbook now reflects the real production behavior, which reduces the chance of a silent partial rotation during future launch operations.

Current next ready tasks:
- `launch-acceptance-smoke-tests`
- `launch-go-live-cutover`

Status:
- Completed
