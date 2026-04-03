# Protocol Audit Guide 03 — Handoff and Kickoff

Use this guide after:

- the auditor is selected,
- scope is agreed,
- and the testnet environment exists.

## Goal

By the end of this guide, you should have:

- a complete handoff package sent to the auditor,
- a scheduled kickoff call,
- and a clear audit operating model for the engagement.

## Step 1 — Assemble the handoff package

Send the auditor one clean package with these items:

| Item | Source |
| --- | --- |
| Repo URL and target commit/branch | your Git host |
| `Anchor.toml` | repo root |
| Program source | `programs/*/src/lib.rs` |
| Cargo manifests | `programs/*/Cargo.toml` |
| IDLs | `target/idl/*.json` |
| Current roadmap/security context | `docs/operations/NEXT_ACTIONS.md`, `docs/operations/ROADMAP.md`, `docs/operations/SECURITY.md` |
| Environment references | `docs/ENVIRONMENT_VARIABLES.md`, `docs/deployment/DEPLOYMENT.md` |
| Testnet deployment facts | your operator record from Guide 02 |
| Known integration context | wallet sync active, compliance registry partial, tx-monitor not actively wired |

## Step 2 — Write the cover note

Your handoff note should answer five things immediately:

1. What TreasuryOS is.
2. What is in scope.
3. Which environments are available.
4. What is already live vs. still preview-only.
5. What you want from the audit.

### Copy/paste handoff template

```text
Subject: TreasuryOS protocol audit handoff

Hi <Firm>,

Sharing the TreasuryOS audit handoff package for kickoff.

In scope:
- wallet-whitelist
- compliance-registry
- tx-monitor

Environment posture:
- testnet environment prepared
- testnet-active operational posture
- no mainnet enablement before audit sign-off

Important integration context:
- wallet-whitelist is the most active app-layer bridge today
- compliance-registry exists, but the current sync path is still dry-run oriented
- tx-monitor exists on-chain, but is not currently wired into an active app-layer path

Attached / linked:
- repo access
- Anchor config
- program source
- Cargo manifests
- generated IDLs
- deployment facts for testnet
- supporting docs

Please confirm receipt and the kickoff agenda for our first session.

Best,
<Name>
```

## Step 3 — Schedule the kickoff call

Make sure the kickoff meeting includes:

- your technical owner,
- your product/operations owner,
- the auditor's lead reviewer,
- and anyone who will handle remediation sign-off.

## Step 4 — Run this kickoff agenda

Use this order:

1. Product and system overview.
2. Exact in-scope programs.
3. Current deployment posture and why mainnet is not yet enabled.
4. Authority model and signer handling.
5. Active integration paths vs. inactive or dry-run paths.
6. Testnet environment details.
7. Expected findings process and retest cadence.
8. Final report format and delivery expectations.

## Step 5 — Agree on the operating model

Leave the call with answers to:

| Question | Must be clear before you move on |
| --- | --- |
| Where will findings be shared? | email, portal, shared doc, issue tracker |
| How are severities defined? | critical / high / medium / low |
| Is there a retest phase? | yes / no |
| Who signs off on fixes? | named owner |
| What is the response SLA? | agreed |
| Will they review the testnet environment directly? | yes / no |

## Step 6 — Start the audit evidence log

Track at least these items:

- kickoff date,
- attendees,
- materials shared,
- findings received,
- fixes deployed,
- retest requests,
- final sign-off date.

## Step 7 — Do not lose scope control

Do **not** widen the scope casually during kickoff.

Keep these boundaries explicit unless you intentionally renegotiate them:

- no mainnet enablement during the audit,
- no surprise expansion to unrelated services,
- no assumption that preview-only paths are already production active,
- no hidden environment dependencies.

## Done when

You can answer **yes** to all of these:

- The auditor has the full package.
- Kickoff has happened or is firmly scheduled.
- The findings workflow is agreed.
- The audit is operating against a known testnet environment.

## Tell Copilot after you finish

Bring back:

- the final scope the auditor accepted,
- the kickoff date,
- any extra documents they requested,
- and whether they want repo-only review or live testnet verification too.

That is the point where I can help you prepare the next remediation and evidence cycle.
