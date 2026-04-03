# Protocol Audit Guide 01 — Auditor Engagement

Use this guide to handle the **manual external work** required to choose and
engage the audit firm.

If you want the plain-language overview first, read
**[PROTOCOL_AUDIT_00_AUDIT_FIRM_PRIMER.md](PROTOCOL_AUDIT_00_AUDIT_FIRM_PRIMER.md)**
before using this guide.

## Goal

By the end of this guide, you should have:

- a chosen audit firm,
- a confirmed audit scope,
- a target kickoff date,
- and the legal/commercial process moving.

## Step 1 — Decide the audit scope before outreach

Choose one of these scopes:

1. **Programs only** — audit the three Anchor programs as isolated smart contracts.
2. **Programs + integration context** — audit the programs plus the wallet/KYC
   integration assumptions around them.

**Recommended current scope:** **Programs + integration context**.

That keeps the auditor focused on the on-chain code while still giving them the
real operational context:

- wallet whitelist is actively bridged by the API gateway,
- compliance-registry exists but the current KYC sync path is still `dryRun`,
- tx-monitor exists but is not currently wired into an active app path.

## Step 2 — Prepare your minimum outreach facts

Have these ready before you contact firms:

| Item                    | What to prepare                                                         |
| ----------------------- | ----------------------------------------------------------------------- |
| Code scope              | Three Anchor programs in `programs/`                                    |
| Framework               | Anchor `0.32.1`                                                         |
| Launch posture          | Preview-first, no mainnet enablement before audit sign-off              |
| Expected deliverable    | Written audit report with severity ratings and remediation verification |
| Environment expectation | Testnet deployment access for verification                              |
| Timeline target         | Your desired kickoff week and report window                             |

## Step 3 — Build a short list of audit firms

Create a list of 3-5 firms and compare them on:

- Solana / Anchor experience
- institutional or treasury-compliance experience
- turnaround time
- remediation/retest policy
- cost
- communication quality

If a firm mainly audits EVM and cannot show strong Solana/Anchor experience,
drop them from the short list.

## Step 4 — Send the first outreach

Send one concise note to each firm with:

- who you are,
- what TreasuryOS is,
- what is in scope,
- when you want to start,
- whether you want a quote for programs only or programs + integration context.

### Copy/paste outreach template

```text
Subject: TreasuryOS Solana / Anchor protocol audit request

Hi <Firm>,

We are preparing an external protocol audit for TreasuryOS, an institutional
treasury and compliance platform on Solana.

Current audit scope:
- 3 Anchor programs
- wallet-whitelist
- compliance-registry
- tx-monitor

Preferred scope:
- smart contract review
- permission / authority model review
- account constraint and PDA review
- state transition review
- optional integration-context review for the wallet / KYC bridge around the programs

Current posture:
- preview-first launch posture
- no mainnet enablement before audit sign-off
- testnet deployment will be prepared for the audit

Please let us know:
- your availability,
- whether this scope fits your team,
- expected timeline,
- pricing model,
- and what materials you need for kickoff.

Best,
<Name>
```

## Step 5 — Run the comparison

Score each firm on:

| Category | Questions |
| --- | --- |
| Solana depth | Do they regularly audit Anchor programs? |
| Scope fit | Will they review PDA seeds, signer model, and state transitions? |
| Process | Do they provide kickoff, findings review, retest, and final sign-off? |
| Evidence | Can they share anonymized examples or public Solana audits? |
| Timing | Can they start when you need them? |
| Budget | Is the quote realistic for your timeline and scope? |

## Step 6 — Lock scope in writing

Before you say yes, confirm these points explicitly:

1. Exact in-scope programs.
2. Whether integration context is included.
3. Whether testnet verification is included.
4. Whether one retest round is included.
5. Final report format and ownership.
6. Communication cadence during the audit.

## Step 7 — Complete the legal/commercial steps

You likely need some combination of:

- NDA
- MSA
- SOW / proposal
- vendor onboarding / payment setup

Do not schedule kickoff until the firm confirms they are ready to begin once
materials are shared.

## Step 8 — Capture the result in one place

Create and keep this operator record:

| Field | Value to fill |
| --- | --- |
| Selected firm | |
| Primary contact | |
| Backup contact | |
| Scope | |
| Kickoff date | |
| Retest included | yes / no |
| Final report due target | |
| NDA signed | yes / no |
| SOW signed | yes / no |

## Done when

You can answer **yes** to all of these:

- A firm is selected.
- Scope is agreed in writing.
- Commercial/legal steps are underway or complete.
- A kickoff target date exists.

## Tell Copilot after you finish

When this guide is done, come back with:

- selected firm,
- agreed scope,
- kickoff target,
- and any constraints the auditor gave you.

That is enough for me to help you shape the handoff pack around the real engagement.
