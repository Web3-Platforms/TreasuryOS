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

When enabled, the dashboard transaction-case detail page shows an **AI Advisory**
card sourced from the API gateway route:

- `GET /api/ai/transaction-cases/:caseId/advisory`

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
AI_ADVISORY_MODEL=deterministic-case-advisor-v1
```

For a safe first rollout, leave everything else unchanged.

## Step-by-step

### 1. Confirm the rollout posture

Before enabling the flag, confirm the team understands:

- AI is advisory-only
- operators remain the decision-makers
- approvals and Solana execution do not depend on AI

### 2. Enable the flag in the API gateway

In Railway or your local API environment:

1. set `AI_ADVISORY_ENABLED=true`
2. optionally set `AI_ADVISORY_MODEL` to the label you want operators to see
3. redeploy the API gateway

If the flag is `false`, the API returns a disabled response and the dashboard
shows that AI advisories are unavailable.

### 3. Deploy the dashboard if needed

The dashboard now renders the AI advisory card on:

- `/transactions/[id]`

Redeploy the dashboard if your environment is still running an older build.

### 4. Verify the feature in the product

Use an existing transaction case or create one through the normal workflow.

Then:

1. open the transaction case detail page
2. confirm the **AI Advisory** card renders
3. confirm it shows:
   - summary
   - recommendation
   - risk factors
   - operator checklist
   - model label
   - generated timestamp
   - redaction profile

### 5. Train operators on the operating rule

Tell reviewers:

- the AI card helps explain and summarize
- the human review notes remain the decision of record
- evidence references and final rationale still have to be written by humans

### 6. Roll back if needed

If the advisory output is distracting or you want to pause rollout:

1. set `AI_ADVISORY_ENABLED=false`
2. redeploy the API gateway

The rest of the transaction-review workflow continues unchanged.

## What you should do next

After the first rollout is stable, the next manual/product decisions are:

1. decide whether TreasuryOS wants an external model provider at all
2. define retention and residency policy for future provider-backed prompts
3. decide whether operator feedback capture should be the next AI increment
4. if you move to a real provider, use `AI_ADVISORY_02_REAL_LLM_PROVIDER_SETUP.md`
   together with `docs/plans/REAL_LLM_INTEGRATION_PLAN.md`

## Related references

- `docs/reports/AI_ADVISORY_FOUNDATION_REPORT.md`
- `docs/guides/AI_ADVISORY_02_REAL_LLM_PROVIDER_SETUP.md`
- `docs/plans/AI_ADVISORY_LAYER_IMPLEMENTATION_PLAN.md`
- `docs/plans/REAL_LLM_INTEGRATION_PLAN.md`
- `docs/thoughts/brainstorm.md`
- `docs/thoughts/ai-growth-recommendations.md`
