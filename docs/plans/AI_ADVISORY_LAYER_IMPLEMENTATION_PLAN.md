# AI Advisory Layer Implementation Plan

## Objective

Design and introduce AI into TreasuryOS as a **non-authoritative advisory layer** that improves operator speed, clarity, and service quality without replacing deterministic controls, RBAC, auditability, or Solana signing authority.

## Why AI belongs in TreasuryOS

TreasuryOS already has structured workflows for:

- entity onboarding and KYC review
- wallet governance and whitelist approval
- transaction screening and case review
- reporting and audit evidence

These are high-context workflows with repeated human explanation work. AI can improve the system by helping operators:

- understand complex context faster
- convert raw data into clear explanations
- draft structured narratives for compliance and audit work
- identify anomalies or missing information earlier

The platform should use AI to make humans **better decision-makers**, not to replace them.

## Current repository posture

### What the repo already supports

- `apps/api-gateway/src/modules/transaction-cases/transaction-cases.service.ts`
  - deterministic rule-based transaction screening
  - triggered rules, case notes, and audit events
- `apps/api-gateway/src/modules/wallets/wallets.service.ts`
  - wallet request, review, approval, and chain sync metadata
- `apps/api-gateway/src/modules/reports/reports.service.ts`
  - structured monthly report generation
- `apps/api-gateway/src/modules/audit/audit.service.ts`
  - authoritative audit recording
- `apps/api-gateway/src/modules/entities/*`
  - entity lifecycle and onboarding state

### What the repo explicitly says today

- the first transaction-case AI advisory foundation now exists behind
  `AI_ADVISORY_ENABLED`
- the current shipped surface is:
  - `GET /api/ai/transaction-cases/:caseId/advisory`
  - advisory rendering on the dashboard transaction detail page
  - persistent `ai_advisories` storage with a redaction profile and model label
- the dedicated plan for integrating a real external provider now lives in:
  - `docs/plans/REAL_LLM_INTEGRATION_PLAN.md`
- external provider choice, operator feedback capture, and non-transaction AI
  surfaces remain planned follow-up work

## Design principles

1. **Human-in-the-loop**
   - AI may advise, summarize, and recommend.
   - Humans retain final approval authority.

2. **Deterministic controls stay primary**
   - compliance rules, state machines, RBAC, and env-gated Solana execution remain the source of truth
   - AI must not override those controls

3. **No signing authority**
   - AI must never access or use `AuthoritySignerService`
   - AI must never be part of the signing path

4. **Auditability first**
   - AI outputs should be attributable, timestamped, and reviewable
   - operator acceptance or rejection of an AI suggestion should be traceable

5. **Privacy and redaction**
   - prompts must be built from shaped context objects
   - signer material, env secrets, raw tokens, and unnecessary sensitive payloads must never reach the model layer

6. **Graceful degradation**
   - the platform must continue functioning if the AI layer is unavailable
   - AI should be optional in the runtime path, especially for the first rollout

## AI role by service area

## 1. Entities and onboarding

### AI responsibilities

- summarize entity profile and review posture
- explain missing onboarding steps
- draft operator-facing review notes from existing structured data
- highlight inconsistencies between jurisdiction, risk level, and KYC state

### AI must not do

- change entity status directly
- approve or reject KYC
- consume raw signer or infra secrets

## 2. Wallet governance

### AI responsibilities

- summarize the requesting entity context before wallet review
- explain why a wallet request may deserve extra scrutiny
- draft a review checklist before a compliance officer approves a wallet
- summarize chain sync outcome after a testnet transaction succeeds or fails

### AI must not do

- approve a wallet
- call the wallet sync path directly
- create, sign, or submit Solana transactions

## 3. Transaction cases

This is the strongest first AI use case because the system already produces structured inputs:

- `triggeredRules`
- entity and wallet context
- case notes
- historical review outcomes
- audit events

### AI responsibilities

- convert triggered rules into plain-language explanations
- generate a concise risk summary
- propose an operator checklist for review
- summarize similar prior cases
- draft decision rationale text for human editing

### AI must not do

- resolve a case automatically
- bypass approval permissions
- replace deterministic rule evaluation

## 4. Reports

### AI responsibilities

- draft narrative summaries for generated monthly reports
- translate operational metrics into executive-facing language
- generate auditor-facing explanations from the existing report data set

### AI must not do

- alter the report metrics themselves
- overwrite the authoritative CSV or underlying stored record without human action

## 5. Audit and evidence workflows

### AI responsibilities

- summarize long audit histories
- help operators search and understand prior events
- explain relationships between entities, wallets, reports, and transaction cases

### AI must not do

- replace the underlying audit log
- generate untraceable or anonymous actions

## Recommended architecture

## Service topology

The recommended pattern is:

`Dashboard -> API Gateway -> AI module/service -> existing repositories/services -> operator decision -> existing workflow -> optional Solana sync`

### Why this shape is recommended

- the dashboard should not call models directly
- the API gateway already owns auth, RBAC, validation, audit, and business context
- integration through the API preserves one trust boundary

## Proposed implementation structure

Add a dedicated module inside the API gateway, for example:

- `apps/api-gateway/src/modules/ai/ai.module.ts`
- `apps/api-gateway/src/modules/ai/ai.service.ts`
- `apps/api-gateway/src/modules/ai/ai-provider.interface.ts`
- `apps/api-gateway/src/modules/ai/ai-redaction.service.ts`
- `apps/api-gateway/src/modules/ai/ai-advisories.repository.ts`

