# TreasuryOS - Project Context

Institutional-grade digital asset treasury and compliance platform built for the Solana ecosystem, specifically designed to meet strict regulatory requirements (e.g., EU MiCA compliance).

## 🚀 Project Overview

TreasuryOS bridges traditional institutional controls with decentralized asset management. It features a modular, three-tier architecture providing identity verification, multi-signature governance (via Squads V4), and role-based workflows for institutional onboarding.

### Core Components
- **Dashboard (`apps/dashboard`):** Next.js administrative interface for Treasury Managers and Compliance Officers.
- **API Gateway (`apps/api-gateway`):** NestJS central entry point for all institutional commands, handling RBAC and session management.
- **KYC Service (`apps/kyc-service`):** Handles identity verification and on-chain compliance registry synchronization.
- **Bank Adapter (`apps/bank-adapter`):** Integrates with traditional banking rails (e.g., Amina Banking API, ISO20022).
- **Reporter (`apps/reporter`):** Generates regulatory reports (e.g., MiCA monthly reports).
- **Solana Programs (`programs/`):** Anchor-based smart contracts for Compliance Registry, Wallet Whitelisting, and Transaction Monitoring.
- **Shared Packages (`packages/`):** Common types, SDK, and compliance rules.

### Tech Stack
- **Frontend:** Next.js 16+, React 19+, Tailwind CSS (implied/standard for Next.js apps here).
- **Backend:** NestJS 11+, Express, Passport.js (JWT).
- **Database:** Neon Serverless (PostgreSQL).
- **Cache/Queue:** Upstash Serverless (Redis, BullMQ).
- **Blockchain:** Solana (Anchor 0.32.1), Web3.js, @sqds/multisig (Squads V4).
- **Identity/Compliance:** Supabase (Auth/Storage), SumSub (KYC).
- **Infrastructure:** Vercel (Frontend), Railway (Backend Services).

---

## 🛠 Building and Running

### Prerequisites
- Node.js >= 22.0.0
- npm >= 10.0.0
- Solana CLI & Anchor (for program development)

### Setup & Development
```bash
# Install dependencies
npm install

# Database Migrations
npm run db:migrate

# Start Services (Monorepo Workspaces)
npm run dev:api        # API Gateway (Port 3001)
npm run dev:dashboard  # Dashboard (Port 3000)
npm run dev:kyc        # KYC Service (Port 3002)
npm run dev:bank       # Bank Adapter (Port 3003)
npm run dev:reporter   # Reporter (Port 3004)
```

### Testing & Verification
```bash
# Run all tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## 📐 Architecture & Conventions

### Development Standards
- **TypeScript First:** Strict typing across the entire monorepo.
- **Service-Oriented:** Logic is partitioned into specialized microservices.
- **On-Chain Compliance:** Every treasury operation is screened against the on-chain `Compliance Registry` before execution.
- **Governance:** High-value transactions require $n$-of-$m$ on-chain multisig approval via Squads V4.
- **Security:** 
    - JWT-based RBAC (Admin, Compliance, Auditor).
    - Secrets injected via environment variables (Railway/Vercel), never committed.
    - Cloudflare WAF + mTLS for origin protection in production.

### Directory Structure
- `apps/`: Individual microservices.
- `packages/`: Shared libraries (`sdk`, `types`, `compliance-rules`).
- `programs/`: Anchor/Rust Solana smart contracts.
- `infra/`: Infrastructure-as-code and configuration (DB, GCP, K8s).
- `docs/`: Extensive documentation (Architecture, Deployment, Reports).
- `scripts/`: Utility scripts for migrations, seeding, and syncing.

### Key Configuration Files
- `Anchor.toml`: Solana program IDs and cluster settings.
- `package.json` (Root): Workspace orchestration and global scripts.
- `docs/ENVIRONMENT_VARIABLES.md`: Critical reference for service setup.
