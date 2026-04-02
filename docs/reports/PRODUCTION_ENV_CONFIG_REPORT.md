# Production Environment Configuration Report

Task:
- `launch-production-env-config`

What was done:
- Audited required production environment variables from the codebase and deployment docs for the no-KYC first launch.
- Inspected the live production project wiring for Railway and Vercel using temporary local links so no repo metadata was added.
- Updated Railway production for `@treasuryos/api-gateway` to make the launch posture explicit:
  - `DATABASE_SSL=true`
  - `KYC_SUMSUB_ENABLED=false`
- Updated Vercel production for `treasury-os` to make the dashboard runtime explicit:
  - `API_BASE_URL` pinned to the custom API domain
  - `KYC_SUMSUB_ENABLED=false`

What was verified:
- Railway production now includes the expected core API env names for auth, database, Redis, frontend origin, Supabase server vars, Solana RPC/program, plus the newly explicit `DATABASE_SSL` and `KYC_SUMSUB_ENABLED`.
- Vercel production now includes `API_BASE_URL` and `KYC_SUMSUB_ENABLED` for the launch dashboard path.

Why this matters:
- The no-KYC first launch is now enforced consistently at both API and dashboard layers by environment configuration.
- The dashboard is explicitly pointed at the custom production API domain instead of relying on older or ambiguous environment state.
- Database TLS is now explicit for the live Neon path instead of relying on a local-default assumption.

Deferred by design:
- Solana signer and sync-specific production configuration remains part of `launch-solana-path`.
- Optional Sentry DSNs remain part of `launch-observability-enable`.
- Sumsub secrets cleanup and final "coming soon" operational closure remain part of `launch-sumsub-path`.

Current next ready tasks:
- `launch-sumsub-path`
- `launch-solana-path`
- `launch-domains-dns-tls`
- `launch-observability-enable`
- `launch-deploy-and-migrate`

Status:
- Completed
