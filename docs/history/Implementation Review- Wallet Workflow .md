# Implementation Review: Wallet Workflow

The TreasuryOS console now fully supports institutional wallet approvals natively via the Next.js `dashboard`.

## Changes Made
- **Entity View Upgrades**: When an entity crosses the threshold into `status: approved` alongside `kycStatus: Approved`, the system dynamically renders a `RequestWalletForm` at the bottom of the entity's profile. You can submit Solana devnet public keys here securely. We also embedded a live list of the entity's associated wallets inline so the operator can see existing keys without navigating away.
- **Wallet Queue**: The `/wallets` page now fetches from the `api-gateway` and displays the system's global queue. It surfaces critical information natively, highlighting what wallets are missing signatures or failing to whitelist properly.
- **Wallet Orchestration**: On the Wallet Detail page (`/wallets/:id`), we securely proxy backend actions without relying on a bulky client-side global state store. You can seamlessly sequence a wallet through `submitted -> under_review -> approved` (where it triggers the underlying Solana Devnet whitelist Sync command logic) or optionally straight to `rejected`.
- **Server Actions**: Introduced the four missing RPC proxies: `requestWalletAction`, `reviewWalletAction`, `approveWalletAction`, and `rejectWalletAction`.

## Testing Steps
1. Navigate successfully into the console.
2. In the DB or through the entity API, push an entity over to the fully approved/kyc-verified state.
3. Open `http://localhost:3000/entities/[id]`.
4. The `Request Wallet` form will be visible at the page bottom. Provide a valid solana address (`HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH`).
5. Open `/wallets` in the sidebar. Select your newly submitted wallet.
6. Click **Mark Under Review**. Watch the UI update.
7. Click **Approve & Whitelist**. Watch the UI push changes and log the expected sync attempt to background queues!

> [!NOTE]
> All actions instantly use `revalidatePath` to keep the Next.js server component tree precisely matching the remote Database.

> [!TIP]
> This completes Task 7, shifting focus smoothly to Task 8: The real Whitelist sync!
