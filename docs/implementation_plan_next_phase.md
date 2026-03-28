# TreasuryOS Next Phase: Production Infrastructure & Governance

This plan outlines the steps to transition TreasuryOS from a hardened MVP to an institutional-grade production environment. It focuses on secure key management, multi-signature governance, and enterprise-grade deployment.

## User Review Required

> [!IMPORTANT]
> **KMS Selection**: This plan assumes **AWS KMS** for Ed25519 signing. If you prefer Google Cloud KMS (Cloud KMS), the implementation details will differ slightly but the architecture remains the same.
> **Infrastructure Cost**: Moving to managed Redis (e.g., Upstash) and AWS KMS will incur monthly costs.
> **Vercel Limits**: Running NestJS as Vercel Functions has a 10s (Hobby) to 30s/900s (Pro) execution limit. Solana transactions are usually fast enough, but heavy sync tasks may need a separate worker (Cloud Run/Railway).

## Proposed Changes

### 1. Deployment: Vercel Production Environment

We will split the monorepo into two Vercel projects for optimal scaling and configuration.

#### [NEW] [api-gateway/vercel.json](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/vercel.json)
Provides the runtime configuration for NestJS as a Vercel Serverless Function.

#### [MODIFY] [dashboard/next.config.mjs](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/dashboard/next.config.mjs)
Ensure output is set to `standalone` and `images` are optimized for production.

---

### 2. Reverse Proxy & Security (Cloudflare)

**Manual Work Required**:
1. Point your domain to Cloudflare.
2. Add CNAME records for `app.yourdomain.com` and `api.yourdomain.com` pointing to Vercel's assigned domains.
3. Enable **Full (Strict) SSL/TLS**.
4. Configure WAF Rules:
   - Rate limit `/api/auth/login`.
   - Block non-standard HTTP methods on sensitive routes.

---

### 3. Key Management: Solana AWS KMS Integration

Transition away from insecure filesystem `.json` keypairs to hardware-backed security.

#### [NEW] [Security Module](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/modules/security/kms.service.ts)
A new service implementing `@solana/keychain-aws-kms`. It will handle all on-chain signing requests without ever exposing the private key to the application memory.

#### [MODIFY] [WalletsService](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/modules/wallets/wallets.service.ts)
Update signing logic to delegate to `KmsService`.

---

### 4. Governance: On-chain Multi-Sig (Squads V4)

Implement institutional "Check-and-Balance" by requiring multiple approvals for treasury movements.

#### [NEW] [Governance Module](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/modules/governance/squads.service.ts)
Integrates `@squads/v4-sdk`. Instead of executing an `add_to_whitelist` instruction directly, the API will now "Propose" the transaction to a Squads Multi-Sig.

#### [MODIFY] [TransactionCasesService](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/api-gateway/src/modules/transaction-cases/transaction-cases.service.ts)
Update `applyDecision` to trigger a Squads proposal when the institution requires Multi-Sig approval.

---

## Open Questions

1. **Which AWS Region** will you use for the KMS keys? (Recommend same as Vercel deployment region for lower latency).
2. **Squads Threshold**: What is the initial approval threshold for the Multi-Sig? (e.g., 2-of-3, 3-of-5).
3. **Managed Redis**: Do you have an Upstash or Redis Enterprise account ready? Vercel requires a public-facing Redis for its serverless functions to connect.

## Verification Plan

### Manual Verification
1. **Security Headers**: Verify headers like `Strict-Transport-Security` via `curl -I`.
2. **KMS Signing**: Perform a test whitelist sync and verify the transaction signature on Solana Explorer.
3. **Multi-Sig Proposal**: Create a transaction case, approve it, and verify that it appears as a "Pending Proposal" in the Squads Dashboard.
4. **Vercel Cold Starts**: Monitor API latency to ensure NestJS bootstrap time is within acceptable limits for serverless execution.
