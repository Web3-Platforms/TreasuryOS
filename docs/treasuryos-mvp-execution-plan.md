# TreasuryOS MVP Execution Plan

Date: 2026-03-28

## 1. MVP Goal

Ship a **paid pilot-ready MVP** of `TreasuryOS` for **one institutional customer** that can:

1. onboard one legal entity
2. run one KYC workflow through one provider
3. approve and whitelist one wallet
4. review one transaction case before execution
5. create one monthly compliance report
6. preserve an audit trail for every approval and status change

This MVP is not full fintech automation. It is a **narrow, defensible compliance control plane** that a real design partner can use in a pilot.

## 2. Product Scope to Lock Now

To reduce build time and maximize launchability, lock the MVP to these assumptions:

- deployment model: **single-tenant**
- customer profile: **one regulated institutional treasury / CASP / fintech**
- jurisdiction: **EU only**
- blockchain: **Solana devnet only**
- KYC provider: **Sumsub only**
- wallet policy: **manual review + on-chain whitelist**
- transaction policy: **manual case review before approval**
- report type: **one monthly MiCA operations report**
- roles: **admin, compliance_officer, auditor**
- settlement rails: **no live SWIFT or AMINA in MVP**

## 3. What Is In and Out

### In MVP

- auth and RBAC
- entity onboarding
- Sumsub sandbox integration
- provider webhook ingestion and verification
- wallet registration and approval workflow
- on-chain whitelist sync to Solana devnet
- transaction case queue with approve / reject
- audit logging
- one exportable monthly report
- basic staging deployment
- monitoring, secrets, backups, and ops runbooks at basic level

### Out of MVP

- multi-tenant SaaS
- Jumio fallback
- AMINA live integration
- SWIFT live integration
- multiple jurisdictions
- automated Travel Rule network connectivity
- mainnet deployment
- advanced pricing, billing, or invoicing
- full sanctions provider automation
- mobile app

## 4. Business Launch Shape

The first real launch should be:

- **pilot launch**, not broad public launch
- **design-partner driven**, not self-serve SaaS
- **manual-operations assisted**, not fully automated compliance

Commercially, that means you are selling:

- compliance workflow software
- institutional wallet governance
- transaction review and audit evidence
- reporting support

You are **not** yet selling a fully automated global compliance platform.

## 5. MVP Success Criteria

The MVP is successful only if all of these are true:

- one entity can be created, reviewed, approved, and stored in PostgreSQL
- one Sumsub applicant can be created in sandbox and webhook results are ingested
- one wallet can be requested, approved, and written to the whitelist flow
- one transaction case can be opened, assigned, approved or rejected, and fully audited
- one report can be generated for a defined month and exported
- every critical action has actor, timestamp, before/after state, and evidence reference
- RBAC prevents unauthorized approvals
- the full workflow works in staging without editing code
- the pilot can be demoed and used by a design partner

## 6. Hard Cut Line

If schedule slips, cut these first:

1. fancy dashboard work
2. AMINA adapter work
3. SWIFT work
4. Jumio fallback
5. extra report formats
6. extra jurisdictions

Do **not** cut:

- auth
- RBAC
- persistence
- audit logs
- webhook verification
- wallet approval workflow
- transaction review workflow
- basic staging and secrets handling

## 7. Delivery Sequence

Assumption: small focused team or solo founder with strong execution. Time is shown as **calendar weeks**.

## Phase 0: Scope Lock and Repo Cleanup

Duration: **Week 1**

### Outcome

Freeze the product definition so build effort does not sprawl.

### Work

- refresh docs so repo state matches reality
- define MVP scope in writing
- choose exact customer profile and jurisdiction wording
- choose Sumsub as sole provider for MVP
- mark `bank-adapter` as post-MVP
- define domain model and role model
- define approval states for entity, wallet, case, and report

### Deliverables

- product scope doc
- updated `README.md`
- updated `docs/setup-notes.md`
- architecture decision record for:
  - single-tenant
  - EU scope
  - devnet only
  - Sumsub only
  - post-MVP bank rails

### Exit Gate

- no unresolved questions on MVP scope
- no unresolved questions on user roles
- no unresolved questions on what is out of scope

