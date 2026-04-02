# Solana Testnet Runtime Setup Report

Task:
- `configure-testnet-signer-env`
- `align-jira-import`
- `clean-docs-report-archive`

## Summary

This step implemented the repository-side assets needed to move TreasuryOS toward real Solana testnet execution without committing secrets or prematurely enabling live sync.

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
- `configure-testnet-signer-env` now active as the next rollout step

## Step-by-step operator sequence

1. Generate the signer payload locally:
   - `npm run solana:keypair:export -- ~/.config/solana/id.json`
2. Copy the output into Railway as `AUTHORITY_KEYPAIR_JSON`.
3. Apply the values from `infra/railway/api-gateway.testnet.env.example`.
4. Keep `SOLANA_SYNC_ENABLED=false`.
5. Redeploy the API service.
6. Verify:
   - `/api/health`
   - `/api/health/live`
   - `/api/health/ready`
7. Only after the wallet whitelist program is deployed on testnet and readiness is green should a live canary be attempted.

## Remaining external/manual requirement

The repository is now prepared for the runtime configuration step, but the actual Railway cutover still requires:

- generating the `AUTHORITY_KEYPAIR_JSON` payload from the dedicated testnet authority keypair
- manual entry of the signer secret and remaining runtime values into Railway
- redeploying the API service and verifying readiness

## Status

- Repository-side runtime setup assets: completed
- Wallet whitelist program deployment on testnet: completed
- Live Railway variable cutover: next active step
