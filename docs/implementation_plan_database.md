# Implementation Plan: Database & Managed Persistence Strategy

To ensure **TreasuryOS** is production-ready for institutional workloads on Vercel, we need a high-performance, serverless-optimized database strategy.

## Our Recommendation: The Hybrid Path
We will use **both** platforms, leveraging their specific strengths:
1. **Neon** (Primary API Database): Best for the NestJS API Gateway. It provides specialized **connection pooling** (vital for Vercel Serverless Functions) and **database branching** (enabling safe testing for every PR).
2. **Supabase** (Frontend & Storage): Best for the Next.js Dashboard. We will use it for **Compliance Document Storage** (KYC PDFs, audit exports) and **Real-time Notifications**.

---

## Phase 1: Neon Implementation (Core Backend)
- **Goal**: Seamless, high-concurrency PostgreSQL for the API.
- [ ] **Provision Neon Project**: Create a new project in the Neon console.
- [ ] **Enable Pooling**: Use the `.pooler.neon.tech` connection string in the `DATABASE_URL` (port 5432 or 6543) to support hundreds of concurrent serverless requests.
- [ ] **Configure Environment**: 
  - `DATABASE_URL`: Set to Neon pooler string.
  - `DATABASE_SSL`: Set to `true`.
- [ ] **Verification**: Run `npm run db:migrate` (or equivalent) pointing to the Neon instance.

## Phase 2: Supabase Implementation (Frontend & Compliance Docs)
- **Goal**: Managed storage for institutional documents.
- [ ] **Provision Supabase Storage**: Create a private bucket `compliance-docs` for sensitive institutional data.
- [ ] **Setup Supabase Client**: Integrate the Supabase SDK into the **Next.js Dashboard** (only) for document uploads/downloads.
- [ ] **Environment**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Dashboard environment.

## Phase 3: Cross-Module Sync
- [ ] **Audit Webhooks**: (Optional) Use Supabase Edge Functions to relay critical audit logs to an external compliance monitor in real-time.

---

## Why this approach?
- **Neon** solves the "too many connections" problem common with NestJS on Vercel.
- **Supabase** solves the "where do I store my KYC data securely" problem without us writing a custom S3-compatible service.
