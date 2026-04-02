# Solana Launch Path Report

Task:
- `launch-solana-path`

Current findings:
- The API code already supports Solana wallet sync, but real on-chain execution requires:
  - a deployed whitelist program,
  - a valid signer configured for Railway,
  - `SOLANA_SYNC_ENABLED=true`.
- The current Railway `PROGRAM_ID_WALLET_WHITELIST` value does not resolve on devnet.
- The repo does contain matching local deploy artifacts for `wallet_whitelist`:
  - `target/deploy/wallet_whitelist.so`
  - `target/deploy/wallet_whitelist-keypair.json`
- The local deploy keypair matches the Rust program ID `3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c`, but that program is also not currently live on devnet.

What was attempted:
- Verified the current and historical whitelist program IDs against devnet.
- Confirmed the whitelist deploy artifact and matching program keypair exist locally.
- Attempted a devnet deployment of `wallet_whitelist.so`.

Decision update:
- Launch scope changed after investigation: Solana will stay preview-only for the first launch.
- The beta Solana cluster target is now testnet rather than devnet.
- Real on-chain sync is deferred until after launch.

What this means:
- Keep `SOLANA_SYNC_ENABLED=false` for launch.
- Keep the current Solana UX in preview mode without live on-chain execution.
- Align `SOLANA_RPC_URL` / `SOLANA_NETWORK` to testnet before enabling any beta sync path.
- The deployable next step for Solana beta is clear: fund the authority wallet, deploy the whitelist program to testnet, set the real testnet program ID in Railway, and only then enable sync.

Status:
- Completed in preview-only mode
