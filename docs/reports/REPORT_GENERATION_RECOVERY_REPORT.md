# Report Generation Recovery Report

## Summary

This fix addressed a live report-generation mismatch that was still blocking operators in the dashboard demo flow.

Two problems were corrected together:

- the dashboard demo path uses the auditor account, but `POST /api/reports` still blocked auditors
- the API gateway's report artifact directory resolution relied on a source-path assumption that changed once the compiled app ran from `dist/`

## Root causes

### 1. Demo access used an auditor account that could not generate reports

The live demo flow is intentionally wired to the auditor seed user.

That was already documented in prior demo-access reports, but the reports API still only allowed:

- `admin`
- `compliance_officer`

The result was a confusing product experience:

- the auditor could open `/reports`
- the page showed the **Generate New Report** action
- the backend rejected the action with RBAC

So the UI looked broken even though the real issue was a permission mismatch between the live demo identity and the API role guard.

### 2. Production report artifact paths were not resolved from a stable repo root

`apps/api-gateway/src/config/env.ts` previously derived the repo root from `__dirname` using a fixed relative path.

That works when running from source, but once the compiled API runs from:

- `apps/api-gateway/dist/apps/api-gateway/src/...`

the same relative walk resolves to the `dist/` directory instead of the repository root.

Report generation writes artifacts through `PILOT_REPORTS_DIR`, so this pathing assumption made the production runtime less predictable than intended.

## What changed

- Allowed the `auditor` role to call `POST /api/reports`
- Kept report generation read-only in spirit: auditors can generate/export reports, but they still cannot approve entities, wallets, or transaction cases
- Reworked API repo-root discovery so report paths resolve by searching upward for the actual monorepo root instead of assuming the source-tree layout
- Replaced the dashboard's imperative client-triggered report action with a standard form-bound server action path
- Defaulted the report month input to the current month so the generate button is immediately usable on first load
- Updated workflow-role documentation to reflect that auditors can now generate/export monthly reports
- Added regression coverage for:
  - auditor-driven report generation
  - repo-root resolution from compiled `dist` paths

## Operator impact

The live demo and auditor workflow now behaves consistently:

1. Sign in through the current public demo path
2. Open `/reports`
3. Select a month
4. Click **Generate New Report**
5. The report should generate successfully and appear in the table

## Validation

Validated with:

- `npm run typecheck`
- `npm run build -w @treasuryos/api-gateway`
- `API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard`
- `node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/solana-network-config.test.ts tests/report-downloads.test.ts tests/api-gateway-auth.test.ts`
