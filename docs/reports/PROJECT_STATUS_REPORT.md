# TreasuryOS - Project Status Report

**Report Date:** April 2, 2026  
**Project:** TreasuryOS - Compliance & Treasury Management Platform  
**Status:** 🟢 **PILOT LAUNCH CUTOVER COMPLETE**

---

## Executive Summary

TreasuryOS is now in a release-candidate state for its first live pilot launch.

- The codebase validates cleanly after dependency install with:
  - `npm run typecheck`
  - `npm test`
  - `API_BASE_URL=http://localhost:3001/api npm run build`
- The dashboard build/auth path is aligned with Next.js 16 by using root `apps/dashboard/proxy.ts`.
- The API gateway now uses the centralized `AuthoritySignerService` for filesystem and environment-injected signer material.
- The selected first-launch scope is intentionally limited:
  - Sumsub stays disabled and shown as "coming soon"
  - Solana remains preview-only with testnet as the beta cluster if on-chain sync is later enabled
  - `SOLANA_SYNC_ENABLED=false` at launch
- The go/no-go release decision and monitored cutover window are now complete; the current state is post-cutover monitoring plus deferred hardening work.

---

## Current Launch Posture

### Selected launch track

The current launch target is a **pilot launch**, not a full regulated production rollout.

This means:

- KYC submission stays disabled at launch
- Existing KYC-related UI is positioned as "coming soon"
- On-chain synchronization remains disabled for the first launch
- The non-mainnet Solana target for the beta path is testnet, not mainnet
- The live release should be communicated as a controlled rollout rather than a fully expanded production feature set

### Platform and deployment state

- Vercel dashboard deployment path is working
- Railway API deployment path is working
- Production database migrations are applied
- Railway API health is green at `https://treasuryosapi-gateway-production.up.railway.app/api/health`
- The public landing page is live at `https://www.treasuryos.xyz`
- The dashboard custom domain is live at `https://treasuryos.aicustombot.net`
- The API custom domain is now live at `https://api.treasuryos.aicustombot.net/api/health`
- The root Vercel production dashboard environment is restored to `API_BASE_URL=https://api.treasuryos.aicustombot.net/api`
- Scheduled uptime monitoring is active through the `TreasuryOS Uptime` GitHub Actions workflow
- GitHub CD is active on `main`, and run `#87` now succeeds with Railway Project Token auth and the exact `@treasuryos/api-gateway` service target
- The cutover runbook now exists at `docs/LAUNCH_CUTOVER_RUNBOOK.md`, CI now supplies the required dashboard `API_BASE_URL`, and GitHub uptime uses the public Vercel alias because Cloudflare challenges GitHub-hosted runners on the branded dashboard domain
- Production variable names are now confirmed on Railway for `@treasuryos/api-gateway` and on the root-linked Vercel project `treasury-os`; `apps/dashboard/.vercel` points to a separate stale `dashboard` project with no env vars and should not be used for production checks
- Sentry is explicitly waived for the beta launch and is no longer treated as a current release blocker
- The final live smoke pass is green on the branded API and dashboard custom domains with two scope warnings because production currently has no wallets or transaction cases

### Code and application state

- Dashboard authentication uses the cookie-to-bearer flow with `treasuryos_access_token`
- Dashboard route protection is handled by `apps/dashboard/proxy.ts`
- Report download handling supports the launch formats and routing behavior required by the current dashboard
- Entity draft creation is available for the allowed operator roles
- Wallet governance and signer loading now support the launch-time serverless environment model

---

## Verified Baseline

The current validated local baseline is:

1. `npm ci --include=dev`
2. `npm run typecheck`
3. `npm test`
4. `API_BASE_URL=http://localhost:3001/api npm run build`

Those checks now pass together from the repository root.

---

## Launch Cutover Result

### Release cutover

The launch cutover has been executed and the go decision passed.

Use `docs/LAUNCH_CUTOVER_RUNBOOK.md` for the operational procedure and `docs/reports/LAUNCH_CUTOVER_EXECUTION_REPORT.md` for the recorded outcome.

---

## Deferred to Post-Launch

These items are intentionally not part of the first launch:

- Production Sumsub rollout
- Live on-chain synchronization
- Solana mainnet finalization and fee-management path
- Full banking production integrations
- AI-assisted screening

---

## Immediate Recommended Sequence

1. Continue post-launch monitoring and deferred hardening from the roadmap
