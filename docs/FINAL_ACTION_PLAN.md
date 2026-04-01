# Final Action Plan

Problem:
- TreasuryOS is close to launch, but it is not fully live-ready yet.
- Verified platform access is now in place for GitHub, Railway, Vercel, Neon, Upstash, Supabase, Cloudflare, Sentry, and local Solana tooling.
- Code validation is healthy for `npm run typecheck`, `npm test`, and `API_BASE_URL=http://localhost:3001/api npm run build`.
- The main remaining gaps are the final Cloudflare traffic record for the API custom domain, Sentry project/DSN provisioning, and the final go-live cutover decision.

Approach:
- Treat launch as a gated sequence instead of one big deploy.
- First, decide the exact launch cutline: pilot live vs full production live.
- Then clear deployability blockers, finalize production configuration, complete the KYC/on-chain path for the chosen scope, run smoke tests, and only then cut over.

Current verified state:
- Access ready: GitHub, Railway, Vercel, Neon, Upstash, Supabase, Cloudflare, Sentry, Solana CLI, Anchor CLI.
- Product state: Sumsub user-facing flows are intentionally disabled and shown as coming soon.
- Code state: the root typecheck/test/build validation now passes with the required dashboard `API_BASE_URL`, and dashboard production deploys now succeed with `apps/dashboard/vercel.json`.
- Infrastructure state: production DB migrations are applied, Railway API health is green, and `treasuryos.aicustombot.net` is live on Vercel.
- API domain state: Railway has a valid active custom domain for `api.treasuryos.aicustombot.net`, but Cloudflare still needs to route that hostname to `p623sier.up.railway.app`.
- Launch mitigation state: Vercel production `API_BASE_URL` now points at the healthy Railway service domain so the live dashboard is not blocked by the unfinished API custom-domain route.
- Observability state: GitHub Actions now has a scheduled uptime workflow that checks the live dashboard and Railway API health.
- Sentry state: application code is wired for Sentry, but no Railway/Vercel DSNs are configured yet because the current Sentry account has no organization/project available to generate them.
- Security state: production seed-user passwords are rotated to strong 24-character values, the live `app_users` hashes were synced to those rotated credentials, and live admin login is verified against the Railway service URL.
- Acceptance state: the live smoke suite now passes on the dashboard custom domain and Railway API service URL, including the dashboard `[id]` detail pages after the Next.js 16 params fix was deployed to Vercel production.

Launch tracks:
1. Pilot launch:
   - Keep Sumsub as coming soon.
   - Keep Solana on devnet or keep Solana sync disabled.
   - Clearly position the launch as pilot / controlled rollout.
2. Full production launch:
   - Re-enable Sumsub with production credentials.
   - Move Solana to the final live path (mainnet signer/programs and optional Squads multisig).
   - Complete all security, monitoring, and cutover checks before external launch.

Selected launch scope:
- The first launch will proceed without KYC.
- Sumsub stays disabled and marked as coming soon.
- Solana remains preview-only for the first launch.
- Keep `SOLANA_SYNC_ENABLED=false` at launch and defer real on-chain sync until after launch.
- Launch messaging and operations must not assume live KYC at launch.

Ordered execution plan:

Phase 1 — Scope and blocker removal
1. Decide the launch scope and commercial cutline.
   - Confirm whether the first live release is pilot-only or full production.
   - Confirm whether simulated bank-adapter behavior is acceptable for launch messaging.
2. Fix the dashboard build blocker.
   - Resolve the `middleware.ts` / `proxy.ts` conflict in `apps/dashboard`.
   - Re-run the full workspace build after the fix.

Phase 2 — Production configuration
3. Finalize Railway and Vercel production variables.
   - Railway: auth, database, Redis, Supabase, signer, frontend origin, Sentry DSN, and launch-scope-dependent KYC/on-chain values.
   - Vercel: `API_BASE_URL`, Supabase public values, Sentry DSNs, and any feature-flag values required for launch.
   - GitHub: set or verify `RAILWAY_TOKEN` if automated deployment is part of launch.
4. Configure domains, DNS, and TLS.
   - Point app and API domains through Cloudflare.
   - Verify Railway/Vercel custom domains and certificates.
5. Turn on observability.
   - Confirm Sentry DSNs in deployed environments.
   - Add uptime checks for `/api/health`.
   - Configure a log drain or confirm the chosen launch-time logging workflow.

Phase 3 — Feature readiness for the selected launch track
6. Sumsub path.
   - Full production launch: provision production Sumsub credentials, re-enable KYC, and verify webhook config.
   - Pilot launch: keep KYC disabled, align docs/UX/commercial messaging with "coming soon", and ensure no operator expects live KYC.
7. Solana / Squads path.
   - Full production launch: deploy/finalize the live program path, signer material, RPC, program IDs, and optional Squads multisig.
   - Pilot launch: explicitly keep the current devnet or sync-disabled path and document that scope.

Phase 4 — Deployment and hardening
8. Deploy and migrate.
   - Deploy API and dashboard with final environment settings.
   - Run database migrations in Railway.
   - Verify Supabase bucket access, Redis connectivity, and health endpoints in the deployed environment.
9. Security and operations hardening.
   - Rotate and verify seed user passwords.
   - Review secrets inventory and least-privilege settings.
   - Confirm backup/restore, incident contacts, and rollback steps.

Phase 5 — Launch acceptance and cutover
10. Run live smoke tests.
    - Auth/login, entity lifecycle, current KYC behavior, wallet governance, reports, monitoring, and domain routing.
11. Go/no-go review and launch.
    - Freeze deploys for the launch window.
    - Execute cutover.
    - Monitor logs, health checks, and Sentry after release.

Ready-now execution order:
- `launch-go-live-cutover`

Notes:
- The biggest decision is not technical but scope: whether you want the first live release to be a pilot with KYC/on-chain limits, or a full production launch with Sumsub production and a finalized Solana path.
- If you want the fastest path to "live", pilot launch is shortest.
- If you want regulated production launch, Sumsub production credentials and the final Solana path are mandatory gates.
- The only remaining domain-specific blocker is a Cloudflare DNS change for `api.treasuryos.aicustombot.net` to route traffic to `p623sier.up.railway.app`.
- The only remaining observability blocker is Sentry organization/project setup so DSNs can be added to Railway and Vercel.
- The live smoke suite passed with two expected scope warnings: no wallet/case detail data exists yet in production because KYC and downstream approvals are intentionally disabled for the first launch scope.
