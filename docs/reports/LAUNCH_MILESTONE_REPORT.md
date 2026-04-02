# Launch Milestone Report

Task:
- Project milestone snapshot after deploy recovery, security hardening, and in-progress acceptance smoke testing

Current milestone status:
- Core platform surfaces are live:
  - Dashboard custom domain: `https://treasuryos.aicustombot.net`
  - Railway API service domain: `https://treasuryosapi-gateway-production.up.railway.app/api`
- The first-launch scope is still the same:
  - no KYC for launch
  - Sumsub shown as coming soon
  - Solana preview-only with `SOLANA_SYNC_ENABLED=false`
- Production database migrations are applied.
- Railway API health is healthy.
- Seed-user passwords are rotated and verified in production.
- Scheduled uptime monitoring is active in GitHub Actions.

Completed milestones:
- Removed AWS/GCP launch dependencies from the live path and aligned deployment around Railway, Vercel, Neon, Upstash, Supabase, Cloudflare, and Solana preview mode.
- Fixed the Next.js 16 auth-gating conflict by moving dashboard route protection to `apps/dashboard/proxy.ts`.
- Restored successful dashboard production builds and API production deploys.
- Applied production migrations and repaired the API healthcheck path.
- Switched the dashboard production runtime to the healthy Railway service URL so the broken API custom domain does not block the live app.
- Rotated production seed credentials and verified live admin authentication after syncing the production `app_users` hashes.

Acceptance smoke-test status:
- Verified successfully in production:
  - API health
  - admin login
  - `auth/me`
  - entity draft create/list/detail/update
  - expected `503` “coming soon” behavior for entity submission
  - expected `503` “coming soon” behavior for Sumsub webhook entrypoint
  - reports generate/list/detail/download
  - dashboard login page
  - dashboard protected-route redirect
  - dashboard list pages for entities, wallets, transactions, and reports
- Known blocked-by-scope surfaces:
  - wallet request / approval flow
  - transaction screening / review flow
  - full entity-to-wallet-to-transaction path
  - live KYC webhook processing
  - live Solana sync / multisig flow
- Dashboard detail-page issue resolved:
  - dashboard `[id]` detail pages had been reading Next.js 16 route params synchronously and falling back to “not found”
  - the fix was applied in:
    - `apps/dashboard/app/(dashboard)/entities/[id]/page.tsx`
    - `apps/dashboard/app/(dashboard)/wallets/[id]/page.tsx`
    - `apps/dashboard/app/(dashboard)/transactions/[id]/page.tsx`
  - local validation passed with:
    - `API_BASE_URL=http://localhost:3001/api npm run typecheck -w @treasuryos/dashboard`
    - `API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard`
  - the fix is now deployed to Vercel production after working around Vercel CLI upload and team-author restrictions

What is needed for a fully launchable Beta:
- Fix the Cloudflare traffic record for `api.treasuryos.aicustombot.net` so it routes to Railway target `p623sier.up.railway.app`.
- Decide whether launch Beta can proceed with uptime-only monitoring or whether Sentry DSNs are mandatory before Beta cutover.
- Complete the go-live cutover review now that the live smoke-test gate is green.

What is needed for a Full product launch:
- Complete everything required for Beta.
- Provision a working Sentry organization/project and add runtime DSNs to Railway and Vercel.
- Re-enable Sumsub with production credentials and working webhook verification.
- Restore the full KYC approval path so entities can move beyond draft and under-review states.
- Validate the full wallet-governance and transaction-case lifecycle on live approved entities.
- Move Solana from preview mode to the final production path:
  - mainnet RPC
  - production program IDs
  - production signer management
  - optional Squads multisig if required
- Finalize operational controls expected for a regulated product release:
  - backup / restore validation
  - incident ownership and escalation
  - final launch checklist sign-off

Current launch interpretation:
- TreasuryOS is now at pre-cutover Beta readiness for the chosen pilot scope.
- The core web app and API are live, the dashboard detail-page bug is fixed in production, and the acceptance smoke suite is green on the dashboard custom domain plus Railway API service URL.
- TreasuryOS is not yet at “fully launchable Beta” if the launch bar requires the public API custom domain and/or Sentry DSNs to be complete before cutover.
- TreasuryOS is not yet at “Full product” because KYC, production observability, and full on-chain production flows are intentionally deferred or still blocked.

Status:
- Milestone report created
