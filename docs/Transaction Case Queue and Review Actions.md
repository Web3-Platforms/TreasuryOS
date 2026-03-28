# Goal Description

Implement Task 9 of the MVP Execution Plan: "Transaction Case Queue and Review Actions." We will introduce a new transactions dashboard interface allowing compliance officers to review and action (approve, reject, escalate) queued transaction cases according to the defined backend rules.

## Proposed Changes

### `apps/dashboard/app/actions.ts`
[MODIFY] `actions.ts`
- Add Server Actions bridging the Next.js frontend to the `api-gateway` transaction cases module:
  - `reviewTransactionAction(caseId: string)` -> Points to `POST /transaction-cases/:caseId/review`
  - `approveTransactionAction(caseId: string, notes: string)` -> Points to `POST /transaction-cases/:caseId/approve`
  - `rejectTransactionAction(caseId: string, notes: string)` -> Points to `POST /transaction-cases/:caseId/reject`
  - `escalateTransactionAction(caseId: string, notes: string)` -> Points to `POST /transaction-cases/:caseId/escalate`

### `apps/dashboard/app/(dashboard)/transactions`
[NEW] `transactions/page.tsx`
- Create the main Transaction Case Queue table.
- Display properties like the transaction reference, amount, wallet addresses, risk level, and current case status.

[NEW] `transactions/[id]/page.tsx`
- Create the Transaction Detail View allowing in-depth inspection.
- Present triggered rules, asset information, entity links, and audit history.
- Include action buttons to Review, Approve, Reject, or Escalate the transaction.

### `apps/dashboard/components/app-shell.tsx`
[MODIFY] `app-shell.tsx`
- Add a new sidebar navigation link pointing to `/transactions`.

### `scripts` (Optional Helper)
[NEW] `scripts/simulate-transaction.ts`
- Write a quick testing script using the `POST /transaction-cases` screening endpoint to programmatically inject a few dummy transactions so that the dashboard has queue data to display.

## User Review Required

> [!IMPORTANT]
> Because there is currently no backend/UI integration naturally feeding transaction payloads into our API Gateway (since we have no SWIFT/AMINA integrations yet), I will create a script `scripts/simulate-transaction.ts`. We will use this script to mock a few incoming transactions into the screening pipeline to verify the UI.

Please review and approve this plan so we can move forward with Task 9 execution!
