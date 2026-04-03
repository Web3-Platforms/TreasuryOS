# AI Advisory Guide 02 - Real LLM Provider Setup

This guide covers the **manual work you own** to activate the shipped
real-provider path in TreasuryOS, including OpenAI-compatible and OpenRouter
choices.

## What is already true today

The repo now supports:

- deterministic AI advisories
- OpenAI-compatible provider-backed advisories
- OpenRouter-backed advisories
- deterministic fallback
- advisory feedback capture

The remaining manual work is provider account setup, secret storage, and canary
rollout.

## What you need to decide

### 1. Choose the provider posture

Pick one of these paths:

1. managed provider API
2. managed provider through your cloud account
3. self-hosted model

The current implemented path is **managed provider choices behind the existing
API gateway abstraction**:

1. OpenAI-compatible
2. OpenRouter

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

Put the key in the API gateway service environment in Railway.

OpenAI-compatible configuration shape:

```env
AI_ADVISORY_ENABLED=true
AI_PROVIDER=openai-compatible
AI_PROVIDER_API_KEY=<set in Railway only>
AI_PROVIDER_BASE_URL=https://api.openai.com/v1
AI_ADVISORY_MODEL=<approved provider model>
AI_PROVIDER_TIMEOUT_MS=10000
AI_PROMPT_VERSION=tx-case-v2
AI_ADVISORY_FALLBACK=deterministic
```

OpenRouter configuration shape:

```env
AI_ADVISORY_ENABLED=true
AI_PROVIDER=openrouter
AI_PROVIDER_API_KEY=<set in Railway only>
AI_ADVISORY_MODEL=<approved OpenRouter model, e.g. openai/gpt-4.1-mini>
AI_PROVIDER_TIMEOUT_MS=10000
AI_PROMPT_VERSION=tx-case-v2
AI_ADVISORY_FALLBACK=deterministic
```

`AI_PROVIDER_BASE_URL` does not need to be set for OpenRouter unless you are
intentionally overriding the default `https://openrouter.ai/api/v1`.

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
2. `docs/reports/AI_REAL_LLM_IMPLEMENTATION_REPORT.md`
3. a live rollout with your Railway provider secrets

## Related references

- `docs/plans/REAL_LLM_INTEGRATION_PLAN.md`
- `docs/plans/AI_ADVISORY_LAYER_IMPLEMENTATION_PLAN.md`
- `docs/reports/AI_ADVISORY_FOUNDATION_REPORT.md`
- `docs/reports/AI_REAL_LLM_IMPLEMENTATION_REPORT.md`
