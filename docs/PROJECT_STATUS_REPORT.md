# TreasuryOS - Project Status Report

**Report Date:** April 1, 2026  
**Project:** TreasuryOS - Compliance & Treasury Management Platform  
**Status:** 🟡 **PILOT LAUNCH RELEASE CANDIDATE**

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
  - Solana remains preview-only
  - `SOLANA_SYNC_ENABLED=false` at launch
- The remaining blockers are operational rather than code-level: API-domain DNS cutover, Sentry DSN/project setup, final live smoke checks, and the go/no-go release decision.

---

## Current Launch Posture

### Selected launch track

The current launch target is a **pilot launch**, not a full regulated production rollout.

This means:

- KYC submission stays disabled at launch
- Existing KYC-related UI is positioned as "coming soon"
- On-chain synchronization remains disabled for the first launch
- The live release should be communicated as a controlled rollout rather than a fully expanded production feature set

### Platform and deployment state

- Vercel dashboard deployment path is working
- Railway API deployment path is working
- Production database migrations are applied
- Railway API health is green
- The dashboard custom domain is live
- Scheduled uptime monitoring is active through GitHub Actions

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

## Remaining Launch Blockers

### 1. API custom-domain routing

- Railway has the API custom domain configured
- Cloudflare still needs to route `api.treasuryos.aicustombot.net` to the Railway service target

### 2. Sentry project and DSNs

- Application code is wired for Sentry
- Railway and Vercel DSNs are not fully in place yet because the necessary Sentry organization/project provisioning is still incomplete

### 3. Final live smoke pass

The final live smoke pass still needs to be re-run against the chosen pilot-launch scope after configuration is frozen.

### 4. Release cutover

The project still needs a final go/no-go review and monitored cutover window.

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

1. Finalize production configuration and DNS
2. Confirm observability posture (Sentry DSNs or explicit beta waiver)
3. Re-run the final live smoke pass
4. Execute the launch go/no-go review
5. Cut over and monitor
