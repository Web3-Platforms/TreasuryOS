# AI Real LLM Implementation Report

## Outcome

TreasuryOS now supports a **real OpenAI-compatible provider path** for
transaction-case advisories while preserving deterministic fallback, audit
traces, redaction boundaries, and human-in-the-loop control.

## What shipped

### API gateway

- OpenAI-compatible provider integration behind the existing `AiProvider`
  abstraction
- provider router that selects:
  - deterministic
  - OpenAI-compatible
  - deterministic fallback when configured
- short fallback reuse window so a recent deterministic fallback is reused
  briefly instead of retrying a failing provider on every page load
- strict JSON response parsing and schema validation
- provider timeout handling and explicit operator-visible failure messages
- advisory metadata persistence for:
  - provider
  - prompt version
  - fallback usage
  - provider latency
- new feedback endpoint:
  - `POST /api/ai/advisories/:advisoryId/feedback`

### Database

- `008_ai_feedback_and_provider_metadata.sql`
- `ai_advisories` now stores provider metadata for cache safety and reporting
- new `ai_feedback` table stores reviewer feedback per advisory snapshot

### Dashboard

- AI Advisory card now shows:
  - provider
  - prompt version
  - fallback status
  - provider latency when available
- reviewers can now record:
  - helpful / not helpful
  - accepted / edited / dismissed
  - optional note

## Safety model

The real-provider rollout keeps the original guardrails:

- advisory-only
- no signer access
- no automatic approval or rejection
- deterministic screening remains primary
- deterministic fallback remains available when the provider fails
- dashboard never calls the model directly

## Runtime configuration

```env
AI_ADVISORY_ENABLED=true
AI_PROVIDER=openai-compatible
AI_ADVISORY_MODEL=gpt-4.1-mini
AI_PROVIDER_API_KEY=<Railway secret only>
AI_PROVIDER_BASE_URL=https://api.openai.com/v1
AI_PROVIDER_TIMEOUT_MS=10000
AI_PROMPT_VERSION=tx-case-v2
AI_ADVISORY_FALLBACK=deterministic
```

Default-safe posture remains:

```env
AI_ADVISORY_ENABLED=false
AI_PROVIDER=deterministic
AI_ADVISORY_MODEL=deterministic-case-advisor-v1
```

## Validation

The following validation completed successfully:

```bash
npm run build -w @treasuryos/types
npm run typecheck
node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/api-gateway-auth.test.ts tests/api-gateway-production-env.test.ts
npm run build -w @treasuryos/api-gateway
API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard
```

## Manual rollout still required

The repo implementation is complete, but a live provider-backed rollout still
requires manual operator work:

1. create the provider account and API key
2. store `AI_PROVIDER_API_KEY` in Railway
3. set the chosen model and provider env vars
4. redeploy the API gateway
5. verify a canary advisory on `/transactions/[id]`
6. review early operator feedback before broader rollout

## Next recommended steps

1. complete the Railway secret setup for the chosen provider
2. run a limited canary with real operator feedback
3. track fallback rate, latency, and feedback quality
4. expand to additional AI surfaces only after the transaction-case path is
   stable
