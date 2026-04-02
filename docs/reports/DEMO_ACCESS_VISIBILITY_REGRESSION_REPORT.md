# Demo Access Visibility Regression Report

Task:
- Restore the missing `Continue with Demo` button on the live login page.

User-visible symptom:
- `https://treasuryos.aicustombot.net/login` no longer showed the demo button.
- Manual email/password login still worked, but the guided demo entry point had disappeared.

Impact:
- Visitors lost the fastest product exploration path.
- Demo credentials were still valid, but the UI no longer exposed the server-side demo login flow.

Root cause:
- The previous production deployment that fixed entity draft creation was built from a clean temporary clone.
- That clone included the entity-flow files, `apps/dashboard/app/actions.ts`, and feature-flag helpers, but it did not include the uncommitted login UI files:
  - `apps/dashboard/app/(auth)/login/page.tsx`
  - `apps/dashboard/components/login-form.tsx`
- Production therefore moved forward with the entity-draft fix while unintentionally rolling the login page back to an older version that did not render the demo button.

What was verified:
- Local dashboard source still contained the correct demo-login UI and server-side flow.
- Live Vercel production environment variables still had valid demo settings:
  - `DEMO_ACCESS_ENABLED=true`
  - `DEMO_ACCESS_EMAIL=<current auditor email>`
  - `DEMO_ACCESS_PASSWORD=<current auditor password>`
- The live login page HTML did not include `Continue with Demo`, confirming this was a deployed-code regression rather than an environment regression.

Fix applied:
- Reused the previously successful entity-fix deployment clone.
- Copied in the missing login UI files from the current working tree.
- Redeployed the dashboard production project.
- Verified the new production deployment is `Ready` and aliased to `https://treasuryos.aicustombot.net`.

Production validation:
- Public login page HTML now contains `Continue with Demo`.
- Direct API login using the configured demo credentials returns `200` with an access token.
- The restored deployment still preserves the entity-draft flow:
  - Admin sees `New Draft`
  - Admin can open `/entities/new`
  - Auditor still does not see entity draft creation controls

Operator note:
- When deploying from a clean temporary clone, copy every live dashboard surface that is still uncommitted locally, not just the files directly related to the current bug.
- For demo access specifically, the login page, login form, demo feature flags, and server actions must be deployed together.

Status:
- Fixed in production
