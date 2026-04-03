# TreasuryOS Documentation Index

TreasuryOS documentation is now organized by function so product, engineering,
operations, and audit work have a clear source of truth.

## Start here

1. **[Project status report](reports/PROJECT_STATUS_REPORT.md)** — the current
   platform posture, shipped scope, and live-state summary.
2. **[Operations index](operations/README.md)** — roadmap, next actions, launch
   readiness, project report, and security guidance.
3. **[Operator guides](guides/README.md)** — step-by-step manual work for AI
   rollout and external audit preparation.
4. **[Environment variables](ENVIRONMENT_VARIABLES.md)** — the runtime
   configuration reference for every service.
5. **[Reports index](reports/README.md)** — implementation, rollout, and
   validation records.
6. **[Comprehensive report](reports/COMPREHENSIVE_REPORT.md)** — the broad MVP
   and platform narrative.

## Current highlights

- OpenRouter is the live production AI provider for transaction-case advisories.
- The latest repo dashboard AI advisory panel uses explicit
  **Generate AI Analysis** / **Regenerate AI Analysis** actions instead of
  auto-running on page load.
- External protocol audit preparation guides are ready in `docs/guides/`.

## Folder map

| Folder | Purpose | Recommended entry points |
| --- | --- | --- |
| `architecture/` | System structure, technical design, and architecture narratives | [`architecture/README.md`](architecture/README.md), [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) |
| `deployment/` | Deployment posture, runtime setup, cutover, and environment docs | [`deployment/README.md`](deployment/README.md), [`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md) |
| `operations/` | Living project-management and operational source-of-truth docs | [`operations/README.md`](operations/README.md) |
| `guides/` | Manual operator workflows that cannot be completed purely in code | [`guides/README.md`](guides/README.md) |
| `reports/` | Implementation, validation, and release reports | [`reports/README.md`](reports/README.md) |
| `plans/` | Delivery plans, Jira import material, and forward-looking implementation plans | [`plans/REAL_LLM_INTEGRATION_PLAN.md`](plans/REAL_LLM_INTEGRATION_PLAN.md) |
| `thoughts/` | Strategic brainstorming and growth recommendations | [`thoughts/brainstorm.md`](thoughts/brainstorm.md) |
| `history/` | Archived execution notes and historical materials | browse when historical context is needed |
| `issues/` | Issue-specific investigations and closure notes | browse by incident or fix |
| `tasks-guide/` | Task-oriented working docs and local operating notes | [`tasks-guide/README.md`](tasks-guide/README.md) |

## Compatibility note

Several long-lived root markdown files now point into these canonical folders so
older references continue to work while the team uses `docs/` as the primary
home for project knowledge.
