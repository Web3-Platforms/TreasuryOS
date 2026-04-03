# AI Advisory Guide 02 - Real LLM Provider Setup

This guide covers the **manual work you own** before TreasuryOS can move from
the built-in deterministic advisory provider to a real external LLM.

## What is already true today

The current shipped AI slice:

- is advisory-only
- does not call OpenAI, Anthropic, or another external model yet
- uses the built-in deterministic provider
- stays behind `AI_ADVISORY_ENABLED`

So this guide is for the **next phase**, not for the current rollout.

## What you need to decide

### 1. Choose the provider posture

Pick one of these paths:

1. managed provider API
2. managed provider through your cloud account
3. self-hosted model

For the first real integration, the recommended path is **one managed provider**
behind the existing API gateway abstraction.

### 2. Approve the security and privacy posture

Before any key is created, confirm:

- whether prompts are retained by the provider
- whether prompts can be excluded from training
- what region or residency options exist
- whether a DPA or other contractual addendum is required
- whether transaction-case data is acceptable for that provider path after
  TreasuryOS redaction

### 3. Create the service account and API key

When you are ready:

1. create a dedicated service account for TreasuryOS
2. create a scoped API key or credential
3. store it only in Railway or the approved secret manager
4. do **not** paste the raw secret into chat, markdown, git, or Jira

### 4. Decide the initial model

Choose one model for the first canary. Keep the decision narrow:

- one provider
- one model
- one region
- one use case: transaction-case advisories

Do not expand to wallet or report surfaces during the first real-provider cut.

## What engineering will need from you

Share these **non-secret** decisions with the repo team:

- provider name
- approved model name
- approved region or residency posture
- whether zero-retention / non-training mode is enabled
- any vendor base URL requirement
- who owns cost monitoring and credential rotation

Do **not** share the raw API key in chat.

## Where to store the secret

When the implementation phase is ready, put the key in the API gateway service
environment in Railway.

Expected future shape:

```env
AI_PROVIDER=managed-llm
AI_PROVIDER_API_KEY=<set in Railway only>
AI_ADVISORY_MODEL=<approved provider model>
AI_PROVIDER_TIMEOUT_MS=10000
AI_ADVISORY_FALLBACK=deterministic
```

These names are planned, not live yet. Follow the implementation PR or rollout
report for the final variable names.

## First-canary checklist

Before enabling a real provider:

1. confirm the deterministic advisory path is still available as fallback
2. confirm the rollout is still advisory-only
3. confirm no signer or approval path depends on AI
4. confirm provider error handling and timeouts are configured
5. confirm operators know how to report low-quality outputs

## What to ask for next

When you are ready to move beyond the current deterministic provider, the repo
work should follow:

1. `docs/plans/REAL_LLM_INTEGRATION_PLAN.md`
2. a provider integration implementation PR
3. a rollout report with validation evidence

## Related references

- `docs/plans/REAL_LLM_INTEGRATION_PLAN.md`
- `docs/plans/AI_ADVISORY_LAYER_IMPLEMENTATION_PLAN.md`
- `docs/reports/AI_ADVISORY_FOUNDATION_REPORT.md`
