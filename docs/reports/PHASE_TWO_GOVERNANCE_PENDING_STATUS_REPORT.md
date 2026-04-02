# Phase Two Governance Pending Status Report

## Summary

This report documents the first implemented Phase 2 Solana governance slice for TreasuryOS.

The core change is that a wallet approved through the Squads governance path no longer looks fully approved or fully synced inside the product. Instead, it now enters a distinct `proposal_pending` state until the multisig proposal is actually approved and executed on-chain.

## Problem

Before this change, the wallet approval flow already knew how to create a Squads proposal:

- `WalletSyncService` returned a pending chain-sync result for Squads
- the stored chain transaction reference used a `squads-proposal-*` identifier

But the wider product still collapsed that outcome into a normal approved wallet.

That created an operator and governance risk:

- a governed wallet could appear equivalent to a normal approved wallet
- dashboard operators had no clear signal that the wallet was still waiting on multisig action
- downstream workflows could not distinguish between a preview-only approval and a real governance proposal that was still pending execution

## What changed

- Added a new shared wallet workflow state: `proposal_pending`
- Added a matching chain sync status: `proposal_pending`
- Updated `WalletSyncService` so Squads proposal creation returns the governance-specific pending status instead of the generic pre-sync `pending`
- Added `executionPath` metadata so approval events and queue messages distinguish between:
  - `preview`
  - `direct`
  - `squads`
- Updated `WalletsService.approveWallet()` so:
  - direct execution still lands in `synced`
  - preview mode still lands in `approved`
  - Squads proposal creation now lands in `proposal_pending`
- Updated wallet approval audit summaries to explicitly say when a wallet is awaiting Squads execution
- Updated transaction screening so proposal-pending wallets are blocked with a governance-specific explanation instead of a generic conflict
- Updated monthly reporting so governance-approved wallets in `proposal_pending` still contribute to the approved-wallet metric
- Updated dashboard wallet list/detail surfaces so proposal-pending wallets use clearer amber styling and proposal wording
- Added dashboard operator messaging that the wallet is waiting for multisig approval and execution
- Added regression coverage proving:
  - a Squads-path approval produces `proposal_pending`
  - audit metadata records the `squads` execution path
  - transaction screening stays blocked until multisig execution completes
  - monthly report exports still count governance-approved wallets before final on-chain execution

## Operator impact

After this change, the wallet lifecycle is easier to reason about:

1. A compliance operator can still review and approve the wallet
2. If the runtime uses direct signing, the wallet becomes `synced`
3. If live sync is disabled, the wallet becomes `approved`
4. If Squads governance creates a proposal, the wallet becomes `proposal_pending`
5. Proposal-pending wallets remain visibly incomplete until the multisig action is executed on-chain

This makes the governance path safer for Phase 2 because the product no longer implies that a proposal reference is equivalent to a completed whitelist write.

## Current limitation

This change deliberately stops at the product-semantic layer.

TreasuryOS still needs the next rollout step to complete the full governed path:

- create the real Squads multisig on testnet
- confirm the signer set and threshold
- inject the final multisig address and related runtime settings
- run the first end-to-end governed wallet approval and proposal execution on testnet

## Validation

Validated with:

- `npm run build -w @treasuryos/types`
- `npm run typecheck`
- `npm run build -w @treasuryos/api-gateway`
- `API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard`
- `node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/api-gateway-auth.test.ts tests/squads-service.test.ts tests/wallet-sync-readiness.test.ts`
