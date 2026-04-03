# TreasuryOS Roadmap

**Date:** 2026-04-03  
**Planning posture:** pilot-live, controlled expansion

## Phase 0 — Platform baseline

- [x] Monorepo, workspace builds, and deployment configuration
- [x] Dashboard auth path aligned with Next.js 16
- [x] Railway and Vercel delivery paths validated
- [x] API hardening guardrails and production env validation

## Phase 1 — Pilot-ready treasury and compliance platform

- [x] Institutional entity workflows
- [x] transaction screening and case handling
- [x] reporting and audit logging
- [x] wallet governance and signer loading
- [x] pilot launch cutover and uptime monitoring

## Phase 2 — AI advisory delivery

- [x] transaction-case advisory foundation
- [x] deterministic provider baseline
- [x] OpenAI-compatible provider support
- [x] OpenRouter provider support
- [x] provider metadata, fallback tracking, and operator feedback capture
- [x] manual generate/regenerate dashboard UX
- [ ] release and verify the manual generate/regenerate dashboard UX in
      production
- [ ] live canary review and first feedback assessment
- [ ] expand AI to additional read-only surfaces only after the transaction-case
      path is stable

## Phase 3 — External trust and assurance

- [x] internal protocol-audit preparation guides
- [ ] external protocol audit engagement
- [ ] audit findings remediation cycle
- [ ] audit sign-off for any future mainnet or deeper on-chain expansion

## Phase 4 — Production connectivity

- [ ] Sumsub production token and webhook rollout
- [ ] banking credentials, mTLS, and live message relay
- [ ] production operating procedures for regulated customer onboarding

## Phase 5 — Solana production posture

- [ ] dedicated production RPC and fee strategy
- [ ] explicit production governance configuration
- [ ] mainnet gating review after audit and operational readiness

## Roadmap notes

- AI remains advisory-only and non-authoritative.
- Solana sync stays preview-first until audit and governance gates are closed.
- External audit is no longer blocked by missing repo documentation; it is now
  primarily an operator and vendor-management task.
