# Cross-Client Setup and MCP Guide

This guide shows how to reuse the TreasuryOS agent stack across GitHub Copilot,
Copilot CLI, Claude Code, Claude Desktop, Cline, and similar MCP-capable tools.

## What syncs automatically

These repo files travel with TreasuryOS and become available everywhere the repo
is cloned or opened:

- `.github/copilot-instructions.md`
- `.github/workflows/copilot-setup-steps.yml`
- `docs/agents/*`
- `scripts/agent-stack-doctor.mjs`

That gives you a **portable operating model**. What does **not** sync
automatically is local auth or third-party secrets.

## Recommended installation order

1. clone the repo
2. run `npm ci`
3. run `npm run agent:doctor`
4. configure GitHub MCP access
5. add filesystem + git + database MCP servers
6. add optional SaaS connectors only after the core stack is stable

## Minimum secrets and tokens

| Name | Purpose | Required? |
| --- | --- | --- |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub MCP and GitHub API automation | yes |
| `READONLY_DATABASE_URL` | safe Postgres querying for analytics and ops agents | recommended |
| `OPENROUTER_API_KEY` | research and content-generation workflows outside product runtime | optional |
| `RAILWAY_TOKEN` | deploy and env automation | optional |
| `VERCEL_TOKEN` | frontend deploy automation | optional |
| `SLACK_BOT_TOKEN` | support or alerting workflows | optional |
| `NOTION_TOKEN` | documentation or business knowledge sync | optional |

Use **read-only** or narrowly scoped credentials whenever possible.

## GitHub Copilot (repo + cloud agent)

### What is already repo-owned

- `.github/copilot-instructions.md` gives Copilot persistent project context
- `.github/workflows/copilot-setup-steps.yml` prepares the cloud agent
  environment with Node 22, dependencies, and common tooling

### What you still need to do

1. Open the repository with GitHub Copilot on any signed-in device.
2. If you use the **Copilot cloud agent**, create a GitHub environment named
   `copilot` and add the secrets or vars you want available to that runtime.
3. Keep production write credentials out of the repo and out of broad default
   scopes.

## GitHub Copilot CLI

The GitHub MCP server is built into Copilot CLI and read-only tools are enabled
by default.

### Useful checks

From an active Copilot CLI session:

```text
/mcp show github-mcp-server
```

### Optional custom configuration

Copilot CLI can also read `~/.copilot/mcp-config.json`. The GitHub MCP docs use
the same `mcpServers` JSON shape that is included in:

`docs/agents/templates/treasuryos-mcp-servers.example.json`

If you want the hosted GitHub server in your local Copilot CLI config, the
minimal block is:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

## Claude Code

Claude Code supports local, project, and user-scoped MCP servers. For shared
TreasuryOS setup, **project scope** is the best fit because it can be checked
into version control as `.mcp.json`.

### Recommended approach

Copy the `mcpServers` block from:

`docs/agents/templates/treasuryos-mcp-servers.example.json`

into a project-scoped `.mcp.json`, or add servers with commands such as:

```bash
claude mcp add-json github --scope project \
  '{"type":"http","url":"https://api.githubcopilot.com/mcp/","headers":{"Authorization":"Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}"}}'
```

Claude Code also supports environment variable expansion in `.mcp.json`, so the
same template can be reused across machines if the tokens are set locally.

## Claude Desktop

Claude Desktop uses the same `mcpServers` JSON shape.

Config file locations:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\\Claude\\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Paste the `mcpServers` block from the TreasuryOS template into that file and
replace any environment placeholders if your host does not support expansion.

## Cline, OpenClaw, NemoClaw, Hermes, and other MCP-capable clients

Most modern MCP clients can consume the same logical configuration:

- **HTTP server** for hosted GitHub MCP
- **stdio server** for filesystem access
- **stdio server** for git repository access
- **stdio server** for read-only Postgres access

If the client supports a project file such as `.mcp.json`, use the TreasuryOS
template directly. If it only supports a settings UI or its own config file,
copy the same server definitions manually.

Required transport support:

- HTTP for the hosted GitHub MCP server
- stdio for local filesystem, git, and database servers

## Portable MCP template

The reusable starting point is:

`docs/agents/templates/treasuryos-mcp-servers.example.json`

It includes:

- GitHub remote MCP
- filesystem MCP
- git MCP
- read-only Postgres MCP

## Safety rules for connector setup

1. Use a **read-only** database user for analytics and support agents.
2. Keep production deploy tokens out of default prompt sessions unless the task
   genuinely needs them.
3. Prefer GitHub App or PAT scopes that are narrowly limited.
4. Separate **analysis agents** from **write-capable agents**.
5. Do not grant signer or banking credentials to general-purpose agents.

## Troubleshooting

### `agent:doctor` fails

- install Node 22+
- run `npm ci`
- add missing CLI tools (`gh`, `jq`, `uvx`, `docker`, `psql`, `sqlite3`) as needed

### GitHub MCP does not authenticate

- verify `GITHUB_PERSONAL_ACCESS_TOKEN`
- confirm the token has the scopes you actually need
- if using Docker for the local GitHub MCP server, confirm Docker is running

### Postgres MCP fails

- confirm `READONLY_DATABASE_URL` is set
- verify the account is read-only
- confirm network access from the local machine

### Client does not support project-scoped `.mcp.json`

- use the same `mcpServers` entries in that client's own MCP settings file
- keep the TreasuryOS template as the source of truth and copy from it
