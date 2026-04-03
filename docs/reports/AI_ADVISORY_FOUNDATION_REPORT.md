# AI Advisory Foundation Report

## Outcome

TreasuryOS now ships its first AI layer slice as a **read-only transaction-case
advisory system** behind a feature flag.

## What shipped

### API gateway

- new `ai` module in `apps/api-gateway/src/modules/ai/`
- provider abstraction with a safe built-in deterministic provider
- redaction service that shapes transaction-case context before advisory
  generation
- persisted advisory storage in the new `ai_advisories` table
- endpoint:
  - `GET /api/ai/transaction-cases/:caseId/advisory`

### Dashboard

- transaction detail page now renders an **AI Advisory** card
- the card shows:
  - summary
  - recommendation
  - risk factors
  - operator checklist
  - model label
  - generated timestamp
  - redaction profile

### Shared contract

- shared AI advisory types now live in `@treasuryos/types`
- the advisory contract is structured and auditable instead of freeform only

## Safety model

The shipped AI slice is intentionally constrained:

- feature-flagged with `AI_ADVISORY_ENABLED`
- advisory-only
- no approval authority
- no Solana signer access
- no bypass of deterministic rule evaluation
- graceful degradation when disabled

## Runtime variables

```env
AI_ADVISORY_ENABLED=false
AI_ADVISORY_MODEL=deterministic-case-advisor-v1
```

## Validation

The following local validation completed successfully:

```bash
npm run db:migrate
npm run build -w @treasuryos/types
npm run typecheck
npm run build -w @treasuryos/api-gateway
API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard
node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/api-gateway-auth.test.ts
```

## Next recommended steps

1. execute `docs/plans/REAL_LLM_INTEGRATION_PLAN.md` for the first real-provider
   rollout rather than bypassing the current advisory foundation
2. use `docs/guides/AI_ADVISORY_02_REAL_LLM_PROVIDER_SETUP.md` for the manual
   provider and security setup work
3. add operator feedback capture for advisory quality review
4. expand read-only advisories to wallet reviews or report narratives only after
   the current transaction-case slice is stable
5. keep the external protocol audit as a separate required assurance track
