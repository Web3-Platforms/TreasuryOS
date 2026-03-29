# Audit and Hardening Plan: TreasuryOS Production Readiness

This plan outlines the final steps to ensure TreasuryOS is hardened, stable, and ready for real-world institutional use.

## User Review Required

> [!IMPORTANT]
> **Production Secrets & KMS**: This update focuses on platform stability and security features. However, for a real deployment handling funds, **Solana Keypair Management must transition to a hardware-backed KMS (AWS KMS / Vault)**. This plan hardens the *application* layer but cannot replace infrastructure-level HSMs.

> [!WARNING]
> **CORS Configuration**: We will transition from wildcard origins to a whitelist. Please confirm the production URL (e.g., `https://dashboard.treasuryos.com`) before final deployment.

## Proposed Changes

### 1. Security Hardening (API Gateway)

#### [MODIFY] [main.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/main.ts)
- Add `helmet()` middleware for secure HTTP headers.
- Add `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` to prevent mass-assignment attacks and ensure data integrity.
- Configure `enableCors` with a restricted whitelist instead of `true`.
- Enable `app.enableShutdownHooks()` for graceful process termination.

#### [MODIFY] [app.module.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/app.module.ts)
- Integrate `ThrottlerModule` (Rate Limiting) to protect sensitive endpoints (Auth, Reports).

### 2. Operational Reliability

#### [MODIFY] [health.controller.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/modules/health/health.controller.ts)
- Upgrade the health check to perform a "deep check":
  - `DatabaseService.pool.query('SELECT 1')`
  - Optional: `Connection.getSlot()` (Solana RPC check).
- Return `503 Service Unavailable` if critical dependencies are down.

### 3. Database Optimization

#### [NEW] [006_performance_indexes.sql](file:///Users/ekf/Downloads/Projects/TreasuryOS/infra/db/migrations/006_performance_indexes.sql)
- Add indexes for high-frequency search/filter fields:
  - `wallets(entity_id)`
  - `transaction_cases(entity_id)`
  - `audit_events(resource_id)`
  - `audit_events(actor_id)`
  - `auth_sessions(user_id)`

### 4. Data Integrity & Validation

#### [MODIFY] [entities.dto.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/modules/entities/dto/create-entity.dto.ts) (and others)
- Enhance DTOs with `class-validator` decorators to ensure incoming data strictly follows the schema.

---

## Verification Plan

### Automated Tests
1. **Security Audit Check**: `npm run test` (verify auth logic still holds).
2. **Schema Validation**: Run `npm run db:migrate` and verify indexes exist.
3. **Health Check**: `curl http://localhost:PORT/api/health` and verify it fails if DB is stopped.

### Manual Verification
1. **Rate Limit Test**: Use `ab` or `wrk` to hit the login endpoint and verify 429 responses after threshold.
2. **Security Headers**: Inspect `curl -I` output for Presence of `X-Frame-Options`, `Content-Security-Policy`, etc.
