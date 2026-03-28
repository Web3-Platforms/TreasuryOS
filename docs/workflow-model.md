# Workflow Model

## Roles

### `admin`

- seed and manage pilot users
- authenticate and maintain sessions
- configure pilot environment values
- has full access to future entity, wallet, case, and report workflows

### `compliance_officer`

- review onboarding, wallet, and transaction decisions
- generate pilot reports
- inspect audit evidence

### `auditor`

- inspect audit evidence
- inspect reports
- no approval authority

## Workflow States

### Entity

- `draft`
- `submitted`
- `kyc_pending`
- `under_review`
- `approved`
- `rejected`

### Wallet

- `submitted`
- `under_review`
- `approved`
- `rejected`
- `synced`
- `sync_failed`

### Transaction Case

- `open`
- `under_review`
- `approved`
- `rejected`
- `escalated`

### Report

- `queued`
- `generated`
- `failed`

## Current Implementation Boundary

The state model is defined in [`packages/types/src/index.ts`](../packages/types/src/index.ts) and the first permission helpers live in [`packages/compliance-rules/src/index.ts`](../packages/compliance-rules/src/index.ts).

The current runtime now implements auth, entity onboarding, verified KYC webhooks, wallet governance, transaction review, and monthly report export on top of the file-backed pilot store. PostgreSQL-backed repositories and a data-driven operator console are the next major runtime steps.
