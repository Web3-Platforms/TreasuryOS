# TreasuryOS

**TreasuryOS** is a Solana-native institutional treasury and compliance
platform built for strict regulatory requirements such as EU MiCA. It combines
identity verification, role-based controls, governance workflows, and Solana
permissioning for institutional operators.

## Quick start

Ensure you have copied `.env.example` to `.env` and populated your variables.

```bash
npm ci
npm run db:migrate
npm run dev:api
npm run dev:dashboard
```

## Documentation

- **Start here:** [docs/README.md](docs/README.md)
- **Current status:** [docs/reports/PROJECT_STATUS_REPORT.md](docs/reports/PROJECT_STATUS_REPORT.md)
- **Operations source of truth:** [docs/operations/README.md](docs/operations/README.md)
- **Operator guides:** [docs/guides/README.md](docs/guides/README.md)
- **Environment configuration:** [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)

## Current highlights

- Production AI advisories now support deterministic, OpenAI-compatible, and
  OpenRouter providers.
- OpenRouter is the current live provider path for transaction-case advisories.
- The dashboard AI panel now generates and regenerates analysis on explicit
  user action instead of auto-running on page load.

## Tech stack

- **Frontend:** Next.js 16 App Router (`apps/dashboard`)
- **Backend:** NestJS 11 (`apps/api-gateway`)
- **Shared packages:** `packages/types`, `packages/compliance-rules`,
  `packages/sdk`
- **Data and infra:** Neon Postgres, Upstash Redis, Supabase Storage, Railway,
  Vercel
- **Blockchain:** Solana, Anchor, Squads V4

## License

Proprietary and confidential. All rights reserved.
