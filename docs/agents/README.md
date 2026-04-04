# TreasuryOS Agents Index

This folder is the canonical home for the TreasuryOS agent operating system:
the reusable prompts, setup guidance, connector strategy, and management rules
for running the business and platform with AI agents safely.

## Start here

1. **[TREASURYOS_AGENT_OPERATING_SYSTEM.md](TREASURYOS_AGENT_OPERATING_SYSTEM.md)**  
   The architecture, guardrails, approval model, and how the full agent system
   fits the TreasuryOS business.
2. **[CROSS_CLIENT_SETUP_AND_MCP_GUIDE.md](CROSS_CLIENT_SETUP_AND_MCP_GUIDE.md)**  
   How to install and reuse the same agent stack in GitHub Copilot, Copilot
   CLI, Claude Code/Desktop, Cline, and other MCP-capable tools.
3. **[AGENT_ROLE_CARDS.md](AGENT_ROLE_CARDS.md)**  
   Role definitions, responsibilities, escalation rules, and reusable prompt
   starters for each TreasuryOS business agent.
4. **[MCP_TOOLKIT_AND_CONNECTORS.md](MCP_TOOLKIT_AND_CONNECTORS.md)**  
   The recommended free/open-source-first tool stack plus optional commercial
   connectors.
5. **[templates/treasuryos-mcp-servers.example.json](templates/treasuryos-mcp-servers.example.json)**  
   Reusable `mcpServers` block for project-scoped or user-scoped MCP clients.

## Repo-owned vs user-owned

### Repo-owned (portable by default)

- `.github/copilot-instructions.md`
- `.github/workflows/copilot-setup-steps.yml`
- `docs/agents/*`
- `scripts/agent-stack-doctor.mjs`

These files move with the repository, so once they are in `main`, GitHub
Copilot and any repo-aware client can reuse the same operating model on any
device where you sign in and open TreasuryOS.

### User-owned (must still be configured per user, device, or client)

- GitHub Copilot authentication
- GitHub PATs and other third-party secrets
- local or user-scoped MCP client settings
- OS-level tools such as Docker, `uvx`, database clients, and browser tooling
- final approval rules for production actions

## Quick command

Run this on any machine after cloning the repo:

```bash
npm run agent:doctor
```

It checks the core local prerequisites for the TreasuryOS agent stack and tells
you which integrations still need tokens or local tools.
