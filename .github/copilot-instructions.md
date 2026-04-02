# TreasuryOS Copilot Instructions

## Build, test, and lint commands

- Install dependencies with `npm ci`.
- Typecheck every workspace with `npm run typecheck`.
- Build every workspace with `npm run build`.
- Build or typecheck one workspace with npm workspace flags, for example `npm run build -w @treasuryos/api-gateway` or `npm run typecheck -w @treasuryos/dashboard`.
- Run lint with `npm run lint`. The root script exists, but it only delegates to workspace `lint` scripts via `--if-present`; the current workspaces do not define their own `lint` scripts, so this is effectively a no-op today.
- Run the full test suite with `npm test`.
- Run a single test file with `node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/transaction-rules.test.ts`.
- The fast CI unit-test subset is `node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/transaction-rules.test.ts tests/wallet-whitelist-sdk.test.ts`.
- Run database migrations with `npm run db:migrate` and verify there are no pending migrations with `npm run db:migrate:check`.

Current baseline caveats:

- The full monorepo build is validated with `API_BASE_URL=http://localhost:3001/api npm run build`; the dashboard build requires `API_BASE_URL`, and Next.js 16 route protection now lives in `apps/dashboard/proxy.ts`.
- `npm test` includes an API integration test that expects the local database/runtime prerequisites to be available. The two CI unit tests above are the reliable quick smoke tests.

## High-level architecture

- This is an npm workspaces monorepo (`apps/*`, `packages/*`) targeting Node 22 and npm 10. The root `README.md` points people to `docs/reports/COMPREHENSIVE_REPORT.md`, `docs/architecture/`, and `docs/deployment/` for system-level context.
- `apps/dashboard` is a Next.js 16 App Router frontend. Most data access is server-side: pages call `fetchApi()` from `apps/dashboard/lib/api-client.ts`, and mutations live in `apps/dashboard/app/actions.ts` as server actions.
- `apps/api-gateway` is the main backend. It is a NestJS application composed of feature modules under `src/modules/` for auth, entities, KYC, wallets, transaction cases, reports, audit, storage, governance, security, platform, database, and health. `src/main.ts` applies helmet, the global validation pipe, CORS, and the `/api` prefix, while `src/app.module.ts` wires global throttling and structured request logging.
- Dashboard auth is a cookie-to-bearer flow. The login server action posts to the API gateway, stores the returned `treasuryos_access_token` cookie, `apps/dashboard/proxy.ts` protects non-public routes, and `apps/dashboard/lib/api-client.ts` forwards the cookie as `Authorization: Bearer ...`. The API gateway then resolves `request.currentUser` through the global JWT/Supabase strategy and role guards.
- `packages/types` is the canonical source of shared enums, interfaces, workflow states, and RBAC types. `packages/compliance-rules` contains pure business-rule helpers. `packages/sdk` wraps Solana client behavior such as wallet-whitelist instruction building and address validation.
- `programs/` contains the Anchor programs: `wallet-whitelist`, `compliance-registry`, and `tx-monitor`. The API gateway's wallet sync service bridges approved wallet requests into those on-chain programs, either by direct execution with the configured authority signer or through Squads multisig proposals depending on environment settings.
- Deployment is split by surface: `vercel.json` builds `@treasuryos/dashboard`, `railway.json` builds and runs `@treasuryos/api-gateway`, and SQL schema changes live in `infra/db/migrations` and are applied by `scripts/db-migrate.ts`.
- The repo also contains supporting Nest services outside the main request path: `apps/kyc-service` for Sumsub/Jumio and on-chain sync helpers, `apps/bank-adapter` for Amina and SWIFT/GPI integrations, and `apps/reporter` for MiCA-style reporting/scheduling.

## Key conventions

- TypeScript is ESM across the monorepo. Most TypeScript files import local modules with `.js` suffixes because the code compiles with `moduleResolution: NodeNext`; keep that style when editing existing files.
- Shared code is expected to flow through workspace packages. Reuse `@treasuryos/types`, `@treasuryos/compliance-rules`, and `@treasuryos/sdk` instead of re-declaring domain enums, workflow states, or Solana helpers inside apps. The dashboard also uses its own `@/*` alias from `apps/dashboard/tsconfig.json`.
- Tests live at the repo root in `tests/**/*.test.ts`, not beside the source files. They use Node's built-in `node:test` and `node:assert/strict` through `tsx`, not Jest or Vitest.
- For dashboard changes, prefer Server Components plus server actions over client-side data fetching. `fetchApi()` is the standard API wrapper; it requires `API_BASE_URL` and reads the `treasuryos_access_token` cookie from the server request.
- For API gateway changes, route protection is layered globally. Public endpoints use `@Public()`, RBAC uses `@Roles(...)`, and handlers that need the signed-in actor are expected to call `extractActor(request)` instead of reading request fields ad hoc.
- API gateway environment handling is centralized in `apps/api-gateway/src/config/env.ts` with Zod validation and derived values such as the resolved listen port and repo-root-relative report directory. New runtime settings should be added there rather than read directly from `process.env`.
- Database access uses plain `pg`, not an ORM. `DatabaseService` manages the pool, transactions, and lazy pilot-user seeding, and migrations are raw SQL files tracked in `schema_migrations`.
- Queue behavior is environment-sensitive. `RedisQueueService` prefers Upstash REST in cloud/serverless deployments and falls back to raw `redis://` or `rediss://` TCP/TLS locally.
- Wallet sync and governance code is intentionally gated by environment flags. `SOLANA_SYNC_ENABLED=false` skips on-chain writes, `SOLANA_SIGNING_MODE` switches between filesystem and environment-injected signers, and Squads multisig is optional. Preserve those defaults when changing wallet or governance flows.
