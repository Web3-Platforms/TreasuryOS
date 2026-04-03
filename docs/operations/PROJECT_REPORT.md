# TreasuryOS Project Report

**Date:** 2026-04-03  
**Stage:** Pilot operations with AI advisory rollout active

## Executive summary

TreasuryOS is operating as a controlled pilot treasury and compliance platform
with the core dashboard, API gateway, reporting, governance, and audit-log
surfaces in place.

Recent delivery work closed two important program lanes:

1. **AI advisory rollout** now supports deterministic, OpenAI-compatible, and
   OpenRouter provider modes for transaction-case analysis.
2. **Operations and audit preparation** now include explicit operator guides,
   rollout documentation, and external protocol audit handoff materials.

The current production AI posture is:

- production provider: `openrouter`
- live model: `qwen/qwen3.6-plus:free`
- fallback mode: deterministic

The latest shipped UX change is the manual
**Generate AI Analysis** / **Regenerate AI Analysis** flow, which is now live
and ready for canary verification.

## What is live

### Core platform

- Next.js 16 dashboard on Vercel
- NestJS 11 API gateway on Railway
- PostgreSQL-backed institutional workflows
- structured audit logging
- wallet, entity, KYC, reporting, governance, and security modules

### Governance and controls

- role-based access control
- Squads V4 integration path
- centralized signer loading
- production env validation and hardening checks
- readiness and health endpoints

### AI advisory

- feature-flagged transaction-case advisory surface
- persistent advisory snapshots and feedback records
- provider metadata and fallback tracking
- explicit operator-triggered generation/regeneration
- no signer access, no auto-decisioning, no approval bypass

## Current operating posture

| Area | Status | Notes |
| --- | --- | --- |
| Pilot dashboard + API | Active | Core pilot deployment paths are stable |
| AI advisory | Live, controlled | OpenRouter is live; manual generate/regenerate is now deployed and still needs canary review |
| External protocol audit | Prepared, not engaged | Guides and handoff workflow are documented |
| Solana sync | Testnet-active | The live pilot currently reports direct wallet sync enabled on Solana testnet; mainnet remains gated |
| Sumsub production rollout | Deferred | Current posture still keeps KYC launch gated |
| Banking production integrations | Deferred | Adapters exist, live credentials and mTLS still pending |

## Main work completed in the current phase

### AI delivery

- shipped the AI advisory foundation
- added real-provider routing and deterministic fallback
- added OpenRouter as a first-class provider option
- made OpenRouter the live production provider path
- changed the dashboard UX from eager generation to explicit generate/regenerate
- added operator feedback capture and persistence

### Documentation and coordination

- added AI rollout guides and real-provider setup guidance
- added protocol audit primer, engagement, testnet setup, and handoff guides
- created strategic AI thought material and growth recommendations
- reorganized canonical roadmap, readiness, report, deployment, and security
  docs under `docs/`

## Main open work

1. Run and review the live AI canary on `/transactions/[id]`.
2. Stand up the external protocol audit engagement and complete the user-owned
   handoff cycle.
3. Progress the deferred production surfaces:
   - Sumsub production webhook rollout
   - banking credentials and mTLS
   - Solana mainnet posture when audit and governance gates are satisfied

## Recommended companion docs

- [`ROADMAP.md`](ROADMAP.md)
- [`NEXT_ACTIONS.md`](NEXT_ACTIONS.md)
- [`LAUNCH_READINESS_REPORT.md`](LAUNCH_READINESS_REPORT.md)
- [`../reports/PROJECT_STATUS_REPORT.md`](../reports/PROJECT_STATUS_REPORT.md)
- [`../guides/README.md`](../guides/README.md)
