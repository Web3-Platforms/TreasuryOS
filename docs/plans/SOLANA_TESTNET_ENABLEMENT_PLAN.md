# Solana Testnet Enablement Plan

## Objective

Move TreasuryOS from Solana preview-only mode to real on-chain execution on **testnet** in a controlled way.

## Current implementation progress

- Startup and readiness hardening for live wallet sync is now implemented in `apps/api-gateway`.
- The API gateway now exposes:
  - `GET /api/health/live`
  - `GET /api/health/ready`
- A reusable signer export helper now exists at:
  - `scripts/solana-keypair-to-env.ts`
- A safe Railway variable template now exists at:
  - `infra/railway/api-gateway.testnet.env.example`
- The wallet whitelist program is now deployed on testnet at:
  - `3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c`
- The API gateway production-start path was smoke-tested locally after fixing an eager Squads SDK import that crashed Node 22 startup even when multisig was disabled.
- The live Railway runtime now returns `GET /api/health/ready` successfully with preview-safe testnet settings on both the custom domain and the Railway domain.
- The dashboard now exposes entity approval actions for `under_review` entities, closing the missing UI step between KYC completion and wallet request creation.
- The remaining external work for real enablement is still:
  - flip `SOLANA_SYNC_ENABLED=true` for one controlled canary redeploy
  - approve one wallet through the normal product flow
  - verify the Solana signature, sync fields, and explorer record before any wider rollout

For the current codebase, the first realistic meaning of "real transaction" is:

- a real wallet whitelist transaction sent from the API gateway to the Solana **testnet** whitelist program during wallet approval
- or, if governance is enabled later, a real Squads proposal created on testnet instead of direct execution

This plan does **not** assume a general-purpose treasury asset transfer engine already exists in the product. The current on-chain execution path is centered on wallet whitelist synchronization.

## Scope

### In scope for the first cut

- real testnet wallet whitelist writes from `apps/api-gateway`
- Railway configuration for signer, RPC, and program ID
- safe canary rollout and rollback
- code hardening needed to make testnet enablement operationally safe

### Explicitly out of scope for the first cut

- Solana mainnet
- live fiat or bank-rail execution
- full KYC compliance-registry writes from `apps/kyc-service`
- mandatory Squads multisig on day one
- AI-driven automatic approvals or autonomous on-chain signing
- a broader treasury transfer engine beyond the whitelist flow already present in the code

## Current state in the repository

### What already exists

- `apps/api-gateway/src/modules/wallets/wallet-sync.service.ts`
  - computes preview whitelist entries
  - sends a real Solana transaction if `SOLANA_SYNC_ENABLED=true`
  - can route through Squads if `SQUADS_MULTISIG_ENABLED=true`
- `apps/api-gateway/src/modules/security/authority-signer.service.ts`
  - loads the authority signer from either a filesystem keypair or `AUTHORITY_KEYPAIR_JSON`
- `apps/api-gateway/src/config/env.ts`
  - validates `SOLANA_RPC_URL`, `SOLANA_NETWORK`, `PROGRAM_ID_WALLET_WHITELIST`, signer settings, Squads flags, and `SOLANA_SYNC_ENABLED`
- `target/deploy/`
  - contains local Anchor deploy artifacts for `wallet_whitelist`
- `tests/solana-network-config.test.ts`
  - already covers testnet env parsing
- `tests/wallet-whitelist-sdk.test.ts`
  - already covers deterministic whitelist PDA derivation and instruction building

### What is still gated or incomplete

- `SOLANA_SYNC_ENABLED` defaults to `false`
- the API env defaults still point to `devnet` unless explicitly overridden
- `apps/kyc-service/src/sync/onchain-sync.service.ts` is still `dryRun: true`
- the repository does not yet prove a live testnet wallet-approval transaction from the API gateway
- current tests do not exercise a real testnet transaction against a funded signer and deployed program
- Railway deploy submission can appear green before the new container boots, so live verification must check the runtime surface and not only the GitHub Actions result

