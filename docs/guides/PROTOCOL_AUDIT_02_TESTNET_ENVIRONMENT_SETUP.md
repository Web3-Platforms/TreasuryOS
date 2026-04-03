# Protocol Audit Guide 02 — Testnet Environment Setup

Use this guide to prepare the **manual testnet environment** the auditor will
need.

## Goal

By the end of this guide, you should have:

- a dedicated testnet authority,
- deployed testnet program IDs,
- a recorded RPC endpoint,
- exported signer material for runtime use,
- and a small evidence bundle you can hand to the auditor.

## Step 1 — Create a dedicated audit authority

Do **not** use an ad hoc personal wallet for the audit environment.

Create a dedicated authority keypair:

```bash
solana-keygen new --outfile ~/.config/solana/treasuryos-audit-testnet.json
```

Record the public key:

```bash
solana-keygen pubkey ~/.config/solana/treasuryos-audit-testnet.json
```

## Step 2 — Point your local Solana CLI at testnet

Use public testnet or your managed RPC endpoint:

```bash
solana config set --url https://api.testnet.solana.com
solana config set --keypair ~/.config/solana/treasuryos-audit-testnet.json
solana config get
```

If you already have a managed RPC provider for the audit, use that URL instead.

## Step 3 — Fund the authority

Try the standard testnet funding path first:

```bash
solana airdrop 2
solana balance
```

If airdrops are unreliable, fund the wallet using your chosen RPC/provider
workflow and confirm the final balance before deployment.

## Step 4 — Decide whether you are reusing or rotating program IDs

Choose one path:

1. **Reuse existing program IDs** if you still control the deployment keypairs
   that match the current `declare_id!` values.
2. **Create new audit-specific testnet IDs** if you do not control the current
   deployment keypairs or want a clean audit environment.

### Important

If you choose **new audit-specific IDs**, stop and tell Copilot before you
commit repo changes. New program IDs can require coordinated updates to:

- `declare_id!` values,
- `Anchor.toml`,
- environment references,
- and any integration docs that reference the old IDs.

## Step 5 — Build the programs locally before deploying

From the repo root:

```bash
anchor build
```

Confirm the IDLs exist:

```bash
ls -1 target/idl
```

Expected files:

- `wallet_whitelist.json`
- `compliance_registry.json`
- `tx_monitor.json`

## Step 6 — Deploy to testnet

Use your dedicated audit authority:

```bash
anchor deploy --provider.cluster testnet --provider.wallet ~/.config/solana/treasuryos-audit-testnet.json
```

Capture the command output, deployment signatures, and resulting program IDs.

## Step 7 — Record the deployed program IDs

You need a clean record of:

| Program | Testnet program ID |
| --- | --- |
| wallet-whitelist | |
| compliance-registry | |
| tx-monitor | |

Also record:

| Item | Value |
| --- | --- |
| RPC endpoint | |
| Authority public key | |
| Deploy wallet path | `~/.config/solana/treasuryos-audit-testnet.json` or your chosen path |
| Anchor version used | `0.32.1` |

## Step 8 — Export signer material for runtime use

Use the repo helper:

```bash
npm run solana:keypair:export -- ~/.config/solana/treasuryos-audit-testnet.json
```

This prints:

- `SOLANA_SIGNING_MODE=environment`
- `AUTHORITY_KEYPAIR_JSON=...`

Use that output only in the target runtime secret manager. Do **not** paste it
into source-controlled files.

## Step 9 — Prepare runtime variables for the audit environment

For the API gateway testnet environment, record:

```env
SOLANA_RPC_URL=https://api.testnet.solana.com
SOLANA_NETWORK=testnet
PROGRAM_ID_WALLET_WHITELIST=<your-testnet-wallet-whitelist-program-id>
SOLANA_SIGNING_MODE=environment
AUTHORITY_KEYPAIR_JSON=<from-export-command>
SOLANA_SYNC_ENABLED=false
SQUADS_MULTISIG_ENABLED=false
```

For the KYC service testnet environment, record:

```env
SOLANA_RPC_URL=https://api.testnet.solana.com
SOLANA_NETWORK=testnet
PROGRAM_ID_COMPLIANCE_REGISTRY=<your-testnet-compliance-registry-program-id>
```

Keep `SOLANA_SYNC_ENABLED=false` until you intentionally test live sync behavior.

## Step 10 — Capture deployment evidence

Create one operator bundle containing:

1. testnet program IDs,
2. authority public key,
3. RPC endpoint,
4. `anchor build` confirmation,
5. IDL file list from `target/idl/`,
6. deploy command output,
7. any Railway/Vercel environment values you changed.

## Step 11 — Run quick sanity checks

At minimum, confirm:

```bash
solana program show <wallet-whitelist-program-id>
solana program show <compliance-registry-program-id>
solana program show <tx-monitor-program-id>
```

If you wire the testnet values into a non-production runtime, also verify the
relevant health endpoints before enabling any live sync behavior.

## Done when

You can answer **yes** to all of these:

- The programs are deployed to testnet.
- You have all three testnet program IDs.
- You know the authority public key.
- You have the RPC endpoint and exported signer material.
- You have a clean evidence bundle ready to share.

## Tell Copilot after you finish

Send me:

- the three testnet program IDs,
- the RPC endpoint,
- the authority public key,
- and whether you changed or reused the current program IDs.

That lets me help you align the repo-side handoff materials with the real audit environment.
