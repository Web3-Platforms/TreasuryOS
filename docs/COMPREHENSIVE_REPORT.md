# TreasuryOS Comprehensive Architectural & MVP Report

**Status:** Hackathon MVP Completed & Cloud-Ready  
**Date:** March 2026  

## Executive Summary
TreasuryOS is a Solana-native institutional treasury and compliance platform designed for the strict regulatory requirements of modern crypto-financial services (e.g., EU MiCA compliance). It provides robust identity verification (KYC/KYB), multi-signature governance (Squads), strict auditing trails, and fully authenticated, role-based workflows for institutional onboarding and treasury transactions.

The MVP phase successfully transitioned execution from localized development environments to a high-grade cloud deployment architecture mapping to production readiness.

---

## 1. Cloud Architecture & Infrastructure Stack

The infrastructure was transitioned into standard serverless and managed cloud offerings for seamless scaling.

### Frontend Layer
- **Hosting:** Vercel
- **Framework:** Next.js (Dashboard App)
- **Role:** Handles institutional compliance onboarding requests, dashboard visibility for reviewers, and the initiation of actions. 
- **Domain:** `https://treasuryos.aicustombot.net`

### API & Backend Layer
- **Hosting:** Railway (Dockerized & auto-deployed via Github Integrations)
- **Framework:** NestJS (API Gateway)
- **Role:** Central orchestrator handling business logic, enforcing strict RBAC (Role-Based Access Control) using Supabase JWT tokens, managing Solana workflows, and capturing immutable audit tails.
- **Domain:** `https://api.treasuryos.aicustombot.net/api`

### Data & State Layer
- **Primary Database:** Neon Serverless Postgres. High availability PostgreSQL mapped using the generic `pg` client and poolers with `pgbouncer=true` and `sslmode=require`.
- **Cache & Message Broker:** Upstash Serverless Redis via REST interface. Prevents TCP socket exhaustion in serverless scaling environments using HTTP-based message queuing for the `@bull-board` and `@nestjs/bull` pipelines.

### Authentication & Identity
- **Provider:** Supabase
- **Implementation:** The Next.js frontend handles login and session via SSR and Supabase Client components. The API Gateway utilizes a `JwtAuthGuard` mapping Supabase `sub` and `email` JWT claims to the internal `UsersRepository`. This hybrid architecture protects local Role-Based access control (Admin, Auditor, Compliance Officer) without storing passwords inside the project.

---

## 2. Core Functional Workflows

### A. Entity Onboarding & KYC Webhooks (Sumsub)
- Institutions originate requests for onboarding via the frontend.
- **Compliance Integration:** Webhooks triggered from Sumsub are securely intercepted via `/kyc/webhooks/sumsub`.
- **Security Check:** Webhook payloads are hashed locally with `SUMSUB_WEBHOOK_SECRET` and strictly validated using timing-safe equivalence (`crypto.timingSafeEqual`) against the `x-payload-digest` HMAC header.
- **Deduplication:** The `provider_webhooks` Postgres table automatically manages deduplication mapping, preventing replay attacks or mis-transitions.

### B. Wallet Whitelisting & Solana Interaction
- When an entity's KYC transitions to `Approved`, their submitted treasury wallets enter the `WalletRequest` queue.
- **Devnet Synchronization:** Approved requests interact directly with the Solana Devnet via the `@treasuryos/sdk` to insert public keys into the institutional Whitelist Contract.
- **Signing Strategies:**
  - **Local/Development:** Read directly from filesystem `~/.config/solana/id.json`.
  - **Production:** AWS KMS-backed keys (`SOLANA_SIGNING_MODE=kms`), enabling headless and secure chain transaction signatures from bounded API containers without exposing keypairs.

### C. Transaction Case Management & Escalations
- Real-time transaction monitors interface with the system. Triggers identified as high risk are bundled into *Cases*.
- Compliance reviewers can review, approve, or reject cases pending escalation natively from the API.

---

## 3. Security posture & Runtime Hardening

- **CORS Mitigation:** API dynamically restricts CORS traffic strictly pointing to `FRONTEND_URL`.
- **Strict Validations:** `env.ts` enforces non-negotiable validations using `zod` for JWT lengths, cryptographic presence, and proper UUID parsing prior to app boot.
- **Role Guards:** Controllers enforce decorators such as `@Roles(UserRole.Admin, UserRole.ComplianceOfficer)` alongside global protection from the Supabase `JwtAuthGuard`. 
- **Idempotency Standards:** Event queues run under atomic constraints preventing duplication failures.

---

## 4. Documentation Hierarchy

For operational and development reference, the documentation has been organized into clear subsections:

- **`/docs/architecture/`**: Flowcharts, workflow models, and diagrams for specific implementation models.
- **`/docs/deployment/`**: Specific step-by-step guides for environment set-up across Neon, Upstash, and Railway. 
- **`/docs/history/`**: Preserved archive of MVP planning phases, task sheets, and iterative implementations used to coordinate the initial prototype.
- **`/docs/assets/`**: Repository diagrams, PDF analysis files, and images.
