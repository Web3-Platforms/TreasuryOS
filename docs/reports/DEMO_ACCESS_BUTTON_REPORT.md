# Demo Access Button Report

Task:
- Add a quick demo button so visitors can explore TreasuryOS without typing credentials manually.

What changed:
- Added a `Continue with Demo` button to the dashboard login page.
- The button is only rendered when demo access is explicitly enabled and fully configured.
- Demo login is server-side only: the browser never sees the demo password.
- The feature is now deployed live on `https://treasuryos.aicustombot.net/login`.
- A live configuration drift was also corrected after rollout: the Vercel demo credentials were resynced to the current auditor seed-user credentials and production was redeployed so the button actually works for visitors.
- A later deployment regression briefly removed the button from production, and the login UI was redeployed so the demo entry point is visible again without regressing the entity-draft fix.

Files changed:
- `apps/dashboard/lib/feature-flags.ts`
- `apps/dashboard/app/actions.ts`
- `apps/dashboard/app/(auth)/login/page.tsx`
- `apps/dashboard/components/login-form.tsx`

How it works:
- The login page checks whether demo access is available.
- Demo access is considered available only when all of the following are true:
  - `DEMO_ACCESS_ENABLED=true`
  - `DEMO_ACCESS_EMAIL` is set
  - `DEMO_ACCESS_PASSWORD` is set
- When the button is clicked, the dashboard uses a server action to call the existing API login endpoint and set the normal `treasuryos_access_token` cookie.
- The existing manual email/password login flow remains unchanged.

Environment variables to configure:
- `DEMO_ACCESS_ENABLED=true`
- `DEMO_ACCESS_EMAIL=<account email to use for demos>`
- `DEMO_ACCESS_PASSWORD=<matching password>`

Recommended production setup:
- Prefer a dedicated low-privilege demo account instead of using your main admin account.
- If you want visitors to see the widest possible product surface, you can point demo access at a controlled pilot account, but be aware that its permissions define what demo users can do.
- If demo mode is not needed, set `DEMO_ACCESS_ENABLED=false` or remove the demo credentials to hide the button entirely.
- The current live configuration uses the `Auditor` seed account so demo users can browse the main product surfaces without receiving full admin access.
- If seed passwords are rotated again, update `DEMO_ACCESS_PASSWORD` in the live Vercel project at the same time or the demo button will stop working.

Deployment note:
- Add these variables to the Vercel environment for the live dashboard project before expecting the button to appear on `https://treasuryos.aicustombot.net/login`.

Validation:
- Dashboard typecheck passes.
- Dashboard production build passes.
- Live Vercel production deploy completed and was aliased back to `https://treasuryos.aicustombot.net`.
- Live login page HTML now contains `Continue with Demo`.
- Live Vercel production demo credentials now match the current auditor seed-user credentials.
- Direct API login using the live production demo credentials now returns `200` with an access token.
- The current production deployment also preserves the role-gated entity-draft flow introduced after the demo feature rollout.
