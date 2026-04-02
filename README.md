# TreasuryOS

**TreasuryOS** is a Solana-native institutional treasury and compliance platform designed for strict regulatory requirements (such as EU MiCA compliance). It provides robust identity verification, multi-signature governance, and fully authenticated, role-based workflows for institutional onboarding.

---

## 🚀 Quick Start

Ensure you have copied `.env.example` to `.env` and populated your variables.

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start the API Gateway and Dashboard locally
npm run dev:api
npm run dev:dashboard
```

## 📖 Documentation Directory

The documentation has been fully structured to help you navigate the system's architecture, deployments, and components. Here is an overview:

*   **[Comprehensive Report (`docs/reports/COMPREHENSIVE_REPORT.md`)](docs/reports/COMPREHENSIVE_REPORT.md)** - *START HERE!* An extensive overview of the entire stack, workflows, environments, and functional capabilities delivered during the MVP run.
*   **[Reports Archive (`docs/reports/`)](docs/reports/)** - Implementation reports, launch reports, validation records, and rollout notes.
*   **[Architecture (`docs/architecture/`)](docs/architecture/)** - Diagrams, application structures, risk assessments, and technical workflows. 
*   **[Deployment Guidelines (`docs/deployment/`)](docs/deployment/)** - Operational guides, setup notes, and security hardening tips for Cloudflare, Neon Postgres, Railway, and Upstash.
*   **[History & Archival Plans (`docs/history/`)](docs/history/)** - Former MVP execution plans, walkthroughs, task checklists, and historical implementation logs.

## 🛠 Tech Stack Overview
- **Next.js**: Frontend Client (`apps/dashboard`)
- **NestJS**: API Gateway Gateway (`apps/api-gateway`)
- **Supabase**: Authentication & Storage
- **Neon Serverless**: Primary PostgreSQL Database
- **Upstash Serverless**: Redis Cache & BullMQ Queue Backing
- **SumSub**: KYC automation and secure compliance webhooks
- **Solana Web3.js**: Direct on-chain whitelisting and squad integrations

## 🔐 Licensing
Proprietary & Confidential. All rights reserved.
