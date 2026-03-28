# TreasuryOS Backend - Postgres Migration Walkthrough

This walkthrough details the steps completed to transition the TreasuryOS `api-gateway` from its legacy in-memory `PilotStoreService` to a production-ready repository pattern backed by Postgres. 

## Accomplishments

### 1. Refactored Remaining Repositories
- **Reports Module:** We restructured the `ReportsService` to utilize `DatabaseService` directly.
- Developed specific Postgres queries in `ReportsService.buildMonthlyReport` to aggregate logic based on the `entities`, `wallets`, and `transaction_cases` tables dynamically without requiring entire memory snapshots.
- Relocated and integrated the `ReportsRepository` for managing `report_jobs` (e.g. state management for queued and generated CSV exports).
- Updated artifact writing to use the newly implemented configuration key `PILOT_REPORTS_DIR`.

### 2. General Cleanup
- **Deleted PilotStore:** Once all modules (`Entities`, `Wallets`, `TransactionCases`, `Auth`, `Reports`) were migrated to the Database Service, the entire `modules/pilot-store` directory was removed.
- **Removed Dependency:** We fully removed `PilotStoreModule` from `AppModule` and related imports across the application.
- **Refactored Auth Guard:** Adjusted `auth.guard.ts` to rely directly on `UsersRepository` and `SessionsRepository` verifying bearers token against PostgreSQL tables.
- **Environment Maintenance:** Expunged `PILOT_DATA_FILE` logic from `config/env.ts`, confirming that there's no more legacy JSON snapshot handling within the active app configuration.

### 3. Verification
> [!IMPORTANT]
> A full `npm run typecheck` and `npm run build` were successfully executed within `apps/api-gateway`. The project compiles cleanly showing no remaining references to the deleted in-memory legacy classes.

All transactional updates apply ACID guarantees leveraging `database.withTransaction(...)` ensuring that cross-table state shifts (like finalizing a transaction and updating wallet rules) either succeed completely or revert reliably on failure.

At this point, the system operates purely as a Postgres-backed service and reaches its next milestone as an operationally credible pilot backend.
