# Entity Edit Reapproval Flow Report

## Summary

This update enables controlled entity editing for privileged operators without breaking the current pilot launch flow.

Before this fix, entity edits were effectively limited to `draft` entities. Once an entity had moved into approval or KYC states, operators could no longer correct its profile through the product UI.

## Problem

The API already exposed `PATCH /api/entities/:entityId`, but the service only allowed edits while an entity remained in `draft`.

That created a launch problem:

- operators could not correct entity information after approval
- correcting core identity or risk data should force a fresh review
- the current pilot bypass path still needed to remain usable so the testnet flow would not get stranded

## What changed

- Expanded the API update flow from draft-only edits to a general privileged entity update path
- Restricted edit access to `admin` and `compliance_officer`, matching the intended approval authority
- Added a dashboard entity edit form on the entity detail page
- When a non-draft entity is edited, the API now:
  - resets the entity back to `draft`
  - clears previous KYC linkage and review metadata
  - clears prior approval timestamps
  - records the reset in audit metadata with the previous entity/KYC states
- Preserved the pilot-bypass path so a corrected entity can be re-approved immediately during the current launch phase

## Operator behavior now

1. Open an entity detail page as Admin or Compliance Officer
2. Use **Edit Entity Info**
3. Save the corrected legal name, notes, or risk level
4. If the entity was already beyond draft:
   - status returns to `draft`
   - KYC/approval state is cleared
   - the record requires submission/reapproval again
5. If pilot manual KYC bypass is enabled, the operator can immediately use that approval path again

## Why this is safe

- Editing no longer silently preserves stale approvals after material record changes
- Existing wallets remain attached to the entity record, but the entity itself must be re-approved before operators continue the review flow
- Audit metadata captures the workflow reset so reviewers can see that the entity was changed after a prior approval state

## Validation

Validated with:

- `npm run typecheck`
- `npm run build -w @treasuryos/api-gateway`
- `API_BASE_URL=http://localhost:3001/api npm run build -w @treasuryos/dashboard`
- `node ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.test.json --test tests/api-gateway-auth.test.ts`

Regression coverage now proves that a pilot-bypass-approved entity can be:

- edited
- reset to `draft`
- re-approved successfully