## Recommended rollout strategy

### Recommendation

Use a **two-step rollout**:

1. **Direct signer on testnet first**
   - keep Squads disabled
   - enable only the wallet whitelist transaction path
   - prove one successful canary transaction end to end
2. **Add higher-safety extras later**
   - Squads multisig proposal flow
   - optional compliance-registry writes from the KYC service
   - stronger readiness/observability around Solana

### Why this is the safest first move

- it limits the number of moving parts in the first real on-chain cutover
- it proves the critical path that already exists in code
- it avoids mixing first-time program deployment, signer injection, and multisig logic in one step

## AI role, service enhancement, and integration model

The repository currently treats `AI-assisted screening` as a deferred capability, so AI should be planned as a **controlled assistive layer** on top of the existing operator workflows, not as a replacement for them.

The dedicated implementation plan for this area lives at:

- `docs/plans/AI_ADVISORY_LAYER_IMPLEMENTATION_PLAN.md`

The summary below stays here because it defines the specific guardrails AI must respect during the Solana testnet rollout.

### AI role in TreasuryOS

AI should act as a **decision-support and workflow-acceleration layer** for treasury, compliance, and audit teams.

Its job is to:

- summarize complex operational context
- explain why a wallet or transaction looks risky or low risk
- draft operator-ready narratives for reports and audit review
- surface anomalies or missing context before an operator takes action

Its job is **not** to:

- hold or access signing authority
- bypass RBAC
- auto-approve wallets, entities, or transaction cases
- submit Solana transactions directly

### How AI can enhance TreasuryOS services

#### 1. Entity onboarding and KYC review

AI can help summarize:

- entity profile
- KYC state and missing information
- risk signals gathered from the entity record and review history

This would make the onboarding flow faster for compliance officers without changing the authoritative entity state model.

#### 2. Wallet governance

For wallet requests, AI can:

- explain the operational context of a wallet request
- summarize related entity status, KYC state, and prior review notes
- flag patterns that deserve manual review before wallet approval

This is especially useful before a real testnet sync is triggered because it gives the operator an extra review layer before on-chain execution.

#### 3. Transaction screening and case review

This is the clearest near-term AI use case.

The current transaction-case flow already produces:

- triggered rules
- entity and wallet context
- audit events
- case notes and review outcomes

AI can enhance that flow by:

- translating triggered rules into plain-language risk explanations
- drafting a recommended review checklist
- summarizing prior related cases and review notes
- generating an operator-facing recommendation that still requires human approval

#### 4. Reporting and audit

AI can make reporting more useful by:

- generating narrative summaries for monthly reports
- producing management-ready or auditor-ready explanations from raw metrics
- helping operators search and summarize audit history faster

#### 5. Client-facing service quality

From a client perspective, AI can improve the platform by making the system feel more guided and intelligent:

- better explanations for why a review is pending
- clearer summaries of what the operator should do next
- faster turnaround on compliance and reporting workflows

### How AI should integrate with the current system

The safest integration pattern is:

`Dashboard -> API Gateway -> AI service/module -> existing data modules -> operator review -> existing approval flow -> optional Solana sync`

### Recommended integration points

AI should integrate **beside** the current modules, not inside the signing path:

- `entities` module for onboarding and KYC summary context
- `wallets` module for wallet review support
- `transaction-cases` module for risk explanation and case triage assistance
- `reports` module for narrative report generation
- `audit` module for evidence summarization and traceability

### Recommended implementation shape

Add a dedicated AI-facing service behind the API gateway that:

- reads data from existing repositories and services
- receives shaped, non-secret context objects instead of raw unrestricted access
- returns structured outputs such as:
  - `summary`
  - `recommendation`
  - `riskFactors`
  - `confidence`
  - `model`
  - `generatedAt`
- stores those outputs as **advisory metadata**, not as final decisions

### Solana-specific AI boundary

For the Solana testnet rollout, AI can assist **before** and **after** on-chain execution, but not **during signing**.