## Phase 1: Foundation Hardening

Duration: **Weeks 2-3**

### Outcome

Create the minimum operational base required for a real product.

### Work

- add DB migration system
- add schema for:
  - users
  - roles
  - entities
  - wallets
  - kyc_checks
  - provider_webhooks
  - transaction_cases
  - audit_events
  - report_jobs
- add Redis-backed job or queue mechanism
- add auth module
- add RBAC guards
- add config validation for all services
- add structured logging
- add audit log write helper

### Primary Repo Targets

- `apps/api-gateway`
- `packages/types`
- new persistence package or module

### Exit Gate

- migrations run cleanly on fresh DB
- login works
- admin / compliance_officer / auditor permissions work
- audit events are written for login and privileged actions

## Phase 2: Entity Onboarding and KYC

Duration: **Weeks 4-5**

### Outcome

A real entity can move through onboarding and KYC.

### Work

- create entity CRUD and workflow endpoints
- add entity states:
  - draft
  - submitted
  - kyc_pending
  - under_review
  - approved
  - rejected
- implement Sumsub applicant creation
- implement webhook ingestion and signature verification
- map webhook results to entity and KYC state transitions
- store evidence metadata and provider references
- expose operational KYC views to dashboard

### Primary Repo Targets

- `apps/api-gateway`
- `apps/kyc-service`
- `apps/dashboard`

### Exit Gate

- compliance officer can submit an entity
- Sumsub sandbox applicant is created
- webhook updates entity status
- approval or rejection is visible in dashboard
- audit trail exists for all transitions

## Phase 3: Wallet Approval and On-Chain Sync

Duration: **Weeks 6-7**

### Outcome

Approved entities can request and approve wallets, with deterministic chain sync behavior.

### Work

- implement wallet request flow
- enforce entity approval prerequisite
- define wallet states:
  - submitted
  - under_review
  - approved
  - revoked
- replace placeholder Solana program IDs
- add deterministic tests for whitelist program
- turn dry-run sync into real instruction submission for devnet
- store tx signature / sync status / retry status
- surface chain sync state in dashboard

### Primary Repo Targets

- `programs/wallet-whitelist`
- `packages/sdk`
- `apps/api-gateway`
- `apps/dashboard`

### Exit Gate

- approved entity can submit a wallet
- compliance officer can approve wallet
- whitelist sync executes on devnet
- resulting tx signature is stored and viewable

## Phase 4: Transaction Review Workflow

Duration: **Weeks 8-9**

### Outcome

Transactions can be paused into a case queue and reviewed by compliance.

### Work

- define transaction case data model
- build case creation endpoint
- build assignment and status transition logic
- build approve / reject / escalate actions
- implement rules baseline for:
  - amount threshold
  - manual flag
  - wallet not approved
  - high-risk entity
- record rationale and reviewer notes
- add dashboard queue and case detail view
- add audit events for every case action

### Primary Repo Targets

- `apps/api-gateway`
- `packages/compliance-rules`
- `apps/dashboard`
- `programs/tx-monitor`

### Exit Gate

- case can be opened automatically or manually
- compliance officer can approve or reject
- notes and evidence are stored
- audit trail is complete

## Phase 5: Reporting MVP

Duration: **Week 10**

### Outcome

Generate one useful monthly report for internal and regulatory operations.

### Work

- define one report schema
- use monthly operational data from entities, wallets, and transaction cases
- generate export in CSV first
- optionally generate JSON as internal artifact
- store generation metadata and actor
- add dashboard report history

### Primary Repo Targets

- `apps/reporter`
- `apps/api-gateway`
- `apps/dashboard`

### Exit Gate

- operator can request report generation
- system creates report job and stores artifact metadata
- compliance officer can download report from dashboard

## Phase 6: Pilot Hardening

Duration: **Weeks 11-12**

### Outcome

Move from “works locally” to “can be used by a design partner.”

### Work

- add Dockerfiles and local compose/dev orchestration
- add CI for:
  - typecheck
  - build
  - migration check
  - integration tests
  - Anchor tests
- add staging deployment
- add secrets handling
- add health checks and alerting
- add backup policy for DB
- add audit export and incident runbook
- perform basic security review:
  - dependency scan
  - secret exposure scan
  - RBAC review
  - webhook verification review

