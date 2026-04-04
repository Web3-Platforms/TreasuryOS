# TreasuryOS Next Actions

**Date:** 2026-04-03

This is the current prioritized execution list after the OpenRouter rollout and
manual AI advisory UX change.

## Priority 0 — Operationalize the new agent stack

- [ ] Add your personal and team secrets to the target MCP clients and the
  GitHub `copilot` environment as needed.
- [ ] Pilot the first three business agents:
  - Chief of Staff
  - Engineering Delivery
  - Revenue Ops / CRM
- [ ] Add the minimum MCP stack on at least one daily-driver client:
  - GitHub MCP
  - filesystem MCP
  - git MCP
  - read-only Postgres access
- [ ] Decide which optional business connectors should be enabled first:
  - Slack
  - Notion
  - CRM
  - analytics / Sentry

## Priority 1 — Close the live AI rollout loop

- [ ] Run a live `/transactions/[id]` canary and confirm:
  - no advisory is generated on page load
  - the page shows **Generate AI Analysis** before first run
  - the page shows **Regenerate AI Analysis** after a saved advisory exists
  - provider/model metadata reflects OpenRouter and the configured model
- [ ] Review the first operator feedback submissions and capture any product or
  policy follow-up.
- [ ] Decide whether the current live model remains
  `qwen/qwen3.6-plus:free` or should be upgraded after canary review.

## Priority 2 — Start the external protocol audit lane

- [ ] Complete the testnet audit environment handoff prerequisites from
  `docs/guides/PROTOCOL_AUDIT_02_TESTNET_ENVIRONMENT_SETUP.md`.
- [ ] Select and engage the external audit firm using
  `docs/guides/PROTOCOL_AUDIT_01_AUDITOR_ENGAGEMENT.md`.
- [ ] Run the auditor handoff package and kickoff using
  `docs/guides/PROTOCOL_AUDIT_03_HANDOFF_AND_KICKOFF.md`.

## Priority 3 — Advance deferred production dependencies

- [ ] Replace sandbox KYC posture with a planned Sumsub production rollout.
- [ ] Prepare live banking credentials and mTLS for the bank-adapter path.
- [ ] Keep Solana mainnet work gated behind audit completion and explicit
  governance approval.

## Already closed in this phase

- [x] AI advisory foundation shipped
- [x] OpenAI-compatible provider path shipped
- [x] OpenRouter provider path shipped
- [x] OpenRouter configured live in Railway
- [x] dashboard AI panel released from eager generation to explicit
  generate/regenerate
- [x] roadmap, launch, security, deployment, and guide docs reorganized under
  canonical `docs/` folders
