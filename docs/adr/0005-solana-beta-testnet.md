# ADR 0005: Solana Beta on Testnet

## Status

Accepted

## Decision

The beta launch keeps Solana off mainnet and uses testnet as the designated cluster when the on-chain path is resumed.

## Rationale

- keeps the beta path reversible and isolated from production funds
- preserves realistic RPC, signer, and explorer workflows without mainnet custody risk
- aligns better with a public beta story than the older devnet-only posture

## Consequence

- `SOLANA_SYNC_ENABLED` stays `false` at launch until the testnet signer and program IDs are ready
- Railway and any auxiliary services should use `SOLANA_NETWORK=testnet` alongside a testnet RPC URL before live sync is enabled
- Mainnet program deployment, custody controls, and HSM/KMS signer hardening remain post-beta work
