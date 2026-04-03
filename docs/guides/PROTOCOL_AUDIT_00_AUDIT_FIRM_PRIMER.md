# Protocol Audit Guide 00 — Audit Firm Primer

Read this guide **before** you start contacting audit firms.

Its job is to help you understand:

- what an audit firm is,
- why TreasuryOS needs one,
- what a good firm must be able to do,
- what you must prepare before they can work effectively,
- and how to work with them like a real delivery team.

## What is an audit firm?

A **protocol audit firm** is an external security team that reviews smart
contract code and the way that code is intended to be used.

For TreasuryOS, that means reviewing the Solana / Anchor programs in:

- `programs/wallet-whitelist`
- `programs/compliance-registry`
- `programs/tx-monitor`

Their job is to look for things your internal team may miss, including:

- broken authority checks,
- unsafe PDA/account assumptions,
- missing validation,
- bad state transitions,
- upgrade or signer risks,
- and logic bugs that could become security incidents later.

## What an audit firm is **not**

An audit firm is **not**:

- a guarantee that the code is perfect,
- a replacement for your own testing and engineering review,
- a substitute for operational security,
- or a one-time excuse to stop maintaining security after launch.

An audit reduces risk. It does not erase risk.

## Why TreasuryOS needs an audit firm

TreasuryOS is not a toy app. It is positioning itself as an
institutional-grade treasury and compliance platform.

That makes external review important for five reasons:

1. **Smart contracts are high-consequence code.**
   If the permission model or state logic is wrong, the failure can become
   permanent, expensive, or reputation-damaging.

2. **The current programs control sensitive business rules.**
   Even though the launch posture is still preview-first, the code is clearly
   intended to support:
   - wallet permissioning,
   - compliance state,
   - transaction review decisions.

3. **TreasuryOS wants institutional trust.**
   External audit evidence helps with customers, partners, investors, and
   internal go/no-go decisions.

4. **Mainnet should not depend on self-confidence alone.**
   The repo already treats the protocol audit as the remaining external Phase 1
   blocker. That is the correct posture.

5. **Audit results improve engineering quality even before launch.**
   A good audit gives you:
   - findings,
   - design feedback,
   - clearer threat assumptions,
   - and a stronger remediation roadmap.

## What a good audit firm should understand for TreasuryOS

Not every security firm is a good fit.

For TreasuryOS, a good firm should be strong in:

- **Solana and Anchor**, not only EVM
- PDA/account constraint review
- signer / authority model analysis
- state-machine review
- operational deployment context
- retest / remediation support

### Specifically for TreasuryOS, they should be able to reason about:

- single-authority mutation patterns
- wallet whitelist activation/deactivation logic
- compliance status transitions
- transaction review status transitions
- preview mode vs. live mode
- future multisig / Squads governance posture

## What they will usually ask from you

A serious audit firm will usually ask for:

| Item | Why they need it |
| --- | --- |
| Repo access or source archive | To review the actual code |
| Scope definition | To know what they are and are not responsible for |
| Build instructions | To reproduce artifacts and validate assumptions |
| Testnet environment or deployment facts | To verify behavior in a real environment |
| Known constraints / assumptions | To avoid auditing the wrong mental model |
| Timeline and target launch posture | To prioritize the work correctly |

If a firm does not ask basic scope and environment questions, that is a bad sign.

## What you must have ready before the audit is useful

You do **not** need perfection before outreach, but you do need enough
structure that the auditor can work efficiently.

For TreasuryOS, that means:

1. Clear in-scope programs.
2. A clear launch posture:
   - preview-first today,
   - no mainnet enablement before audit sign-off.
3. Buildable code and generated IDLs.
4. Testnet deployment plan or actual testnet deployment.
5. A named owner on your side for technical questions and remediation.

## What “requirements” matter when choosing a firm

Use these as your minimum selection requirements.

### Required

- Demonstrated **Solana / Anchor** audit experience
- Ability to review **permission and authority models**
- Ability to review **PDA seeds, account constraints, and state transitions**
- Written report with **severity levels**
- Willingness to support a **retest** or verification pass

### Strongly preferred

- Experience with financial, compliance, or institutional systems
- Clear communication and predictable process
- Ability to review a testnet environment if needed
- Willingness to separate **code findings** from **operational findings**

### Nice to have

- Public examples of prior Solana audits
- Strong reputation in the Solana ecosystem
- Fast turnaround without sacrificing depth

## How to work with an audit firm

Think of the audit as a project with four stages.

### Stage 1 — Selection

You choose the firm, align scope, and close legal/commercial steps.

### Stage 2 — Handoff

You give them:

- code,
- scope,
- environment details,
- and business context.

### Stage 3 — Review

They review the code, ask questions, and deliver findings.

Your job here is to:

- answer clearly,
- avoid scope drift,
- keep a record of decisions,
- and make sure the findings map to the real system.

### Stage 4 — Remediation and retest

You fix issues, redeploy where needed, and ask them to verify the fixes.

This stage matters as much as the initial report.

## How to be a good client during the audit

Do these things:

- answer questions quickly,
- give one source of truth for scope,
- track findings clearly,
- do not hide known limitations,
- and do not widen scope casually mid-audit.

Do **not** do these things:

- do not pretend preview-only code is already production-active,
- do not change the environment without telling the auditor,
- do not push undocumented scope changes during the engagement,
- do not treat the report as a marketing artifact only.

## Red flags when choosing a firm

Be careful if a firm:

- cannot show strong Solana / Anchor experience,
- treats all chains as basically the same,
- gives vague deliverables,
- has no retest process,
- cannot explain how they grade severity,
- or seems uninterested in deployment and authority context.

## What success looks like

A successful audit engagement ends with:

- a clear written report,
- findings with severities,
- agreed remediation work,
- a retest or fix verification pass,
- and a stronger basis for mainnet and institutional trust.

For TreasuryOS specifically, success means:

- the three in-scope programs have been externally reviewed,
- authority and state assumptions were examined,
- the testnet environment is understood,
- and the team can make go/no-go decisions with outside evidence.

## Where to go next

After this primer:

1. Read **[PROTOCOL_AUDIT_01_AUDITOR_ENGAGEMENT.md](PROTOCOL_AUDIT_01_AUDITOR_ENGAGEMENT.md)**
2. Then follow **[PROTOCOL_AUDIT_02_TESTNET_ENVIRONMENT_SETUP.md](PROTOCOL_AUDIT_02_TESTNET_ENVIRONMENT_SETUP.md)**
3. Finish with **[PROTOCOL_AUDIT_03_HANDOFF_AND_KICKOFF.md](PROTOCOL_AUDIT_03_HANDOFF_AND_KICKOFF.md)**

## Simple one-paragraph version

An audit firm is an outside security team that reviews TreasuryOS's smart
contracts and their real-world usage assumptions so the team does not rely only
on its own judgment before moving toward live on-chain operation. You need one
because TreasuryOS is building institutional-grade Solana infrastructure, and a
good audit helps catch authority, PDA, validation, and state-transition risks
before they become production problems. Choose a firm with real Solana/Anchor
experience, give them clean scope and environment information, work with them
openly during findings and remediation, and treat the audit as an engineering
delivery process rather than just a box-check.
