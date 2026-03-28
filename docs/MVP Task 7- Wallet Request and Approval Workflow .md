# MVP Task 7: Wallet Request and Approval Workflow

This implementation plan describes how we will bring the wallet state machine into the Dashboard to fulfill the next step in the TreasuryOS MVP. 

## Proposed Changes

We will build out the `wallets` section of the dashboard application. This UI relies heavily on Next.js Server Actions and standard HTML forms to connect securely to the existing backend endpoints we established in the `api-gateway`. 

### Server Actions
#### [MODIFY] `apps/dashboard/app/actions.ts`
We will add new server actions that proxy to the `api-gateway`:
- `requestWalletAction`: Posts a new wallet address and description tied to an Entity (`POST /api/wallets`).
- `reviewWalletAction`: Moves a `submitted` wallet to `under_review` (`POST /api/wallets/:id/review`).
- `approveWalletAction`: Transitions the wallet to `approved` and fires the dummy whitelist queue (`POST /api/wallets/:id/approve`).
- `rejectWalletAction`: Fails the wallet and skips chain sync (`POST /api/wallets/:id/reject`).

### Wallet Views
#### [NEW] `apps/dashboard/app/(dashboard)/wallets/page.tsx`
- The `Wallets` list screen. Fetch from `GET /api/wallets` via isomorphic fetch.
- Contains a data table mapping the wallet status, entity ID, wallet address, and chain sync state.

#### [NEW] `apps/dashboard/app/(dashboard)/wallets/[id]/page.tsx`
- The `Wallet Detail` screen.
- Fetches the wallet record via `GET /api/wallets/:id`.
- Conditional rendering of actions:
  - If `submitted`, show button for `Mark Under Review`.
  - If `under_review`, show buttons for `Approve` and `Reject`.
- Surface detailed attributes like the simulated `whitelistEntry` ID, `chainTxSignature` (if synced), and `syncError` to provide full transparency into the pipeline's behavior.

### Entity Screen Enhancements
#### [NEW] `apps/dashboard/components/request-wallet-form.tsx`
- A reusable Client Component exposing a simple text input for `walletAddress` and a submit button. It will hook into our `requestWalletAction`.

#### [MODIFY] `apps/dashboard/app/(dashboard)/entities/[id]/page.tsx`
- Conditionally render the `RequestWalletForm` *only if* the entity has successfully completed its onboarding and achieved an approved KYC state (based on `@treasuryos/compliance-rules`).

## Open Questions
- **Action UX:** Currently, Server Actions automatically trigger a page refresh via `revalidatePath` in Next.js. I'm assuming that this immediate refresh (standard SSR behavior) is sufficient for MVP rather than building optimistic, locally-mutated UI states?
- **Review Notes:** The backend API accepts optional `notes` when reviewing/approving/rejecting. Should we include a prominent textarea for operators to leave rationale on the detail page, or keep it to 1-click approvals for MVP velocity? (I will plan to provide 1-click buttons for highest velocity unless you state otherwise).

## Verification Plan

### Automated Tests
- Since we lack robust frontend tests in the plan right now, we will verify the code builds via `npm run typecheck` across the dashboard workspace.

### Manual Verification
- Log in to the dashboard.
- Navigate to an Entity that has been approved.
- Submit a valid Solana address.
- Verify the wallet displays in the Wallet Queue (`/wallets`).
- Navigate into the Wallet Details, click `Review`, then `Approve`.
- Inspect the wallet state progression and confirm audit logs populate automatically in the database.
