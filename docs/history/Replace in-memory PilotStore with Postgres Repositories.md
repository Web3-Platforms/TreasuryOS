# Replace in-memory PilotStore with Postgres Repositories

This plan replaces the in-memory `mutate()` whole-store pattern with production-ready repository-level adapters and targeted SQL queries.

## User Review Required

> [!IMPORTANT]
> The `PilotStoreModule` completely disappears and is replaced by a formal `DatabaseModule` doing true SQL. I will migrate the seed logic into `DatabaseService.onModuleInit`. The `mutate()` method will be replaced by direct SQL execution inside repositories. Domain-specific repositories will be created per module.
> Please review the architecture decision before I start modifying the services.

## Proposed Changes

---

### Database Module

Introduce a shared `DatabaseModule` to govern connections and transactions.

#### [NEW] `apps/api-gateway/src/modules/database/database.module.ts`
#### [NEW] `apps/api-gateway/src/modules/database/database.service.ts`
- Implements `pg.Pool` connection handling
- Wraps `query()` and `withTransaction((client) => Promise<T>)`
- Handles initial user seeding, like `pilot-store.service.ts` did

---

### Auth Module

Replace `pilotStore` with user and session repositories.

#### [NEW] `apps/api-gateway/src/modules/auth/users.repository.ts`
- Finds by ID or email
- targeted SQL queries

#### [NEW] `apps/api-gateway/src/modules/auth/sessions.repository.ts`
- `saveSession` (insert or update), `findSessionById` and `listUserSessions` using SQL

#### [MODIFY] `apps/api-gateway/src/modules/auth/auth.service.ts`
- Inject new repos instead of `PilotStoreService`
- Use targeted inserts and updates for tokens

---

### Audit Module

Drop `PilotStore` dependence for the Audit log.

#### [NEW] `apps/api-gateway/src/modules/audit/audit.repository.ts`
- `insertEvent`, `listRecent` using targeted SQL

#### [MODIFY] `apps/api-gateway/src/modules/audit/audit.service.ts`
- Use the repository instead of `pilotStore.appendAuditEvent`

---

### Entities and KYC

Break down the largest file into targeted repos.

#### [NEW] `apps/api-gateway/src/modules/entities/entities.repository.ts`
- `insert`, `update`, `findById`, and `list` queries.

#### [NEW] `apps/api-gateway/src/modules/kyc/kyc-webhooks.repository.ts`
- Replaces `pilotStore.kycWebhooks` operations. 

#### [MODIFY] `apps/api-gateway/src/modules/entities/entities.service.ts`
- Will use `DatabaseService.withTransaction` for combined updates around entity status and KYC webhook parsing, moving off `pilotStore.mutate()`.

---

### Wallets Module

#### [NEW] `apps/api-gateway/src/modules/wallets/wallets.repository.ts`
- `insert`, `update`, `findById`, `findByEntityId` using targeted SQL

#### [MODIFY] `apps/api-gateway/src/modules/wallets/wallets.service.ts`
- Replaces `pilotStore.mutate()` with targeted updates and reads.

---

### Transaction Cases Module

#### [NEW] `apps/api-gateway/src/modules/transaction-cases/transaction-cases.repository.ts`
- `insert`, `update`, `findById`, `findByTransactionReference` and `list` cases using targeted SQL.

#### [MODIFY] `apps/api-gateway/src/modules/transaction-cases/transaction-cases.service.ts`
- Drops `pilotStore.mutate()` in favor of direct updates. 

---

### Reports Module

#### [NEW] `apps/api-gateway/src/modules/reports/reports.repository.ts`
- Targeted `insert` and `update` for report definitions.
- Special complex cross-table `SELECT` queries for building the monthly MiCA reports efficiently (replacing `store.entities.filter` loop).

#### [MODIFY] `apps/api-gateway/src/modules/reports/reports.service.ts`
- Run SQL analytics logic inside the repository and format the CSV output. Ensures we don't fetch all tables into memory.

---

### Cleanup

#### [DELETE] `apps/api-gateway/src/modules/pilot-store/pilot-store.module.ts`
#### [DELETE] `apps/api-gateway/src/modules/pilot-store/pilot-store.service.ts`

## Open Questions

None at this time. All existing logic will map directly to standard SELECT/INSERT/UPDATE SQL using `pg` mapped back into TypeScript types.

## Verification Plan

### Automated Tests
- Running the `api-gateway` standard build and type-checking via terminal to ensure all types mapped successfully.
- Will verify via standard lint and `tsc` that the `pilotStore.mutate()` pattern has been fully eradicated.

### Manual Verification
- Will ask you to restart or test against staging/devnet when the changes are completed.
