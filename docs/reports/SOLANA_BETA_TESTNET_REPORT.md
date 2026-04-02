# Solana Beta Testnet Report

Task:
- `document-solana-beta-launch`

Decision:
- TreasuryOS will keep Solana off mainnet for the beta launch.
- The designated non-mainnet cluster for the beta path is `testnet`.
- Live on-chain sync still stays gated behind `SOLANA_SYNC_ENABLED=false` until testnet signer and program deployment work are ready.

Repository changes made:
- Added `SOLANA_NETWORK` validation to the API gateway and KYC service env loaders.
- Removed the API gateway wallet sync hardcode that always labeled Solana as `devnet`.
- Updated the dashboard home copy so it no longer promises devnet-specific behavior.
- Updated the launch/status/environment docs to reflect the beta testnet posture.
- Marked the older devnet-only ADR as superseded by a beta-testnet ADR.

What this means operationally:
- Beta launch does **not** require Solana mainnet.
- Beta launch does **not** require live Solana sync on day one.
- If you keep `SOLANA_SYNC_ENABLED=false`, the product stays in preview mode and avoids on-chain writes.
- If you later want live beta sync, the next safe target is testnet, not devnet and not mainnet.

Manual beta checklist:
1. Keep `SOLANA_SYNC_ENABLED=false` in Railway until the testnet signer and deployed programs are ready.
2. Set `SOLANA_RPC_URL=https://api.testnet.solana.com` in the live API environment before enabling any beta sync path.
3. Set `SOLANA_NETWORK=testnet` in the live API environment.
4. If the KYC service will participate in on-chain sync later, set the same `SOLANA_RPC_URL` / `SOLANA_NETWORK` values there too.
5. Deploy the whitelist program to testnet and set the real testnet `PROGRAM_ID_WALLET_WHITELIST`.
6. Only after the signer, RPC, and program ID are verified on testnet should `SOLANA_SYNC_ENABLED` be turned on.

What I still need from you for live testnet sync:
- a funded testnet authority signer, or approval for me to keep the current preview-only posture
- the final testnet program ID(s) after deployment, if you want real on-chain beta execution

Brief: how Solana works in TreasuryOS
- Solana is an account-based chain. Programs do not store state inside themselves; they read and write separate accounts.
- TreasuryOS uses Solana programs such as the wallet whitelist and compliance registry as the on-chain policy layer.
- The backend talks to Solana through an RPC endpoint (`SOLANA_RPC_URL`). That RPC is how the app reads state, simulates transactions, and submits signed transactions.
- Program-derived addresses (PDAs) are deterministic accounts derived from seeds like institution ID + wallet address. TreasuryOS uses those to calculate where a whitelist entry should live before anything is written.
- The authority signer is the wallet/keypair that authorizes TreasuryOS on-chain actions. In production-style environments, that signer should come from injected secret material or a stronger custody path, not from source control.
- A transaction is built from one or more instructions, signed by the authority, and then submitted through the RPC. If Squads multisig is enabled, TreasuryOS can create a proposal instead of sending the transaction directly.
- Clusters matter:
  - `devnet` is easiest for local development
  - `testnet` is the chosen beta cluster for TreasuryOS
  - `mainnet-beta` is the real production network and should stay out of scope for beta

Status:
- Completed