AI may:

- summarize whether a wallet approval looks ready for sync
- explain why a canary transaction should or should not be attempted
- summarize a returned transaction signature and explorer result for operators

AI must not:

- call `AuthoritySignerService.getSigner()`
- construct the final signing decision on its own
- replace `WalletSyncService` as the system of record for chain writes

### Security and governance rules for AI

Any AI integration should follow these rules:

- no signer material, secret values, or unrestricted env data may be sent to the model layer
- AI output must be logged and attributable
- AI suggestions must remain human-reviewed
- operator actions and audit records remain the authoritative workflow
- Solana execution remains gated by the existing API approval flow and env flags

### AI rollout recommendation

AI should be introduced in three controlled phases:

1. **Read-only summaries first**
   - report narratives
   - case summaries
   - audit summarization
2. **Decision-support second**
   - wallet review recommendations
   - transaction-case triage suggestions
3. **Broader workflow assistant later**
   - cross-case anomaly detection
   - entity-to-wallet-to-case contextual copilots

AI should remain **non-blocking** for the first real Solana testnet canary. The first cut to testnet should succeed without AI being required in the execution path.

## Workstreams

## 1. Define the first live Solana scope

Before implementation starts, freeze the first cut to:

- wallet approval -> real testnet whitelist transaction
- direct signer path
- one API service only (`apps/api-gateway`)
- no KYC on-chain writes yet
- no Squads in the first canary

If that scope changes, the plan should be revised before execution.

## 2. Prepare testnet chain infrastructure

### Required manual operations

1. Create or designate a dedicated **testnet authority wallet**
2. Fund it with enough SOL for deployment and transaction fees
3. Deploy the `wallet_whitelist` program to testnet
4. Record the deployed program ID
5. Verify the deployment on Solana Explorer and with CLI tooling

### Required outputs from this phase

- funded authority signer
- final testnet `PROGRAM_ID_WALLET_WHITELIST`
- proof that the deployed program is reachable from `https://api.testnet.solana.com`

## 3. Harden the API path before enabling live writes

These are the recommended code changes before flipping `SOLANA_SYNC_ENABLED=true`.

### 3.1 Add startup safety guards

If `SOLANA_SYNC_ENABLED=true`, the API should fail fast unless all of the following are true:

- `SOLANA_NETWORK=testnet`
- `SOLANA_RPC_URL` points to the intended testnet RPC
- `PROGRAM_ID_WALLET_WHITELIST` is set
- the authority signer loads successfully

This removes the risk of accidentally enabling live sync with devnet defaults or missing signer material.

### 3.2 Add Solana readiness checks

Add a small readiness path or startup verification that confirms:

- RPC connectivity works
- the program account exists on testnet
- the loaded authority public key is available

This does not need to block local development, but it should be available for staging and production verification.

### 3.3 Add transaction preflight logging

Before the first live cutover, improve visibility around:

- authority public key in use
- network and RPC target
- program ID
- resulting transaction signature
- derived explorer URL for testnet

### 3.4 Review wallet sync state semantics

Current behavior is usable, but slightly confusing:

- wallet request starts with `chainSyncStatus=pending` before any on-chain attempt
- Squads proposal mode would currently leave the wallet in `approved` status rather than a clearer on-chain pending state

Recommendation:

- do **not** let this block the first direct-signer canary
- but capture a follow-up task to improve wallet status semantics before a wider rollout or before enabling Squads

### 3.5 Define AI guardrails and advisory outputs

Before AI is introduced into live operator workflows, define:

- which AI outputs are allowed in each module
- how those outputs are stored and audited
- what human approval step remains mandatory
- which fields must be redacted before data is sent to the model layer

The recommended first AI outputs are:

- transaction-case summaries
- report narratives
- wallet-review recommendations

## 4. Configure the live environment for testnet

### Railway environment target

The API service should be updated to:

