# TreasuryOS Operator Guides

This folder contains the **manual, user-owned** guides for TreasuryOS work that
cannot be completed automatically from inside the repository.

## Start here

1. **[AI_ADVISORY_01_ENABLEMENT_AND_OPERATION.md](AI_ADVISORY_01_ENABLEMENT_AND_OPERATION.md)**
   Enable the AI advisory slice safely in deterministic or real-provider mode,
   verify it in the product, and know when to roll it back.
2. **[AI_ADVISORY_02_REAL_LLM_PROVIDER_SETUP.md](AI_ADVISORY_02_REAL_LLM_PROVIDER_SETUP.md)**
   Complete the manual provider, security, and secret-management work needed
   to activate the shipped OpenAI-compatible or OpenRouter provider path.
3. **[PROTOCOL_AUDIT_00_AUDIT_FIRM_PRIMER.md](PROTOCOL_AUDIT_00_AUDIT_FIRM_PRIMER.md)**
   Understand what audit firms are, why TreasuryOS needs one, what requirements
   matter, and how to work with them well.
4. **[PROTOCOL_AUDIT_01_AUDITOR_ENGAGEMENT.md](PROTOCOL_AUDIT_01_AUDITOR_ENGAGEMENT.md)**
   Choose the audit firm, align scope, and close the commercial/legal setup.
5. **[PROTOCOL_AUDIT_02_TESTNET_ENVIRONMENT_SETUP.md](PROTOCOL_AUDIT_02_TESTNET_ENVIRONMENT_SETUP.md)**
   Prepare the testnet audit environment, signer, deployment evidence, and
   runtime variables.
6. **[PROTOCOL_AUDIT_03_HANDOFF_AND_KICKOFF.md](PROTOCOL_AUDIT_03_HANDOFF_AND_KICKOFF.md)**
   Package the materials, hand them to the auditor, and run the kickoff.

## What these guides assume

- The repo-side protocol audit kickoff has already been started.
- The first AI advisory slice is now implemented behind `AI_ADVISORY_ENABLED`.
- The current on-chain scope is:
  - `programs/wallet-whitelist`
  - `programs/compliance-registry`
  - `programs/tx-monitor`
- The current live app posture is testnet-only:
  - direct wallet sync is currently enabled on Solana testnet
  - mainnet is out of scope before audit sign-off

## Supporting repo references

- `Anchor.toml`
- `docs/operations/ROADMAP.md`
- `docs/operations/NEXT_ACTIONS.md`
- `docs/operations/SECURITY.md`
- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/reports/AI_ADVISORY_FOUNDATION_REPORT.md`
- `docs/deployment/DEPLOYMENT.md`
- `target/idl/*.json`
