# AI Real LLM Implementation Report

## Outcome

TreasuryOS now supports **real OpenAI-compatible and OpenRouter provider paths**
for transaction-case advisories while preserving deterministic fallback,
auditability, redaction boundaries, and human-in-the-loop control.

The current live production rollout uses:

- provider: `openrouter`
- model: `qwen/qwen3.6-plus:free`
- fallback: deterministic

## What shipped

### API gateway

- OpenAI-compatible and OpenRouter provider integrations behind the existing
  `AiProvider` abstraction
- provider router that selects deterministic, OpenAI-compatible, or OpenRouter
- deterministic fallback when configured
- OpenRouter requests can now disable model reasoning when needed to keep
  operator-triggered advisories inside the live latency budget
- short fallback reuse window so a recent deterministic fallback is reused
  briefly instead of retrying a failing provider on every request
- strict JSON response parsing and schema validation
- advisory metadata persistence for provider, prompt version, fallback usage,
  and provider latency
- feedback endpoint:
  - `POST /api/ai/advisories/:advisoryId/feedback`

### Dashboard

- AI Advisory card shows provider, prompt version, fallback status, and latency
- reviewers can record helpful/not-helpful and accepted/edited/dismissed
  feedback with an optional note
- transaction detail pages no longer auto-generate advisories on load
- the operator flow now uses:
  - **Generate AI Analysis**
  - **Regenerate AI Analysis**

### Storage and auditability

- `ai_advisories` stores provider metadata and the active advisory snapshot
- `ai_feedback` stores reviewer feedback per advisory
- generation and regeneration are attributed to the signed-in actor rather than
  a generic system identity

## Safety model

The real-provider rollout keeps the original guardrails:

- advisory-only
- no signer access
- no automatic approval or rejection
- deterministic screening remains primary
- deterministic fallback remains available when the provider fails
- the dashboard never calls the model directly

## Runtime configuration

### Default-safe posture

```env
AI_ADVISORY_ENABLED=false
AI_PROVIDER=deterministic
AI_ADVISORY_MODEL=deterministic-case-advisor-v1
```

### Live OpenRouter posture

```env
AI_ADVISORY_ENABLED=true
AI_PROVIDER=openrouter
AI_ADVISORY_MODEL=qwen/qwen3.6-plus:free
AI_PROVIDER_API_KEY=<Railway secret only>
AI_PROVIDER_BASE_URL=https://openrouter.ai/api/v1
AI_PROVIDER_TIMEOUT_MS=10000
AI_PROMPT_VERSION=tx-case-v2
AI_ADVISORY_FALLBACK=deterministic
```

## Validation

The following validation completed successfully:

```bash
npm run db:migrate
npm run db:migrate:check
npm run build -w @treasuryos/types
npm run typecheck
node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/api-gateway-auth.test.ts tests/api-gateway-production-env.test.ts
npm run build -w @treasuryos/api-gateway
API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard
```

## Live rollout status

The provider-backed rollout is no longer only planned; it is live in Railway
with OpenRouter configured as the default production provider path.

The follow-up manual advisory dashboard UX is now deployed. The next live
follow-through is the operator canary review.

The remaining work is operational follow-through:

1. run the live transaction-case canary
2. review early operator feedback
3. tune or upgrade the model if quality, latency, or fallback rate requires it
4. expand AI to more read-only surfaces only after the current path is stable