```env
SOLANA_RPC_URL=https://api.testnet.solana.com
SOLANA_NETWORK=testnet
PROGRAM_ID_WALLET_WHITELIST=<real_testnet_program_id>
SOLANA_SIGNING_MODE=environment
AUTHORITY_KEYPAIR_JSON=<railway_secret_json_array>
SOLANA_SYNC_ENABLED=false
SQUADS_MULTISIG_ENABLED=false
```

### Recommended sequence

1. update RPC, network, and program ID
2. inject signer material
3. redeploy with sync still disabled
4. verify preview mode still behaves correctly on testnet settings
5. only then enable `SOLANA_SYNC_ENABLED=true`
6. keep any AI layer read-only or disabled during the first real canary

## 5. Validate locally and in a canary environment

### Local validation

Before changing Railway live behavior:

- run `npm run typecheck`
- run `npm test`
- run the fast Solana-related tests:
  - `node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/solana-network-config.test.ts tests/wallet-whitelist-sdk.test.ts`

Then run the API locally with testnet settings and a testnet signer:

- first with `SOLANA_SYNC_ENABLED=false`
- then with `SOLANA_SYNC_ENABLED=true`

Success criteria for the local direct-write test:

- approving a wallet returns `chainSyncStatus=sent`
- a real `chainTxSignature` is stored
- the signature resolves on Solana Explorer for testnet

### Canary validation

Use a single controlled wallet approval as the first real testnet canary.

The canary should verify:

- API logs show the intended network, program ID, and authority
- wallet approval produces a real testnet signature
- database fields are populated:
  - `chain_sync_attempted_at`
  - `chain_sync_status`
  - `whitelist_entry`
  - `chain_tx_signature`
- audit records contain the signature metadata
- any AI advisory layer remains observational only and does not change the approval authority

## 6. Controlled production enablement

### Step-by-step rollout

1. Deploy the code hardening changes with `SOLANA_SYNC_ENABLED=false`
2. Set testnet env vars and signer in Railway
3. Redeploy and verify readiness
4. Run one manual wallet approval canary
5. If successful, enable the live testnet path for a small number of internal test wallets
6. Keep Squads and KYC on-chain sync disabled until the direct-signer path is stable

### Rollback

The immediate rollback is:

```env
SOLANA_SYNC_ENABLED=false
```

Then redeploy the API service.

This should return the product to preview-only mode without undoing already-submitted testnet transactions.

## 7. Phase 2 after first success

Only after the first direct-signer canary succeeds should TreasuryOS consider:

- enabling `SQUADS_MULTISIG_ENABLED=true`
- creating a proper wallet status for "proposal pending" or "on-chain pending"
- enabling KYC-service writes to the compliance registry
- adding richer Solana health and observability surfaces
- introducing AI decision-support into wallet and transaction-case flows

## Inputs needed before execution

These decisions or assets are needed before work starts:

1. approval to keep the **first live scope** limited to wallet whitelist sync only
2. approval to use **direct signer first** instead of Squads for the canary
3. a funded testnet authority wallet
4. the final deployed testnet whitelist program ID
5. the chosen AI deployment posture for future phases:
   - no AI at first canary
   - read-only advisory AI after canary
   - or a later dedicated AI phase
6. the preferred AI hosting model for future integration:
   - external managed model
   - internal/self-hosted model
   - or postponed decision

## Exit criteria

The first cut is complete when all of the following are true:

- the whitelist program is deployed on testnet
- the Railway API environment points to testnet
- the authority signer loads from secrets successfully
- one wallet approval produces a real testnet transaction signature
- the signature is visible on Solana Explorer
- the API stores and surfaces the signature correctly
- rollback back to preview-only mode is proven

## Recommended next implementation tasks

1. add API startup and readiness guards for live Solana sync
2. deploy and verify the wallet whitelist program on testnet
3. configure Railway signer and testnet env vars
4. run a direct-signer canary wallet approval
5. decide whether Squads becomes the second-phase governance layer
6. design the AI advisory service boundary for transaction cases, wallet reviews, and reporting
