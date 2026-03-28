# ADR 0003: Sumsub-Only KYC

## Status

Accepted

## Decision

Sumsub is the only KYC provider in the MVP.

## Rationale

- reduces integration work
- removes fallback orchestration complexity
- keeps webhook verification and evidence handling focused on one provider

## Consequence

Jumio remains out of scope for MVP execution and becomes Beta work if needed.
