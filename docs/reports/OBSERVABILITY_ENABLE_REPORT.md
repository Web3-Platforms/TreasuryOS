# Observability Enable Report

Task:
- `launch-observability-enable`

What was done:
- Audited the current observability wiring across the API gateway, dashboard, Railway, Vercel, and local Sentry access.
- Confirmed that both application surfaces already include Sentry integration code:
  - API: `apps/api-gateway/src/main.ts`
  - Dashboard: `apps/dashboard/sentry.client.config.ts`, `apps/dashboard/sentry.server.config.ts`, and `apps/dashboard/sentry.edge.config.ts`
- Confirmed that Vercel production does not currently have `SENTRY_DSN` or `NEXT_PUBLIC_SENTRY_DSN`.
- Confirmed that Railway production does not currently have `SENTRY_DSN`.
- Added scheduled uptime monitoring in `.github/workflows/uptime.yml`.

What the new uptime workflow does:
- Runs every 15 minutes and on manual dispatch.
- Verifies that `https://treasuryos.aicustombot.net` redirects to the login flow and that the login page renders.
- Verifies that `https://treasuryosapi-gateway-production.up.railway.app/api/health` returns a healthy API response.
- Opens or updates a GitHub issue if an uptime check fails.

What was discovered:
- Local `sentry-cli` authentication exists, but the authenticated Sentry account currently has no organizations or projects available through the API.
- Because of that, there is no DSN to provision into Railway or Vercel yet.

Launch-time logging workflow:
- Railway service logs are the active API runtime log source for launch.
- Vercel deployment/runtime logs are the active dashboard log source for launch.
- A centralized log drain is not configured yet, but the launch-time operator workflow is at least defined and available today.

Current blocker:
- To finish runtime Sentry capture, Sentry needs an organization/project setup that can provide:
  - one DSN for the API gateway (`SENTRY_DSN` in Railway)
  - one DSN for the dashboard (`SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in Vercel)

Status:
- Blocked on Sentry organization/project provisioning
