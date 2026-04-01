# Production Environment Verification Audit

## Summary

I verified the currently visible production configuration surfaces that matter
for the pilot launch path:

- GitHub Actions deployment secrets
- Railway API Gateway variable names
- Vercel dashboard project environment-variable names

This check intentionally recorded **names and presence only**. It did not print
or persist secret values.

## GitHub Actions

Repository Actions secrets are now present and the main deploy workflow is
working again.

Verified result:

- `RAILWAY_TOKEN` exists and now works with the corrected project-token deploy flow
- `NEON_DATABASE_URL` exists
- GitHub Actions run `#87` (`23871526778`) completed successfully

## Railway API Gateway

The live Railway API service is:

- service name: `@treasuryos/api-gateway`
- service ID: `3337810b-af7f-4377-912c-5ae9a2557284`

The following API Gateway variable names are currently present in Railway
production:

- `AUTH_TOKEN_SECRET`
- `AUTH_TOKEN_TTL_MINUTES`
- `DATABASE_SSL`
- `DATABASE_URL`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_AUDITOR_EMAIL`
- `DEFAULT_AUDITOR_PASSWORD`
- `DEFAULT_COMPLIANCE_EMAIL`
- `DEFAULT_COMPLIANCE_PASSWORD`
- `FRONTEND_URL`
- `KYC_SUMSUB_ENABLED`
- `NODE_ENV`
- `PROGRAM_ID_WALLET_WHITELIST`
- `REDIS_URL`
- `SOLANA_NETWORK`
- `SOLANA_RPC_URL`
- `SQUADS_MULTISIG_ENABLED`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_URL`

Railway also exposes the expected platform-provided variables such as
`RAILWAY_ENVIRONMENT`, `RAILWAY_PUBLIC_DOMAIN`, `RAILWAY_SERVICE_ID`, and
related internal service URLs.

### Interpretation

This is a good match for the API gateway's launch-critical configuration:

- auth secret is present
- database and Redis variables are present
- pilot seed-user credentials are present
- frontend origin is present
- Solana RPC and wallet whitelist program ID are present
- Supabase storage variables are present

The current variable-name inventory also matches the intended pilot scope:

- `KYC_SUMSUB_ENABLED` is present as the KYC launch toggle
- no Sumsub secret names were surfaced in this audit output
- no Sentry DSN name was surfaced
- no `SOLANA_SYNC_ENABLED` name was surfaced, so the code will continue using its safe default (`false`) unless that variable is added later

## Vercel Dashboard

There are two different Vercel project links in this repository:

- repo root `.vercel/project.json` → project `treasury-os`
- `apps/dashboard/.vercel/project.json` → project `dashboard`

The important production project is the **root-linked** Vercel project
`treasury-os`. That project currently reports these environment-variable names:

- `API_BASE_URL`
- `DEMO_ACCESS_EMAIL`
- `DEMO_ACCESS_ENABLED`
- `DEMO_ACCESS_PASSWORD`
- `KYC_SUMSUB_ENABLED`
- `NEXT_PUBLIC_API_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_URL`

The separate `apps/dashboard` link points to a different Vercel project named
`dashboard`, and that project currently reports no environment variables. That
subproject should not be used as the source of truth for production dashboard
configuration checks.

### Interpretation

The root-linked live dashboard project has the expected pilot-launch variable
names:

- `API_BASE_URL` is present
- demo-access variables are present
- KYC toggle is present
- Supabase variables are present

## Remaining Gaps

This audit reduces configuration uncertainty, but it does not fully close the
launch checklist.

The remaining externally visible blocker is now:

- Cloudflare/TLS routing for `api.treasuryos.aicustombot.net`

## Recommendation

Treat GitHub CD and baseline production variable presence as **verified** for the
pilot path.

For the next launch step, focus on:

1. fixing the API custom-domain route in Cloudflare
2. re-running the final live smoke pass after that route is fixed
