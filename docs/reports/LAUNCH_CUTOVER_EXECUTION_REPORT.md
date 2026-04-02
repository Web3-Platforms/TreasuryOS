# Launch Cutover Execution Report

## Scope

This document records the live go / no-go execution pass for the pilot launch window after the cutover-prep automation fixes were pushed to `main`.

## Release commit

- Active release commit: `a0d388a` (`fix: stabilize uptime monitoring`)

## Automated go / no-go result

The automated launch gates are green on the release commit.

### GitHub automation

- `TreasuryOS CI` run `#148` on `a0d388a`: `success`
- `TreasuryOS CD` run `#98` on `a0d388a`: `success`
- `TreasuryOS Uptime` run `#14` on `a0d388a`: `success`

### Public endpoint checks

The public launch surfaces responded correctly during the live cutover pass:

- `https://treasuryos.aicustombot.net`
  - `HTTP 307`
  - redirects to `/login?callbackUrl=%2F`
- `https://treasuryos.aicustombot.net/login`
  - `HTTP 200`
- `https://api.treasuryos.aicustombot.net/api/health`
  - returned JSON with `"status":"ok"`
- `https://www.treasuryos.xyz`
  - `HTTP 200`

## Operational notes

- GitHub synthetic uptime now uses the public Vercel alias documented in `docs/LAUNCH_CUTOVER_RUNBOOK.md` because Cloudflare challenges GitHub-hosted runners on the branded dashboard domain.
- The branded dashboard custom domain still passed the manual `curl` checks during this cutover pass.
- Reporter recovery remains documented in `docs/reports/REPORTER_RAILWAY_CHECK_REPORT.md`; the public launch gate in this cutover window is driven primarily by the dashboard, branded API, landing page, and GitHub automation state.

## Remaining manual confirmation

The required manual operator confirmation was completed during the live cutover check:

- dashboard login succeeded
- at least one authenticated route succeeded

## Current decision state

Technical go confirmed.

The pilot launch cutover passed the manual authenticated-path confirmation and is ready for external announcement / post-launch monitoring.
