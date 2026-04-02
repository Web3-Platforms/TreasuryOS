# Launch Cutover Runbook

## Purpose

TreasuryOS is technically launch-ready for the scoped pilot release. The remaining work is the monitored go/no-go window: freeze deploys, confirm live health one more time, announce only after the checks hold, and watch the platform closely after cutover.

This runbook is the operational guide for that release window.

## Current ready state

- Dashboard custom domain is live at `https://treasuryos.aicustombot.net`
- API custom domain is live at `https://api.treasuryos.aicustombot.net/api/health`
- Landing page is live at `https://www.treasuryos.xyz`
- Reporter service is healthy again on Railway
- The validated local baseline is:
  - `npm run typecheck`
  - `npm test`
  - `API_BASE_URL=http://localhost:3001/api npm run build`
- The live smoke pass is green on the branded dashboard and branded API paths
- Beta scope remains intentionally limited:
  - KYC stays disabled
  - `SOLANA_SYNC_ENABLED=false`
  - Solana stays preview-only, with testnet as the selected beta cluster if sync is enabled later

## Automation fixes included before cutover

Three release-safety workflow fixes were made during cutover prep:

1. `.github/workflows/ci.yml` now supplies `API_BASE_URL=http://localhost:3001/api` so the dashboard build no longer fails in CI while collecting route config.
2. `.github/workflows/uptime.yml` now checks the branded API custom domain instead of the older direct Railway fallback URL.
3. GitHub-hosted runners are challenged by Cloudflare on the branded dashboard custom domain, so the synthetic GitHub uptime check uses the public Vercel alias `https://treasury-os-five.vercel.app` for dashboard availability while the manual cutover gate still checks `https://treasuryos.aicustombot.net`.

These changes are now on `main`, so GitHub reflects the corrected automation state.

## Go / no-go checklist

Do not announce launch until every item below is true.

- No one is actively pushing new commits to `main`
- Latest intended release commit is deployed
- `https://treasuryos.aicustombot.net/login` returns the login page
- `https://api.treasuryos.aicustombot.net/api/health` returns JSON with `"status":"ok"`
- `https://www.treasuryos.xyz` returns `200`
- GitHub Actions `TreasuryOS CD` is green for the release commit
- GitHub Actions `TreasuryOS CI` is green for the release commit
- Railway API and reporter services show healthy runtime state
- The operator can log in with the expected pilot credentials
- No scope change was made during cutover:
  - KYC still disabled
  - Solana sync still disabled
  - No mainnet assumptions in launch messaging

## Cutover sequence

1. Freeze deploys.
   - Do not merge or push anything new during the release window unless it is a rollback or launch-critical fix.

2. Re-run the public checks.
   - Dashboard login: `curl -I https://treasuryos.aicustombot.net`
   - API health: `curl https://api.treasuryos.aicustombot.net/api/health`
   - Landing page: `curl -I https://www.treasuryos.xyz`

3. Confirm GitHub automation state.
   - `TreasuryOS CD` green on the release commit
   - `TreasuryOS CI` green on the release commit
   - `TreasuryOS Uptime` green on its next run or manually re-triggered after the workflow fix lands
   - Manual branded-domain checks on `https://treasuryos.aicustombot.net` still pass, because GitHub synthetic uptime uses the Vercel alias rather than the Cloudflare-protected custom domain

4. Perform a final operator smoke path.
   - Load the dashboard login page
   - Sign in
   - Open entities
   - Open reports
   - Download a report through the dashboard route if sample data exists

5. Declare go / no-go.
   - If all checks are green, proceed with the pilot launch announcement.
   - If any customer-facing route, auth path, or API health check fails, do not announce.

6. Monitor immediately after announcement.
   - Watch the first post-cutover period closely before making any broader launch claims.

## Live monitoring targets

- Dashboard: `https://treasuryos.aicustombot.net/login`
- GitHub synthetic dashboard target: `https://treasury-os-five.vercel.app/login`
- API health: `https://api.treasuryos.aicustombot.net/api/health`
- Landing page: `https://www.treasuryos.xyz`
- GitHub Actions:
  - `TreasuryOS CI`
  - `TreasuryOS CD`
  - `TreasuryOS Uptime`
- Railway services:
  - `@treasuryos/api-gateway`
  - `@treasuryos/reporter`
- Vercel projects:
  - `treasury-os`
  - `landing-page`

## Rollback triggers

Pause the cutover or roll back if any of the following happens:

- Dashboard login page stops loading
- Authenticated dashboard routes stop working
- API health stops returning `"status":"ok"`
- Custom domains break or begin serving the wrong surface
- GitHub CD deploys the wrong target
- A release-critical service enters a restart loop

## Rollback actions

1. Stop announcement and treat the release window as failed.
2. Revert to the last known good commit and redeploy through the normal GitHub CD path.
3. If the API custom domain is the only broken surface, temporarily point dashboard traffic back to the direct Railway API URL by restoring the prior Vercel `API_BASE_URL` fallback, then investigate the branded domain separately.
4. If reporter is the only failing surface, do not claim automated reporting is healthy until the reporter service is recovered.

## Post-cutover confirmation

After the launch announcement:

- Recheck dashboard login and one authenticated route
- Recheck branded API health
- Recheck landing-page `200`
- Watch the next uptime run
- Confirm no emergency issue was opened by the uptime workflow

## Scope guardrails during launch

The launch remains a controlled pilot. Do not widen scope during the cutover window.

- Keep Sumsub disabled
- Keep `SOLANA_SYNC_ENABLED=false`
- Do not switch Solana to mainnet
- Do not announce features that depend on live KYC or live on-chain sync
