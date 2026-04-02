# Sumsub Closure Report

Task:
- `launch-sumsub-path`

What was done:
- Confirmed the codebase and dashboard UX already enforce the no-KYC launch path with explicit "coming soon" behavior.
- Removed the inactive Sumsub production variables from Railway for `@treasuryos/api-gateway`:
  - `SUMSUB_APP_TOKEN`
  - `SUMSUB_SECRET_KEY`
  - `SUMSUB_WEBHOOK_SECRET`
  - `SUMSUB_LEVEL_NAME`
- Kept `KYC_SUMSUB_ENABLED=false` as the single explicit launch flag.

What was verified:
- Railway production no longer retains the inactive Sumsub secret/config variables.
- The only remaining Sumsub-related production variable is `KYC_SUMSUB_ENABLED`, which keeps the feature disabled for launch.
- The application code and dashboard copy already present the KYC flow as "coming soon" rather than live.

Why this matters:
- It removes ambiguity between the product decision and the live production configuration.
- It also avoids accidentally carrying sandbox KYC credentials into the first live launch path.

Current next ready tasks:
- `launch-solana-path`
- `launch-domains-dns-tls`
- `launch-observability-enable`
- `launch-deploy-and-migrate`

Status:
- Completed
