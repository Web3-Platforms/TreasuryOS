# MCP Toolkit and Connectors

This is the recommended TreasuryOS connector stack, with a bias toward
free/open-source or open-standard building blocks first.

## Minimum viable stack

| Tool | Type | Cost posture | Why it matters for TreasuryOS |
| --- | --- | --- | --- |
| GitHub MCP server | MCP | free/open | repo search, issues, PRs, Actions, release visibility |
| Filesystem MCP | MCP | free/open | local repo access and controlled file operations |
| Git MCP | MCP | free/open | structured git status, diffs, commits, and history |
| `@bytebase/dbhub` / Postgres MCP | MCP | free/open | read-only business and platform analytics |
| `gh` CLI | CLI | free/open | GitHub automation fallback when MCP is unavailable |
| `curl` + `jq` | CLI | free/open | generic API automation and debugging |
| Docker | runtime | free/open | local MCP servers and portable tooling |
| `uvx` | runtime | free/open | lightweight Python MCP servers like `mcp-server-git` |

## Strongly recommended open-source expansion layer

| Tool | Connect via | Cost posture | Best use |
| --- | --- | --- | --- |
| Ollama | CLI / API | free/open | local model inference for private drafting or RAG |
| Qdrant | API | free/open | vector memory / semantic retrieval |
| PostHog | API / JS | open-core | product analytics, funnel and activation tracking |
| Langfuse | API | open-core | prompt tracing, LLM observability, evaluation |
| n8n | API / webhooks | open-source | workflow automation, scheduled jobs, alerts |
| Activepieces | API / webhooks | open-source | lighter business automation alternative |
| Airbyte | API | open-source | sync business data into analytics stores |
| Metabase or Apache Superset | API / UI | open-source | internal BI and dashboards |
| Playwright | CLI / code | open-source | browser testing and website monitoring |
| DuckDB / SQLite | CLI | open-source | local analytics, agent scratchpads, report assembly |

## Useful commercial or hybrid connectors

| Tool | Connect via | Why you may want it |
| --- | --- | --- |
| Notion | MCP / API | internal wiki, investor notes, meeting memory |
| Slack | MCP / API | support triage, alerts, internal coordination |
| Linear or Jira | MCP / API | engineering and product issue tracking |
| HubSpot | API | CRM, revenue ops, lead management |
| Sentry | MCP / API | runtime issue triage |
| Railway | CLI / API | deploy and environment automation |
| Vercel | CLI / API | frontend deployment and environment automation |
| Supabase | CLI / API | auth, storage, or edge workflow operations |
| OpenRouter | API | research and content-generation agents |

## Connector-to-agent map

| Agent | High-value connectors |
| --- | --- |
| Chief of Staff | GitHub, Notion, Linear/Jira, PostHog |
| Knowledge Librarian | GitHub, filesystem, Notion |
| Product Manager | GitHub, Linear/Jira, PostHog, support sources |
| Engineering Delivery | GitHub, filesystem, git, Postgres, Sentry |
| QA / Release | GitHub Actions, Sentry, Playwright, Railway, Vercel |
| Security / Compliance | GitHub, env docs, audit docs, read-only Postgres |
| Revenue Ops / CRM | HubSpot, email tools, Postgres, landing-page leads |
| Growth / Marketing | website repo, analytics, CMS, design tools |
| Investor Relations | docs/investors, deck tooling, metrics store |
| Support / Success | support inbox/chat, CRM, analytics, docs |
| Reporting / Analytics | Postgres, DuckDB, PostHog, Metabase/Superset |

## Recommended rollout phases

### Phase 1 — Core repo and data

- GitHub MCP
- filesystem MCP
- git MCP
- read-only Postgres access
- `gh`, `curl`, `jq`, Docker, `uvx`

### Phase 2 — Platform and release

- Railway
- Vercel
- GitHub Actions
- Sentry
- Playwright

### Phase 3 — Business operations

- CRM
- Slack
- Notion
- investor tooling
- funnel analytics

### Phase 4 — Advanced automation

- workflow orchestrators (`n8n`, `Activepieces`, `Temporal`)
- local/private model layer (`Ollama`)
- vector memory (`Qdrant`)
- prompt observability (`Langfuse`)

## Guardrails

1. Prefer open standards and exportable data.
2. Keep the database connector read-only unless a workflow absolutely requires writes.
3. Use separate tokens for human users, deploy bots, and agent automation.
4. Start with visibility and analysis; add write automation only after the workflow is trusted.
5. Never give generic agents signer authority or unrestricted financial access.
