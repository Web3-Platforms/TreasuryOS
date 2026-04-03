# TreasuryOS - Project Status Report

**Report Date:** April 3, 2026  
**Project:** TreasuryOS - Compliance & Treasury Management Platform  
**Status:** 🟢 **CONTROLLED PILOT ACTIVE**

## Executive summary

TreasuryOS is operating as a controlled pilot treasury and compliance platform
with the dashboard and API deployment paths stable, the launch hardening work
closed, and the first AI advisory slice active on transaction cases.

The latest platform milestone is the completion of the **real-provider AI
rollout**, plus a repo-ready manual advisory UX follow-up:

- OpenRouter is the live production AI provider.
- The configured live model is `qwen/qwen3.6-plus:free`.
- The dashboard advisory panel now generates analysis only when the operator
  clicks **Generate AI Analysis** and supports **Regenerate AI Analysis** for
  follow-up runs.

## Current platform posture

- pilot launch posture remains in effect
- the live pilot currently reports direct wallet sync enabled on Solana testnet
- mainnet remains gated behind audit and governance approval
- AI advisories remain advisory-only and never control approvals or signers
- external protocol audit preparation is documented, but the firm engagement is
  still pending

## Live platform state

| Area | State | Notes |
| --- | --- | --- |
| Dashboard | Live | Protected Next.js 16 dashboard on Vercel |
| API | Live | Railway deployment path and health endpoints active |
| AI provider | Live | `AI_PROVIDER=openrouter` |
| AI model | Live | `AI_ADVISORY_MODEL=qwen/qwen3.6-plus:free` |
| AI fallback | Live | deterministic fallback remains enabled |
| AI interaction model | Live | manual generate/regenerate flow is deployed and still needs live canary verification |
| Audit preparation | Ready | operator guides and handoff materials exist |

## What is already complete

- launch hardening and production env validation
- centralized signer handling and governance integration
- AI advisory foundation and persistence
- OpenAI-compatible and OpenRouter provider support
- operator feedback capture for AI advisories
- documentation reorganization under canonical `docs/` folders

## Remaining high-value work

1. Run the live canary and review the first operator feedback.
2. Engage the external protocol audit firm and complete the handoff cycle.
3. Advance the deferred production tracks:
   - Sumsub production rollout
   - banking credentials and mTLS
   - mainnet Solana posture once audit and governance gates are cleared
