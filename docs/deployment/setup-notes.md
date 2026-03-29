# Setup Notes

This repository is no longer just a scaffold comparison archive. The repo now includes the Phase 0 foundation plus the next implementation blocks through transaction review and reporting.

## What Was Added In This Phase

- MVP scope document
- architecture decision records for the locked pilot boundaries
- workflow and role model document
- PostgreSQL migration runner with apply and `--check` modes
- auth session migration
- file-backed pilot store for runtime auth/session state
- seeded pilot users
- bearer token issue, refresh, logout, and session inspection endpoints
- structured JSON request logging middleware
- lightweight Redis enqueue adapter
- `.env` loading for the API gateway, KYC service, bank adapter, and reporter
- dashboard status board updated to reflect the Phase 0 foundation
- GitHub Actions workflow for typecheck, build, tests, and migrations
- auth/session smoke tests
- route-level RBAC
- entity draft / submit / approve / reject workflow
- Sumsub sandbox applicant creation path from the gateway
- verified raw-body Sumsub webhook ingestion with idempotency and stale webhook protection
- audit event read endpoint for operator and auditor visibility
- wallet request / review / approve / reject workflow
- Solana whitelist preview and sync evidence recording
- deterministic whitelist SDK tests and wallet workflow integration coverage
- transaction screening API with baseline amount, manual-review, and high-risk rules
- transaction review queue listing and case detail endpoints
- case review, approve, reject, and escalate actions with notes and evidence references
- monthly MiCA operations report generation, report history, and CSV download
- transaction-rule unit coverage and end-to-end reporting coverage

## Verified Working

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run db:migrate`
- `npm run db:migrate:check`

## Current Runtime Shape

- auth/session runtime state is stored in `data/pilot-store.json`
- entity and KYC runtime state is stored in that same pilot store for now
- wallet state, transaction case state, and report history are stored there too
- relational schema is ready under `infra/db/migrations/`
- the API gateway is the current orchestrator for the pilot foundation
- the dashboard is still a status board, not yet a fully data-driven operator console

## What Is Still Missing

- PostgreSQL-backed repositories in the application runtime
- broader end-to-end tests beyond the current auth/onboarding/KYC slice
- PostgreSQL-backed repositories for the runtime
- richer report formats beyond the current pilot CSV

## Important Notes

- `bank-adapter` is explicitly post-MVP and should not receive pilot-critical engineering time now.
- Redis enqueueing is present as a lightweight baseline and is currently used for auth session lifecycle events.
- Set `REDIS_QUEUE_ENABLED=false` when you want local runs or tests without Redis connection noise.
- The current test suite now also boots the API app and verifies RBAC, entity onboarding, applicant creation, verified webhooks, wallet approval prerequisites, transaction review actions, report generation, and CSV downloads over HTTP.
- The Solana helper and program ID cleanup work are wired into the wallet governance slice, and the next major runtime gap is replacing the pilot store with PostgreSQL-backed repositories.
- If you need the exact pilot shape, use [`mvp-scope.md`](./mvp-scope.md) and [`workflow-model.md`](./workflow-model.md), not older comparison artifacts.
