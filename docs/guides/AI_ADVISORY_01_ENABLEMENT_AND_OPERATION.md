# AI Advisory Guide 01 — Enablement and Operation

This guide covers the **manual steps you own** to enable, verify, and operate
the first TreasuryOS AI feature safely.

## What shipped

The first AI slice is:

- **read-only**
- **transaction-case focused**
- **feature-flagged**
- **stored and auditable**
- **not allowed to approve, reject, escalate, or sign anything**
- **capable of deterministic, OpenAI-compatible, or OpenRouter provider modes**

When enabled, the dashboard transaction-case detail page shows an **AI Advisory**
card with manual controls sourced from the API gateway routes:

- `GET /api/ai/transaction-cases/:caseId/advisory`
- `POST /api/ai/transaction-cases/:caseId/advisory`

## What this feature does not do

It does **not**:

- replace deterministic screening rules
- replace human reviewers
- touch Solana signing
- change case status automatically
- replace the external protocol audit

## Variables you control

Set these in the API gateway environment:

```env
AI_ADVISORY_ENABLED=true
AI_PROVIDER=deterministic
AI_ADVISORY_MODEL=deterministic-case-advisor-v1
```

For a safe first rollout, start with deterministic mode.

If you want the OpenAI-compatible real-provider path:

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

If you want the OpenRouter path:

```env
AI_ADVISORY_ENABLED=true
AI_PROVIDER=openrouter
AI_ADVISORY_MODEL=openai/gpt-4.1-mini
AI_PROVIDER_API_KEY=<Railway secret only>
AI_PROVIDER_TIMEOUT_MS=10000
AI_PROMPT_VERSION=tx-case-v2
AI_ADVISORY_FALLBACK=deterministic
```

## Step-by-step

### 1. Confirm the rollout posture

Before enabling the flag, confirm the team understands:

- AI is advisory-only
- operators remain the decision-makers
- approvals and Solana execution do not depend on AI

### 2. Enable the flag in the API gateway

In Railway or your local API environment:

1. set `AI_ADVISORY_ENABLED=true`
2. choose `AI_PROVIDER=deterministic`, `AI_PROVIDER=openai-compatible`, or `AI_PROVIDER=openrouter`
3. if using the real-provider path, set the API key, base URL, prompt version,
   and fallback vars too
4. redeploy the API gateway

If the flag is `false`, the API returns a disabled response and the dashboard
shows that AI advisories are unavailable.

When `AI_PROVIDER` uses a real provider and `AI_ADVISORY_FALLBACK=deterministic`,
TreasuryOS will temporarily reuse a fresh fallback advisory for a short retry
window instead of stalling every page load on a failing provider.

### 3. Deploy the dashboard if needed

The dashboard now renders the AI advisory card on:

- `/transactions/[id]`

Redeploy the dashboard if your environment is still running an older build.

### 4. Verify the feature in the product

Use an existing transaction case or create one through the normal workflow.

Then:

1. open the transaction case detail page
2. confirm the **AI Advisory** card renders with a **Generate AI Analysis**
   button
3. click the button to create the first advisory
4. confirm it shows:
    - summary
    - recommendation
    - risk factors
    - operator checklist
    - provider
    - model label
    - prompt version
    - fallback status
    - generated timestamp
    - redaction profile
    - feedback controls
5. click **Regenerate AI Analysis** and confirm the advisory refreshes on demand

### 5. Train operators on the operating rule

Tell reviewers:

- the AI card helps explain and summarize
- the human review notes remain the decision of record
- evidence references and final rationale still have to be written by humans

### 6. Roll back if needed

If the advisory output is distracting or you want to pause rollout:

1. either set `AI_PROVIDER=deterministic` to leave AI on with no external model
2. or set `AI_ADVISORY_ENABLED=false` to disable the feature entirely
3. redeploy the API gateway

The rest of the transaction-review workflow continues unchanged.

## What you should do next

After the first rollout is stable, the next manual/product decisions are:

1. complete provider secret setup in Railway if you want the real-provider path
2. define retention and residency policy for provider-backed prompts
3. review early operator feedback before broader rollout
4. use `AI_ADVISORY_02_REAL_LLM_PROVIDER_SETUP.md` together with
   `docs/plans/REAL_LLM_INTEGRATION_PLAN.md` for the manual rollout lane

## Related references

- `docs/reports/AI_ADVISORY_FOUNDATION_REPORT.md`
- `docs/reports/AI_REAL_LLM_IMPLEMENTATION_REPORT.md`
- `docs/guides/AI_ADVISORY_02_REAL_LLM_PROVIDER_SETUP.md`
- `docs/plans/AI_ADVISORY_LAYER_IMPLEMENTATION_PLAN.md`
- `docs/plans/REAL_LLM_INTEGRATION_PLAN.md`
- `docs/thoughts/brainstorm.md`
- `docs/thoughts/ai-growth-recommendations.md`
