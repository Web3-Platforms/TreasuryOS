# Solana Testnet Deployment Worklog

Task:
- `deploy-wallet-whitelist-testnet`

## Current state

- Built the Anchor wallet whitelist program locally with:
  - `anchor build -p wallet-whitelist`
- Verified artifacts now exist:
  - `target/deploy/wallet_whitelist.so`
  - `target/deploy/wallet_whitelist-keypair.json`
- Confirmed the program keypair maps to the intended program ID:
  - `3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c`
- Created a dedicated local testnet authority wallet:
  - path: `~/.config/solana/treasuryos-testnet-authority.json`
  - public key: `EVdLGqin6cYywCr59jaia9eJzepqWzegxs4MZ27JwMJ`
- Confirmed the wallet was funded to `5 SOL`.
- Deployed the program successfully to testnet with:
  - `bash scripts/deploy-wallet-whitelist-testnet.sh`
- Verified the deployed program on-chain with:
  - `solana program show 3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c --url testnet`
- Measured the current program artifact size:
  - `wallet_whitelist.so` = `199640` bytes
- Estimated rent-exempt deployment minimum on testnet:
  - `1.39038528 SOL`
- Captured the deployed program details:
  - Program Id: `3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c`
  - ProgramData Address: `8Q7sbAttwFNYNh2dcLsEKGnT2ZBUP65jbrksLSESvS3M`
  - Upgrade Authority: `EVdLGqin6cYywCr59jaia9eJzepqWzegxs4MZ27JwMJ`
  - Last Deployed In Slot: `399019173`
  - Explorer: `https://explorer.solana.com/address/3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c?cluster=testnet`

## Automation added

Added deploy helper:

- `scripts/deploy-wallet-whitelist-testnet.sh`

Usage:

```bash
bash scripts/deploy-wallet-whitelist-testnet.sh
```

Optional explicit wallet path:

```bash
bash scripts/deploy-wallet-whitelist-testnet.sh ~/.config/solana/treasuryos-testnet-authority.json
```

What it does:

1. checks `solana` and `anchor`
2. verifies build artifacts exist
3. shows the authority wallet, balance, and target program ID
4. deploys `wallet_whitelist.so` to testnet using the canonical program keypair
5. runs `solana program show`
6. prints the Solana Explorer URL

## Result

The wallet whitelist program is now live on Solana testnet.

The dedicated authority wallet retains upgrade authority and is the same wallet that should be represented in Railway through `AUTHORITY_KEYPAIR_JSON`.

## Next step

Configure the Railway API runtime with:

- `SOLANA_RPC_URL=https://api.testnet.solana.com`
- `SOLANA_NETWORK=testnet`
- `PROGRAM_ID_WALLET_WHITELIST=3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c`
- `SOLANA_SIGNING_MODE=environment`
- `AUTHORITY_KEYPAIR_JSON=<generated from ~/.config/solana/treasuryos-testnet-authority.json>`
- `SOLANA_SYNC_ENABLED=false`
- `SQUADS_MULTISIG_ENABLED=false`

Then redeploy the API service and verify `/api/health/ready` before attempting the first canary.

## Deploy command used

The deployment helper remains:

```bash
bash scripts/deploy-wallet-whitelist-testnet.sh
```
