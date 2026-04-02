# TreasuryOS: Next Actions Roadmap

This document outlines the strategic roadmap for evolving the TreasuryOS MVP into a production-grade, MiCA-compliant operations suite.

## Immediate Release Closure
- [x] **Pilot Launch Scope Chosen**: First launch stays KYC-off and preview-only for Solana sync.
- [x] **Validated Local Baseline**: `npm run typecheck`, `npm test`, and `API_BASE_URL=http://localhost:3001/api npm run build` now pass from the repo root.
- [x] **Next.js 16 Auth Gate**: Dashboard route protection now lives in `apps/dashboard/proxy.ts`.
- [x] **Push Release Commits**: The validated local release-hardening commits are now on `origin/main`.
- [x] **Uptime Monitoring Activation**: GitHub Actions now has the active `TreasuryOS Uptime` workflow from `.github/workflows/uptime.yml`.
- [x] **GitHub CD Verified**: `.github/workflows/cd.yml` now succeeds from `main` with Railway Project Token auth and the exact `@treasuryos/api-gateway` service target.
- [x] **Cloudflare API DNS**: `api.treasuryos.aicustombot.net` now resolves to `treasuryosapi-gateway-production.up.railway.app`, and the branded API health endpoint returns `200`.
- [x] **Sentry Beta Waiver**: Sentry is explicitly waived for the beta launch and should be revisited during post-beta hardening.
- [x] **Production Env Verification**: GitHub secrets, Railway API variable names, and the root Vercel `treasury-os` dashboard variable names are now verified for the pilot scope.
- [x] **Final Live Smoke Pass**: The branded API plus live dashboard smoke pass completed with `19` checks passed, `0` failed, and `2` scope warnings for currently empty wallet/case data.
- [x] **Go/No-Go Cutover**: Executed the monitored release window; see `docs/LAUNCH_CUTOVER_RUNBOOK.md` and `docs/reports/LAUNCH_CUTOVER_EXECUTION_REPORT.md`.

## Phase 1: Security & Infrastructure (In Progress)
- [x] **Signer Refactor**: Centralized Solana authority loading for filesystem and Railway-injected signer material.
- [x] **Vercel/Serverless Readiness**: API Gateway optimized for serverless runtime.
- [ ] **Protocol Audit**: Hire a third-party security firm to audit the Anchor programs and Rust permissioning logic.
- [ ] **Infrastructure Provisioning**: Harden the managed Railway/Vercel/Cloudflare stack for production traffic.

## Phase 2: Real-World Connectivity (6-12 Weeks)
- [ ] **Banking Integration**: Secure production mTLS certificates for Amina/SWIFT and implement the live ISO20022 message relay.
- [ ] **Sumsub Webhooks**: Connect the KycService to live Sumsub webhooks for automated entity status transitions.
- [ ] **Solana Mainnet**: Set up a dedicated RPC node (Helius/Triton) and fee management.

## Phase 3: Governance & AI (Logic Implemented)
- [x] **Multi-Signature Handover**: Integrated **Squads V4** for institutional multisig governance.
- [ ] **AI-Assisted Screening**: Benchmarking transaction history using LLM-based risk scoring.

## Current Project Status
- **Core MVP**: [COMPLETED]
- **Operational Dashboard**: [STABLE]
- **Institutional Logic (Signer/Squads)**: [SYSTEM READY]
- **Security Posture**: [PRODUCTION-READY LOGIC]
- **Deployment**: [PILOT LAUNCH CANDIDATE]
