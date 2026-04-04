# TreasuryOS Agent Operating System

## Goal

Create a reusable, business-wide agent operating layer that helps run TreasuryOS
across product, engineering, GTM, investor work, operations, and support
without weakening compliance, signer safety, or human accountability.

## What "linked to my account on any device" really means

There are two different layers:

1. **Repo-owned behavior**  
   Instructions, setup workflows, prompts, docs, and templates live in git.
   When you open TreasuryOS with GitHub Copilot on any signed-in device, those
   repo files are available automatically.
2. **Client-owned behavior**  
   MCP settings, tokens, CLI auth, and local tool installation are still tied
   to the user or machine. Those cannot be silently synced through the repo.

So the right architecture is:

- keep **policy, prompts, setup, and role design** in the repo
- keep **secrets and local connectors** outside the repo
- make both layers reusable with stable templates and docs

## Core principles

1. **Human authority stays intact**  
   No agent gets signer authority, automatic case approvals, or unrestricted
   production write access.
2. **Read-first, write-second**  
   Agents should begin with read-only data, analysis, planning, and drafting.
   Write actions should be added deliberately and only where the approval path
   is clear.
3. **Portable across clients**  
   The same role cards, prompts, and MCP templates should work in GitHub
   Copilot, Copilot CLI, Claude Code, Claude Desktop, Cline, and similar tools.
4. **Repo is the source of truth**  
   Canonical operating knowledge stays in `docs/`, `.github/`, and tracked
   scripts rather than private notes on one device.
5. **Least privilege by default**  
   Use read-only database credentials, scoped PATs, environment-specific tokens,
   and explicit approval boundaries.
6. **Management workflow stays consistent**  
   Every serious agent task follows TreasuryOS's operating loop:  
   **Plan -> Organize -> Implement -> Report -> Document -> Maintain**

## Shared context pack

Every TreasuryOS agent should start from the same source-of-truth bundle:

- `README.md`
- `docs/README.md`
- `docs/operations/README.md`
- `docs/operations/PROJECT_REPORT.md`
- `docs/operations/NEXT_ACTIONS.md`
- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/reports/PROJECT_STATUS_REPORT.md`
- `.github/copilot-instructions.md`
- `scripts/agent-stack-doctor.mjs`

## Agent layers

| Layer | Agents | Main outcome |
| --- | --- | --- |
| Executive orchestration | Chief of Staff, Knowledge Librarian | priority control, status, documentation, context hygiene |
| Revenue and market | Growth, Revenue Ops, Investor Relations | pipeline, outreach, investor packaging, CRM hygiene |
| Product and engineering | Product Manager, Engineering Delivery, QA/Release | roadmap shaping, specs, code delivery, release confidence |
| Risk and controls | Security/Compliance, Audit Coordinator | policy enforcement, external audit coordination, safety review |
| Customer operations | Support/Success, Reporting/Analytics | issue triage, customer follow-up, reporting, KPI visibility |

## Approval model

### Autonomous by default

- repo search, synthesis, planning, and reporting
- documentation drafting and reorganization
- issue triage and backlog shaping
- branch-local code changes and PR preparation
- test, typecheck, build, and validation runs
- internal analytics or read-only database queries

### Human approval required

- production secret creation or rotation
- production environment variable changes
- deploys that change customer-facing posture
- banking, legal, pricing, or contractual commitments
- mainnet posture changes
- signer usage or governance actions
- irreversible customer or data operations

## Memory and state strategy

Use three levels of memory:

1. **Repo memory** — docs, instructions, reports, ADRs, plans
2. **Tool memory** — GitHub Issues/Projects, CRM, Notion, analytics, incident tools
3. **Client memory** — temporary session-local state only; never rely on this as the only source of truth

Important rule: long-lived knowledge belongs in the repo or an approved system
of record, not only in a chat transcript.

## Standard operating loop

### 1. Plan

- clarify the goal
- inspect the current state
- define the exact lane and owner

### 2. Organize

- pick the right role agent
- attach the right connectors
- define what is read-only vs write-capable

### 3. Implement

- run the task
- keep artifacts structured
- prefer templates and reusable scripts over ad hoc chat output

### 4. Report

- summarize what changed
- capture blockers, risks, and owner follow-ups

### 5. Document

- update canonical docs and indexes
- store reusable prompts, playbooks, and configuration patterns

### 6. Maintain

- review secrets, access scopes, tool health, and workflow drift
- retire stale prompts and connectors
- add new connectors only when they fit a real operating lane

## Recommended rollout order

1. **Foundation**
   - repo-owned Copilot setup
   - shared docs
   - portable MCP template
   - `agent:doctor`
2. **Core business agents**
   - Chief of Staff
   - Product Manager
   - Engineering Delivery
   - Security/Compliance
3. **External ops agents**
   - Revenue Ops / CRM
   - Investor Relations
   - Support / Success
4. **Expanded tool layer**
   - CRM, Notion, Slack, analytics, incident, browser, and BI connectors
5. **Selective write automation**
   - only after read-side behavior and approval rules are stable

## What this foundation does today

- makes TreasuryOS agent behavior portable across devices through repo-owned
  instructions and docs
- prepares GitHub Copilot cloud agent with deterministic environment setup
- provides a reusable MCP config template for other clients
- defines role cards and governance boundaries for a full business-agent stack

## What still remains manual

- authenticating each client on each machine
- adding personal or team secrets
- choosing which optional connectors to enable
- approving production-impacting actions