### Suggested responsibilities

#### `AiService`

- receives structured request types such as:
  - case summary request
  - wallet review recommendation request
  - report narrative request
- coordinates prompt construction and response parsing

#### `AiRedactionService`

- strips or masks disallowed data before model calls
- enforces prompt-shaping rules

#### `AiProvider` abstraction

- isolates the chosen model vendor or self-hosted model
- makes testing and future provider changes easier

#### `AiAdvisoriesRepository`

- stores advisory outputs, status, timestamps, model identifiers, and operator feedback

## Recommended API outputs

AI should return structured, typed results instead of freeform blobs when possible:

```ts
type AiAdvisory = {
  id: string;
  advisoryType: 'case-summary' | 'wallet-review' | 'report-narrative' | 'audit-summary';
  resourceType: 'transaction_case' | 'wallet' | 'report' | 'entity';
  resourceId: string;
  summary: string;
  recommendation?: string;
  riskFactors: string[];
  confidence?: number;
  model: string;
  generatedAt: string;
  redactionProfile: string;
};
```

These outputs should remain advisory metadata, not authoritative workflow state.

## Proposed storage model

The implementation should plan for persistent AI records instead of ephemeral responses only.

### Recommended tables

- `ai_advisories`
  - stores generated advisory outputs and metadata
- `ai_feedback`
  - stores operator feedback such as accepted / edited / dismissed

### Why store them

- traceability
- quality review
- auditing of AI influence
- future tuning and evaluation

## Recommended dashboard integration

Use server-side dashboard integration patterns already present in the repo:

- fetch AI advisories through the API gateway
- render them in Server Components or server-side route flows
- keep user auth and role checks on the server side

### Suggested UI placements

- transaction case detail page
  - “AI summary”
  - “recommended review checklist”
- wallet review view
  - “AI review context”
  - “why this wallet may need extra review”
- report detail page
  - “draft narrative summary”
- audit views
  - “AI evidence summary”

## Security and compliance rules

## Hard prohibitions

The AI layer must never receive:

- `AUTHORITY_KEYPAIR_JSON`
- filesystem signer contents
- raw env secrets
- JWT secrets
- unrestricted infrastructure credentials

The AI layer must never:

- sign transactions
- trigger `WalletSyncService` directly without an operator action
- bypass RBAC or approval checks
- silently mutate authoritative business records

## Redaction policy

Before any model call:

- remove or mask secrets
- minimize raw KYC or document payloads
- include only the fields required for the advisory type
- tag each request with a redaction profile name for auditability

## Operational policy

- every AI output should have a model identifier
- every AI-generated recommendation should be attributable to a request and operator
- every human action taken after AI assistance should still produce normal audit events

## Solana integration boundary

The first real Solana testnet rollout must not depend on AI.

### Allowed Solana-adjacent AI behaviors

- summarize wallet readiness for sync
- explain a returned testnet transaction result
- draft operator-facing notes for a canary review

### Forbidden Solana-adjacent AI behaviors

- obtaining the signer
- generating the final approval decision autonomously
- replacing the wallet sync service
- deciding whether a transaction should be signed without a human action

## Rollout phases

## Phase 0: Foundations

- choose provider or hosting model
- define data redaction rules
- define advisory types and response schemas
- add storage and audit strategy for AI outputs
- add feature flags to keep AI optional

## Phase 1: Read-only assistance

Recommended first delivery:

- report narratives
- transaction-case summaries
- audit-history summaries

Why first:

- lowest operational risk
- no approval-path coupling
- easiest to evaluate safely

## Phase 2: Decision-support

After read-only assistance is stable:

- wallet review recommendations
- transaction-case triage suggestions
- onboarding summary generation

Still keep:

- human approval mandatory
- deterministic rules primary

## Phase 3: Broader workflow assistant

Later enhancements can include:

- cross-case anomaly detection
- entity-to-wallet-to-case contextual copilots
- multi-step operator briefings across modules

## Validation strategy

## Technical validation

- unit tests for redaction and response parsing
- integration tests with mocked AI provider responses
- schema validation for every advisory output
- feature-flag tests to ensure normal workflows still function without AI

## Operational validation

- manual review of sample advisories against real workflow data
- false-positive / low-quality output review
- latency and timeout behavior checks
- audit-trace verification for advisory generation and use

## Product validation

- do operators find the summaries useful?
- do they save time without reducing control quality?
- are recommendations understandable and easy to reject?

## Key decisions needed before implementation

1. provider hosting model
   - external managed model
   - self-hosted model
   - deferred decision
2. data residency and retention rules
3. whether prompt/response logs are retained in full or partially
4. which module gets the first AI feature
5. whether operator feedback on AI suggestions is mandatory or optional

## Recommended first implementation sequence

1. create the dedicated API gateway AI module and provider abstraction
2. implement redaction and structured response parsing
3. add persistent storage for advisory outputs and operator feedback
4. ship read-only transaction-case summaries
5. ship report narrative generation
6. expand to wallet-review recommendations
7. only then consider deeper Solana-adjacent assistance

## Exit criteria for the first AI phase

Phase 1 is complete when:

- the AI module is feature-flagged and optional
- advisory outputs are stored and auditable
- transaction-case summaries or report narratives work end to end
- operators can view the AI output without giving it approval authority
- the Solana signing path remains isolated from AI
