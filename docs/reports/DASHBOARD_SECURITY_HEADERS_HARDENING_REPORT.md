# Dashboard Security Headers Hardening Report

## Summary

This report documents the next Phase 1 production-hardening slice for TreasuryOS.

The API gateway already benefits from `helmet()` defaults, but the dashboard's browser-facing Vercel policy was still limited to a small baseline of `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`. This change hardens the dashboard surface with a broader browser-header policy while keeping the deployment safe for the current Next.js runtime.

## Problem

Before this change, the active dashboard deployment config only set three basic headers across all routes:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

That left several browser-side hardening gaps on the main operator-facing surface:

- no enforceable CSP guard for base URI, form submission, or object embedding
- no `Permissions-Policy` to disable sensitive browser capabilities the product does not use
- no explicit HSTS header in the app config
- no regression guard to ensure the active root `vercel.json` and the app-local `apps/dashboard/vercel.json` stayed aligned

## What changed

- Hardened both dashboard Vercel configs:
  - `vercel.json`
  - `apps/dashboard/vercel.json`
- Added a minimal enforceable CSP that is safe for the current Next.js deployment:
  - `base-uri 'self'`
  - `form-action 'self'`
  - `frame-ancestors 'none'`
  - `object-src 'none'`
- Added the following browser hardening headers to the dashboard response policy:
  - `Permissions-Policy`
  - `Strict-Transport-Security`
  - `Cross-Origin-Opener-Policy`
  - `Cross-Origin-Resource-Policy`
  - `Origin-Agent-Cluster`
  - `X-DNS-Prefetch-Control`
  - `X-Download-Options`
  - `X-Permitted-Cross-Domain-Policies`
- Preserved the existing headers:
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
- Added regression coverage in `tests/dashboard-security-headers.test.ts` so:
  - the root Vercel config must expose the hardened header set
  - the app-local dashboard Vercel config must stay aligned with the root config
- Updated long-lived documentation in `DEPLOYMENT.md` and `SECURITY.md` to reflect the stronger dashboard browser-header baseline and the pre-production verification checklist

## Operator impact

This change does not alter dashboard workflows, auth behavior, or API contracts.

It does harden the production browser surface in meaningful ways:

1. The dashboard remains non-embeddable through both `X-Frame-Options: DENY` and `frame-ancestors 'none'`
2. Browser features TreasuryOS does not currently need are explicitly disabled
3. HTTPS transport is reinforced by an app-level HSTS policy
4. Cross-origin process/resource isolation is tighter by default
5. Future config drift between the active and app-local Vercel configs now fails a test instead of silently shipping

## Current limitation

This change intentionally does **not** attempt a full nonce-based Next.js CSP.

TreasuryOS still needs a later hardening slice if it wants strict `script-src` and `style-src` enforcement for the dashboard runtime. The current CSP is intentionally narrow so it adds enforceable protection without risking breakage in the App Router build and hydration path.

## Validation

Validated with:

- `npm run lint`
- `npm run typecheck`
- `API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard`
- `node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/dashboard-security-headers.test.ts`
