# Solana Testnet Runtime Setup Report

Task:
- `configure-testnet-signer-env`
- `align-jira-import`
- `clean-docs-report-archive`

## Summary

This step implemented the repository-side assets and verified the live Railway runtime needed to move TreasuryOS toward real Solana testnet execution without committing secrets or prematurely enabling live sync.

The shared wallet-whitelist program is now successfully deployed on testnet at:

- `3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c`

## What changed

### 1. Reusable signer export helper

Added:

- `scripts/solana-keypair-to-env.ts`

Use it with:

```bash
npm run solana:keypair:export -- ~/.config/solana/id.json
```

This converts a local Solana CLI keypair file into the one-line `AUTHORITY_KEYPAIR_JSON` format expected by Railway.

### 2. Safe Railway testnet env template

Added:

- `infra/railway/api-gateway.testnet.env.example`

This file documents the exact API-service variables needed for the first beta testnet cut:

- `SOLANA_RPC_URL=https://api.testnet.solana.com`
- `SOLANA_NETWORK=testnet`
- `PROGRAM_ID_WALLET_WHITELIST=3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c`
- `SOLANA_SIGNING_MODE=environment`
- `AUTHORITY_KEYPAIR_JSON=<single-line signer json>`
- `SOLANA_SYNC_ENABLED=false`
- `SQUADS_MULTISIG_ENABLED=false`
- `PILOT_ALLOW_MANUAL_KYC_BYPASS=false`

### 3. Runtime verification path

The API gateway now supports:

- `GET /api/health`
- `GET /api/health/live`
- `GET /api/health/ready`

`/api/health/ready` is the operational gate for the Solana beta path because it now includes wallet-sync readiness.

### 4. Documentation updates

Updated:

- `.env.example`
- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/ENV_VAR_QUICK_REFERENCE.md`
- `docs/PRODUCTION_DEPLOYMENT.md`
- `docs/plans/SOLANA_TESTNET_ENABLEMENT_PLAN.md`

These docs now describe the new helper script, the Railway env template, and the readiness-check sequence.

### 5. Jira alignment

The Jira workbook and import artifacts were updated to reflect:

- `harden-solana-sync-guards` implemented
- `configure-testnet-signer-env` completed
- `run-testnet-wallet-canary` now active as the next rollout step

### 6. Startup blocker diagnosed and fixed

During live rollout verification, GitHub Actions reported a successful Railway deploy while the public API still served the old route surface and returned `404` for `/api/health/ready`.

The root cause was that Railway deploys run with `railway up --detach`, so the GitHub job can succeed before the new container actually finishes booting. The new API process was crashing on startup because `SquadsService` imported `@sqds/multisig` eagerly, and that package's published ESM entrypoint is not Node 22-safe.

The fix was to lazy-load the Squads SDK only when multisig is actually enabled. This preserves the current rollout shape, where:

- `SQUADS_MULTISIG_ENABLED=false`
- `SOLANA_SYNC_ENABLED=false`

Local validation now confirms `npm run start:prod --workspace=@treasuryos/api-gateway` serves `GET /api/health/ready` successfully in production mode.

### 7. Live runtime verified

After pushing the startup fix, the live API now returns `200` from `GET /api/health/ready` on both:

- `https://api.treasuryos.aicustombot.net/api/health/ready`
- `https://treasuryosapi-gateway-production.up.railway.app/api/health/ready`

The readiness payload confirms the intended preview-safe runtime:

- `SOLANA_NETWORK=testnet`
- `SOLANA_RPC_URL=https://api.testnet.solana.com`
- `SOLANA_SIGNING_MODE=environment`
- `SOLANA_SYNC_ENABLED=false`
- `walletSync.ready=true`

### 8. Dashboard canary path completed

During canary preparation, the API was ready for entity approval but the dashboard did not expose the existing `POST /api/entities/:entityId/approve` path.

The dashboard now includes:

- entity approval and rejection actions for `under_review` entities
- a clearer wallet detail label (`Solana Whitelist Sync`) so the UI no longer references the old devnet wording

This closes the operator gap between KYC review completion and the first wallet whitelist canary.

### 9. Pilot-only manual KYC bypass

To unblock the first Solana canary before live Sumsub launch, the repository now supports a temporary internal-only flag:

- `PILOT_ALLOW_MANUAL_KYC_BYPASS`

When this flag is set to `true` while `KYC_SUMSUB_ENABLED=false`:

- the API can approve an entity without a live Sumsub applicant
- the dashboard entity detail page shows an explicit pilot approval path
- the approval audit event is marked with `manualKycBypass=true`

This flag must be mirrored across both surfaces:

- Railway API variables
- Vercel dashboard env vars

## Step-by-step operator sequence

1. Generate the signer payload locally:
   - `npm run solana:keypair:export -- ~/.config/solana/id.json`
2. Copy the output into Railway as `AUTHORITY_KEYPAIR_JSON`.
3. Apply the values from `infra/railway/api-gateway.testnet.env.example`.
4. Keep `SOLANA_SYNC_ENABLED=false`.
5. If the first canary needs to run before live Sumsub launch, temporarily set `PILOT_ALLOW_MANUAL_KYC_BYPASS=true` in both Railway and Vercel.
6. Redeploy the API service and the dashboard.
7. Verify:
   - `/api/health`
   - `/api/health/live`
   - `/api/health/ready`
8. If GitHub Actions shows the Railway deploy step as successful but `/api/health/ready` still does not change, inspect the latest Railway deployment log because detached deploy submission does not guarantee the new container booted successfully.
9. Only after the wallet whitelist program is deployed on testnet and readiness is green should a live canary be attempted.

## Remaining external/manual requirement

The runtime cutover is now complete. The next external/manual action is the first controlled canary, which requires:

- switching `SOLANA_SYNC_ENABLED` from `false` to `true` for a controlled redeploy
- approving exactly one prepared wallet request through the normal product flow or the temporary pilot bypass flow
- verifying the resulting Solana signature, database sync fields, and explorer record before any wider rollout

## Status

- Repository-side runtime setup assets: completed
- Wallet whitelist program deployment on testnet: completed
- Live Railway variable cutover: completed and verified
- Repository-side startup blocker for the next Railway deploy: resolved
- Next active rollout step: first wallet-approval canary
