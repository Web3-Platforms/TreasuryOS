# Seed User Bootstrap Hardening Report

## Summary

This report documents a Phase 1 production-hardening slice for TreasuryOS.

The API gateway still supported implicit default-user seeding from runtime environment variables on first login. That behavior is convenient for pilot bootstrap, but it is too implicit for harder production environments where operators should control exactly when the admin, compliance, and auditor seed accounts are created or rotated.

## Problem

Before this change, the default TreasuryOS users were refreshed through normal runtime behavior:

- the API read `DEFAULT_*` credentials from the environment
- `AuthService.login()` called `DatabaseService.ensureSeedUsers()`
- the first login on a fresh process could rewrite the stored hashes for the three default accounts

That was acceptable for pilot convenience, but it left a production-hardening gap:

- login traffic could mutate default-user state implicitly
- there was no explicit operator bootstrap command for hardened environments
- the roadmap and security guide already called out the need to disable or replace auto-seeding for stricter launches

## What changed

- Added `SEED_DEFAULT_USERS` to the API gateway environment schema with a default of `true`
- Kept current pilot behavior intact when `SEED_DEFAULT_USERS=true`
- Updated `DatabaseService.ensureSeedUsers()` so it cleanly no-ops, with a clear warning, when `SEED_DEFAULT_USERS=false`
- Added `DatabaseService.seedDefaultUsers()` as the explicit one-time bootstrap path
- Added `scripts/seed-default-users.ts` so operators can intentionally seed or rotate the default users without relying on a login-triggered side effect
- Added the root command:
  - `npm run seed:users`
- Extended API integration coverage to prove:
  - login does **not** auto-create default users when auto-seeding is disabled
  - the explicit seed command restores the expected login path afterward
- Made the relevant test helpers set `SEED_DEFAULT_USERS=true` explicitly so the suite stays deterministic even if a developer shell exports the hardened setting
- Updated `.env.example`, `docs/ENVIRONMENT_VARIABLES.md`, `SECURITY.md`, and `ROADMAP.md` to describe the new hardened bootstrap flow

## Operator impact

This change introduces a safer production option without changing the current pilot rollout by default.

1. Pilot / convenience mode:
   - leave `SEED_DEFAULT_USERS=true`
   - the current first-login bootstrap behavior remains available
2. Hardened mode:
   - set `SEED_DEFAULT_USERS=false`
   - update the `DEFAULT_*` credentials intentionally
   - run `npm run seed:users`
   - verify live login with the rotated credential set

That means default-user creation and rotation can now be treated as an explicit operational step instead of an implicit request-time side effect.

## Current limitation

This hardening slice does not remove the seed-user pattern entirely.

TreasuryOS still uses runtime `DEFAULT_*` credentials for the admin, compliance, and auditor accounts. The improvement here is operational control: stricter environments can disable implicit seeding and use an intentional bootstrap step instead.

## Validation

Validated with:

- `npm run lint`
- `npm run typecheck`
- `npm run build -w @treasuryos/api-gateway`
- `node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/api-gateway-auth.test.ts tests/api-gateway-health.test.ts tests/solana-network-config.test.ts tests/squads-service.test.ts tests/wallet-sync-readiness.test.ts`
