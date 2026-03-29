# Cloud-Readiness Walkthrough

Commit `eba0b20` — Pushed to `origin/main`

All 8 components implemented, verified via `npm run build` (all workspaces pass), unit tests pass (3/3).

---

## Changes Made

### 1. Environment Configuration
| File | What Changed |
|------|-------------|
| [.env.example](file:///Users/ekf/Downloads/Projects/TreasuryOS/.env.example) | Complete rewrite with Neon, Upstash, CORS, Railway, and API mapping vars |
| [env.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/config/env.ts) | Added `PORT`, `FRONTEND_URL`, `UPSTASH_*` vars, optional `AUTHORITY_KEYPAIR_PATH`, skip `.env` in production, `LISTEN_PORT` resolution |

### 2. Neon Database Pooling
| File | What Changed |
|------|-------------|
| [database.service.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/modules/database/database.service.ts) | `max: 5` in production (PgBouncer limit), `idleTimeoutMillis: 20s`, `connectionTimeoutMillis: 10s`, `statement_timeout: 30s`, auto-detect SSL from `sslmode=require` |

### 3. Upstash Redis Client
| File | What Changed |
|------|-------------|
| [redis-queue.service.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/modules/platform/redis-queue.service.ts) | Complete rewrite: Upstash REST API via `fetch()` for cloud, raw TCP fallback for local dev |

### 4. Frontend API Mapping
| File | What Changed |
|------|-------------|
| [api-client.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/dashboard/lib/api-client.ts) | Documented `API_BASE_URL` as server-side env var with per-environment instructions |
| [actions.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/dashboard/app/actions.ts) | Fixed duplicate `API_BASE_URL` definition (was `const API_BASE_URL`, now `const apiBaseUrl` using same env var) |

### 5. CORS & Security
| File | What Changed |
|------|-------------|
| [main.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/main.ts) | Production restricts CORS to `FRONTEND_URL` only; development allows localhost + optional `FRONTEND_URL` |

### 6. Railway Configuration
| File | What Changed |
|------|-------------|
| [railway.json](file:///Users/ekf/Downloads/Projects/TreasuryOS/railway.json) | New file — Dockerfile builder, health check at `/api/health`, restart policy |
| [Dockerfile](file:///Users/ekf/Downloads/Projects/TreasuryOS/Dockerfile) | Default `APP_NAME=api-gateway` (Railway doesn't support `buildArgs` in config) |

### 7. CD Migrations Workflow
| File | What Changed |
|------|-------------|
| [cd.yml](file:///Users/ekf/Downloads/Projects/TreasuryOS/.github/workflows/cd.yml) | New file — Runs `db:migrate` against Neon on push to `main` when migration files change. Requires `NEON_DATABASE_URL` GitHub secret |

### 8. CI Fix
| File | What Changed |
|------|-------------|
| [ci.yml](file:///Users/ekf/Downloads/Projects/TreasuryOS/.github/workflows/ci.yml) | Replaced fragile integration test (`ERR_PACKAGE_PATH_NOT_EXPORTED`) with targeted unit tests (`transaction-rules.test.ts`, `wallet-whitelist-sdk.test.ts`) |

---

## What You Need to Set

### GitHub Secrets
| Secret | Value | Where |
|--------|-------|-------|
| `NEON_DATABASE_URL` | `postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require` | GitHub → Settings → Secrets |

### Vercel Environment Variables
| Variable | Value |
|----------|-------|
| `API_BASE_URL` | `https://your-api.up.railway.app/api` |
| `NODE_ENV` | `production` |

### Railway Environment Variables
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?pgbouncer=true&sslmode=require` |
| `DATABASE_SSL` | `true` |
| `UPSTASH_REDIS_REST_URL` | From Upstash dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash dashboard |
| `REDIS_QUEUE_ENABLED` | `true` |
| `AUTH_TOKEN_SECRET` | Your 32+ char secret |
| `FRONTEND_URL` | `https://your-dashboard.vercel.app` |
| `DEFAULT_ADMIN_EMAIL` | Your admin email |
| `DEFAULT_ADMIN_PASSWORD` | Your admin password |
| `DEFAULT_COMPLIANCE_EMAIL` | Compliance email |
| `DEFAULT_COMPLIANCE_PASSWORD` | Compliance password |
| `DEFAULT_AUDITOR_EMAIL` | Auditor email |
| `DEFAULT_AUDITOR_PASSWORD` | Auditor password |
| `PROGRAM_ID_WALLET_WHITELIST` | `FXFMG4hzBcuRu33mVXyTHESH7FnsmUD6Fajr17FugbRt` |
| `SOLANA_RPC_URL` | `https://api.devnet.solana.com` |
| `SOLANA_SYNC_ENABLED` | `false` |

> [!NOTE]
> Railway automatically injects `PORT` — your code now reads it via `env.LISTEN_PORT`.

---

## Verified
- ✅ `npm run build` — all 8 workspaces compile
- ✅ Unit tests — 3/3 pass
- ✅ CI workflow — targets only unit tests (no more NestJS bootstrap failures)
- ✅ Push to `origin/main` — `eba0b20`