### Exit Gate

- staging deploy is reproducible
- critical paths have tests
- no blocker-level auth or audit gaps
- pilot runbook exists

## 8. Concrete Backlog by Repo Area

### `apps/api-gateway`

- auth module
- user and session model
- RBAC guards
- entities module
- wallets module
- transaction cases module
- audit events module
- reports module
- service-to-service orchestration

### `apps/kyc-service`

- Sumsub sandbox client hardening
- webhook verification
- webhook ingestion endpoint
- idempotent event processing
- entity state sync

### `apps/reporter`

- one monthly report generator
- CSV export
- report job status tracking

### `apps/dashboard`

- replace shell with real operator screens
- port best ideas from `TreasuryOS2`
- auth-aware navigation
- entity review views
- wallet approval views
- transaction case queue
- reports history and download
- audit trail screens

### `packages/types`

- canonical domain types
- role and permission enums
- report schemas
- audit event types

### `packages/compliance-rules`

- transaction threshold rules
- wallet status rules
- high-risk manual review rules

### `packages/sdk`

- real program ID configuration
- whitelist and compliance registry helpers
- transaction submission helper

### `programs/wallet-whitelist`

- replace placeholder ID
- instruction tests
- authorization tests

### `programs/compliance-registry`

- replace placeholder ID
- define exact account layout
- add tests

### `programs/tx-monitor`

- replace placeholder ID
- add tests
- define exact state transitions

### `infra`

- Dockerfiles
- CI pipeline
- staging config
- secret management
- DB backup job

## 9. What to Reuse from TreasuryOS2

Reuse only UI concepts, not product architecture.

Recommended reuse order:

1. entities screen layout
2. wallet list and approval UI ideas
3. transaction monitor queue patterns
4. reports table patterns
5. audit trail display patterns

Do not reuse:

- mock data layer
- local-only state assumptions
- fake wallet connect behavior
- toast-only action flows

## 10. Test Plan for MVP

Minimum test coverage required before pilot:

- auth and RBAC integration tests
- entity onboarding workflow tests
- Sumsub webhook verification tests
- wallet approval workflow tests
- devnet sync tests for whitelist flow
- transaction case approval / rejection tests
- audit event creation tests
- report generation tests
- Anchor tests for all program instructions used by MVP

## 11. Launch Metrics

Track these from day one:

- time from entity submission to approval
- number of webhook failures
- wallet sync success rate
- case review turnaround time
- report generation success rate
- number of unauthorized action attempts blocked by RBAC
- percentage of critical actions with complete audit evidence

## 12. Go / No-Go Checklist

Go to pilot only if all are true:

- auth and RBAC are working
- audit log is complete for privileged actions
- Sumsub sandbox flow is stable
- wallet approval works end to end
- one devnet sync path works reliably
- one transaction review flow works reliably
- one monthly report can be generated and exported
- staging is stable
- secrets are not hardcoded
- team has incident and rollback steps documented

No-go if any of these remain true:

- approvals can be made without RBAC
- privileged actions lack audit records
- webhook signatures are not verified
- chain sync is still dry-run only
- program IDs are still placeholders
- environment setup requires manual source edits

## 13. Founder-Level Decision

If the goal is to launch a real business fast, the right build strategy is:

- **use `TreasuryOS` as the product**
- **use `TreasuryOS2` as UI reference**
- **cut bank rails from MVP**
- **ship one narrow pilot workflow first**

## 14. Immediate Next 10 Tasks

Execute these next, in this exact order:

1. update `README.md` and `docs/setup-notes.md`
2. create migration system and initial schema
3. implement auth + RBAC in `apps/api-gateway`
4. define entity onboarding state machine
5. implement Sumsub applicant creation and webhook verification
6. implement dashboard login and entity review views
7. implement wallet request and approval workflow
8. replace placeholder program IDs and make whitelist sync real
9. implement transaction case queue and review actions
10. implement monthly report export and staging deploy

## Final Execution Rule

Every feature added to MVP must pass this test:

> Does this directly help one institutional customer onboard, approve wallets, review transactions, generate a report, and prove who approved what?

If not, it is probably post-MVP.
