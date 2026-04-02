# ADR 0004: Solana Devnet Only

## Status

Superseded by ADR 0005

## Decision

The original MVP targeted Solana devnet for wallet whitelist and related chain synchronization work.

## Rationale

- keeps pilot testing cheap and reversible
- avoids production custody and mainnet risk too early
- is enough to prove approval workflow behavior

## Consequence

This ADR is now historical. The current beta posture moves the non-mainnet Solana target to testnet while still keeping live sync disabled by default.
