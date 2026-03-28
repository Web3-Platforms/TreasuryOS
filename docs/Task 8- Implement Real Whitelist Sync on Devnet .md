# Task 8: Implement Real Whitelist Sync on Devnet

This task will replace the placeholder Program IDs with real, verifiable keys, deploy the `wallet-whitelist` program to the Solana Devnet, and configure the API Gateway to submit actual on-chain transactions instead of skipping the sync step.

## Proposed Changes

### 1. Update Program Keys
The `anchor build` process generated fresh program keypairs locally. We will update the repository to use these exact keys:
- `wallet_whitelist`: `3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c`
- `compliance_registry`: `ASG5VS1jFQSsLfyuACNvfK2oFsoBd4TQjJBK1uvznorm`
- `tx_monitor`: `4cfb2JR1aEHziz1rGfWAvDry2hj2kScqGLQSbU9VrfWx`

#### [MODIFY] Anchor.toml
- Replace the `[programs.localnet]` IDs with the ones above.

#### [MODIFY] programs/*/src/lib.rs
- For `wallet-whitelist`, `compliance-registry`, and `tx-monitor`, replace the `declare_id!(...)` value with their respective new Pubkeys.

### 2. Devnet Deployment
- We will retrieve 2 Devnet SOL by running `solana airdrop`.
- We will deploy the newly keyed programs to devnet via the CLI: `anchor deploy --provider.cluster devnet`. This solidifies the environment against the user's `AUTHORITY_KEYPAIR_PATH`.

### 3. API Gateway Configuration
#### [MODIFY] .env
- Update all three placeholder `PROGRAM_ID_*` variables with our devnet keys.
- **CRITICAL:** Set `SOLANA_SYNC_ENABLED=true` to turn off the dry-run short-circuit inside `wallet-sync.service.ts`.

## User Review Required

> [!WARNING]
> By setting `SOLANA_SYNC_ENABLED=true`, any new Wallet request Approved via the Dashboard will submit a real devnet transaction. This will consume devnet SOL from your authority keypair (`~/.config/solana/id.json`). Is this OK for this stage of testing?

## Verification Plan
### Automated Verification
- After updating the Rust files, we will run `cargo check` and `anchor build` to ensure the program still compiles with the new IDs.
- Run `anchor deploy` directly to confirm the programs are live on devnet.

### Manual Verification
- We will run a script matching the backend's `sdk` interaction logic using ts-node to simulate a wallet approval. We should get a Devnet transaction signature back, and see `chainSyncStatus: 'sent'` in the logs.
