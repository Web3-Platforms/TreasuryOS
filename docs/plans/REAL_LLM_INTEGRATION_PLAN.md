# Real LLM Integration Plan

## Outcome

Integrate a **real external LLM provider** into the existing TreasuryOS AI
advisory foundation without weakening deterministic controls, RBAC, audit
traces, privacy boundaries, or Solana signing isolation.

## Starting point

TreasuryOS already has a safe foundation in place:

- advisory-only transaction-case AI route
- dashboard AI advisory card on transaction detail pages
- redaction and prompt-shaping boundary in the API gateway
- persistent `ai_advisories` storage
- deterministic provider fallback with no external API dependency

The next phase is **not** to replace that foundation. It is to add a real model
provider behind the same contract and rollout controls.

## Management workflow

### 1. Plan

#### In scope for the first real-provider phase

- keep the current transaction-case advisory surface
- add one real provider behind `AiProvider`
- preserve deterministic fallback for outages, testing, and rollback
- add operator feedback capture so advisory quality is measurable
- add provider metadata, prompt versioning, and evaluation traces

#### Out of scope

- automatic approvals or rejections
- autonomous wallet sync or Solana signing
- direct dashboard-to-model calls
- replacing the external protocol audit
- expanding AI to every module before the transaction-case slice is proven

#### Recommended provider posture

Start with **one managed provider** behind the existing API gateway boundary.
Keep the deterministic provider available as the safe fallback and regression
baseline. Provider choice should favor:

1. contractual privacy controls and a DPA
2. region or residency controls acceptable for TreasuryOS data
3. non-training or zero-retention mode
4. stable JSON / structured-output support
5. predictable latency and cost ceilings

## 2. Organize

### Workstreams

#### Product and governance

- define what a "good" advisory means
- define acceptance criteria for summary quality, recommendation quality, and
  reviewer trust
- decide whether feedback is optional or required on reviewed cases

#### Security and compliance

- classify what case data may leave TreasuryOS
- approve a vendor retention and residency posture
- define which logs retain full prompts versus hashes, snippets, or metadata only
- document incident handling for provider outages or malformed responses

#### Platform engineering

- extend the provider abstraction
- add real-provider configuration and secret handling
- add timeout, retry, fallback, and schema-validation controls
- persist provider metadata and feedback

#### Operations

- provision secrets only in Railway or the approved secret manager
- define rollout stages: local, preview, canary, broad enablement
- define rollback triggers and ownership

### Manual work you own

These steps cannot be completed from inside the repo:

1. choose the provider and commercial plan
2. complete privacy, legal, and security review
3. create the production service account and API key
4. store the key in Railway without sharing it in chat or source control
5. confirm approved residency, retention, and usage terms

See `docs/guides/AI_ADVISORY_02_REAL_LLM_PROVIDER_SETUP.md`.

## 3. Implement

### Phase A - provider-ready backend

1. extend `AiProvider` so the real provider can reuse the existing
   transaction-case advisory contract
2. add provider routing in the AI module so TreasuryOS can select:
   - deterministic
   - real external provider
   - deterministic fallback on failure
3. add structured prompt builders with explicit prompt-version identifiers
4. validate model responses against the advisory schema before saving
5. reject malformed or incomplete responses instead of silently accepting them

### Phase B - runtime controls

1. add provider timeout and failure policy
2. add fallback behavior that preserves current UX when the external provider is
   unavailable
3. add audit metadata for:
   - provider name
   - model name
   - prompt version
   - latency bucket
   - fallback usage
4. keep `AI_ADVISORY_ENABLED` as the top-level kill switch

### Phase C - storage and feedback

1. add `ai_feedback` storage for:
   - helpful / not helpful
   - accepted / edited / dismissed
   - optional operator note
2. store prompt or prompt-hash metadata according to the approved privacy policy
3. preserve advisory regeneration semantics so changed source context creates a
   new advisory snapshot

### Phase D - operator UX

1. keep the current AI Advisory card as the main read surface
2. add feedback actions for reviewers
3. make provider failures operator-visible without hiding the rest of the case
4. surface when deterministic fallback was used instead of the real provider

### Phase E - controlled rollout

1. enable locally against non-production data
2. enable in preview with a small reviewer cohort
3. compare real-provider output against the deterministic baseline
4. review operator feedback, latency, and cost before broader rollout
5. only after the transaction-case slice is stable, consider wallet or report
   expansion

## 4. Report and document

### Required repo artifacts

- update `docs/reports/AI_ADVISORY_FOUNDATION_REPORT.md` or add the next report
  when the real provider ships
- update `docs/ENVIRONMENT_VARIABLES.md` only when the new env vars are actually
  implemented
- update operator guides for enablement, fallback, and manual provider tasks
- update roadmap and project status docs so the shipped posture stays accurate

### Recommended evaluation report

Track at least:

- advisory success rate
- fallback rate
- median and p95 latency
- approximate cost per advisory
- operator helpfulness score
- percentage of advisories ignored, edited, or accepted

## 5. Maintain

After launch, maintain the real-provider path like any production dependency:

1. rotate provider credentials on schedule
2. review prompt versions and model changes before rollout
3. monitor cost, latency, and provider error trends
4. periodically re-check redaction coverage against new fields
5. preserve deterministic fallback so TreasuryOS never depends on a single
   vendor path to function

## Planned configuration shape

These variables are **planned for the implementation phase only**. They are not
live repository requirements yet.

```env
AI_ADVISORY_ENABLED=true
AI_PROVIDER=deterministic|managed-llm
AI_ADVISORY_MODEL=<provider model identifier>
AI_PROVIDER_API_KEY=<secret in Railway only>
AI_PROVIDER_BASE_URL=<optional vendor endpoint override>
AI_PROVIDER_TIMEOUT_MS=10000
AI_PROMPT_VERSION=tx-case-v2
AI_ADVISORY_FALLBACK=deterministic
```

The exact names can still change during implementation, but the architecture
should preserve:

- one kill switch
- one provider selector
- one explicit fallback path
- one explicit prompt version

## Exit criteria

The first real-provider phase is complete when:

- a real provider can generate transaction-case advisories through the existing
  API route
- malformed provider output is rejected safely
- deterministic fallback works without breaking the case workflow
- operator feedback is stored and reviewable
- audit metadata records provider, model, and prompt version
- the dashboard clearly distinguishes success, fallback, disabled, and error
  states
- TreasuryOS still has no AI signing authority and no autonomous approval path
