# Report Download Format Fix Report

Task:
- Fix the Reports screen so CSV downloads stop returning JSON and add real Excel downloads without risking the live API.

User-visible symptom:
- Clicking `Download CSV` on the live Reports page returned a JSON error payload instead of a `.csv` file.
- There was no Excel download option for generated reports.

What investigation confirmed:
- The API itself was healthy:
  - direct authenticated `GET /api/reports/:id/download` from Railway returned a real CSV body.
- The dashboard-side path was the failure point.
- The first dashboard fix added:
  - awaited Next.js 16 route params handling,
  - CSV-to-XLSX conversion with `exceljs`,
  - tests for filename, CSV parsing, and workbook generation.
- Production verification then exposed the deeper live-routing issue:
  - on `https://treasuryos.aicustombot.net`, requests under `/api/*` are handled by the API gateway path surface,
  - so the dashboard route at `/api/download/:id` could not reliably own that path on the live custom domain,
  - the browser therefore received a JSON 404 from the API layer instead of the dashboard download proxy.

Fix applied:
- Added reusable dashboard download handling in `apps/dashboard/lib/report-download-route.ts`.
- Kept the existing `apps/dashboard/app/api/download/[id]/route.ts` wired to that shared handler for local/direct compatibility.
- Added a new live-safe dashboard route at `apps/dashboard/app/download/[id]/route.ts`.
- Updated the Reports page to use:
  - `/download/:id?format=csv`
  - `/download/:id?format=xlsx`
- Added `apps/dashboard/lib/report-downloads.ts` for:
  - format parsing,
  - filename derivation,
  - CSV parsing,
  - XLSX generation with `exceljs`.
- Added `tests/report-downloads.test.ts` to validate the pure helper behavior and generated workbook output.

Why this fixes the issue:
- The report-download proxy remains in the dashboard, so no API/Railway deployment was required.
- The working live path no longer sits under `/api/*`, which avoids the custom-domain routing collision.
- CSV downloads now pass through as real CSV responses.
- Excel downloads are generated from the same upstream CSV payload and returned as proper `.xlsx` content.

Validation:
- `npx --yes tsx --tsconfig tsconfig.test.json --test tests/report-downloads.test.ts`
- `API_BASE_URL=http://localhost:3001/api npm run typecheck -w @treasuryos/dashboard`
- `API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard`
- Deployed the dashboard fix to Vercel production and aliased it to `https://treasuryos.aicustombot.net`
- Verified live on the custom domain with an authenticated production report:
  - `GET /download/:id?format=csv` returns `200` with `text/csv`
  - `GET /download/:id?format=xlsx` returns `200` with Excel MIME type
  - `/reports` renders both `Download CSV` and `Download Excel`
  - the rendered reports page now links to the new `/download/:id` path

Status:
- Fixed in production
