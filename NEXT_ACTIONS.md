# TreasuryOS: Next Actions Roadmap

This document outlines the strategic roadmap for evolving the TreasuryOS MVP into a production-grade, MiCA-compliant operations suite.

## Immediate Release Closure
- [x] **Pilot Launch Scope Chosen**: First launch stays KYC-off and preview-only for Solana sync.
- [x] **Validated Local Baseline**: `npm run typecheck`, `npm test`, and `API_BASE_URL=http://localhost:3001/api npm run build` now pass from the repo root.
- [x] **Next.js 16 Auth Gate**: Dashboard route protection now lives in `apps/dashboard/proxy.ts`.
- [x] **Push Release Commits**: The validated local release-hardening commits are now on `origin/main`.
- [x] **Uptime Monitoring Activation**: GitHub Actions now has the active `TreasuryOS Uptime` workflow from `.github/workflows/uptime.yml`.
- [x] **GitHub CD Verified**: `.github/workflows/cd.yml` now succeeds from `main` with Railway Project Token auth and the exact `@treasuryos/api-gateway` service target.
- [ ] **Cloudflare API DNS**: Route `api.treasuryos.aicustombot.net` to the active Railway service target.
- [ ] **Sentry Provisioning**: Create/attach the final Sentry project and DSNs, or explicitly waive Sentry for beta launch.
- [ ] **Production Env Verification**: Reconfirm the final Railway/Vercel/GitHub variables for the selected pilot scope.
- [ ] **Final Live Smoke Pass**: Re-run launch smoke checks after config freeze.
- [ ] **Go/No-Go Cutover**: Execute the monitored release window.

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
