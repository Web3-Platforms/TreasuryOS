# TreasuryOS — Security Guide

This document covers credential management, secret rotation, CI/CD best
practices, and the security checklist that must be completed before any
production deployment.

---

## Table of Contents

1. [Credential Inventory](#credential-inventory)
2. [Credential Rotation Procedures](#credential-rotation-procedures)
3. [Environment Variable Best Practices](#environment-variable-best-practices)
4. [Secrets in CI/CD](#secrets-in-cicd)
5. [Pre-Production Security Checklist](#pre-production-security-checklist)
6. [Incident Response](#incident-response)

---

## Credential Inventory

The following secrets are required to run TreasuryOS in production. Each must
be stored exclusively in the platform's secret manager (Railway Variables or
Vercel Environment Variables) — never in source code or `.env` files committed
to git.

| Secret | Platform | Rotation Frequency | Owner |
|---|---|---|---|
| `AUTH_TOKEN_SECRET` | Railway | 90 days | Engineering |
| `DATABASE_URL` (password component) | Railway | 90 days | Engineering |
| `REDIS_URL` / `UPSTASH_REDIS_REST_TOKEN` | Railway | 90 days | Engineering |
| `DEFAULT_ADMIN_PASSWORD` | Railway | 30 days | Operations |
| `DEFAULT_COMPLIANCE_PASSWORD` | Railway | 30 days | Operations |
| `DEFAULT_AUDITOR_PASSWORD` | Railway | 30 days | Operations |
| `SUMSUB_APP_TOKEN` | Railway | Per SumSub policy | Compliance |
| `SUMSUB_SECRET_KEY` | Railway | Per SumSub policy | Compliance |
| `SUMSUB_WEBHOOK_SECRET` | Railway | On suspicion of compromise | Compliance |
| `SUPABASE_SERVICE_KEY` | Railway | 90 days | Engineering |
| `SUPABASE_JWT_SECRET` | Railway | 90 days | Engineering |
| `AUTHORITY_KEYPAIR_JSON` | Railway | On signer rotation | Engineering |

---

## Credential Rotation Procedures

### `AUTH_TOKEN_SECRET`

Rotating this secret invalidates **all active user sessions** immediately.
Schedule rotation during a low-traffic window and notify users in advance.

```bash
# 1. Generate a new secret
openssl rand -hex 32

# 2. Update the variable in Railway
#    Railway → Service → Variables → AUTH_TOKEN_SECRET → Edit

# 3. Trigger a redeploy (Railway redeploys automatically on variable change)

# 4. Verify the service is healthy
curl https://api.treasuryos.aicustombot.net/api/health
```

### Database Password (Neon)

```bash
# 1. Go to Neon Console → Project → Settings → Reset password
# 2. Copy the new connection string (pooled)
# 3. Update DATABASE_URL in Railway
# 4. Railway redeploys automatically
# 5. Verify connectivity via the health check endpoint
```

### Upstash Redis Token

```bash
# 1. Go to Upstash Console → Database → Reset password / Rotate token
# 2. Update REDIS_URL and/or UPSTASH_REDIS_REST_TOKEN in Railway
# 3. Railway redeploys automatically
```

### SumSub Credentials

```bash
# 1. Go to SumSub Dashboard → Developers → App Tokens → Regenerate
# 2. Update SUMSUB_APP_TOKEN and SUMSUB_SECRET_KEY in Railway
# 3. For webhook secret: SumSub Dashboard → Webhooks → Regenerate secret
# 4. Update SUMSUB_WEBHOOK_SECRET in Railway
# 5. Railway redeploys automatically
# 6. Test a webhook delivery from the SumSub Dashboard to confirm
```

### Supabase Service Key

```bash
# 1. Go to Supabase Dashboard → Settings → API → Regenerate service_role key
# 2. Update SUPABASE_SERVICE_KEY in Railway
# 3. Update SUPABASE_JWT_SECRET if the JWT secret was also rotated
# 4. Railway redeploys automatically
```

### Seed User Passwords

Seed user credentials are sourced from the Railway `DEFAULT_*_PASSWORD`
variables. By default, the API can auto-upsert them on the first login request
handled by a fresh process. Hardened environments can disable that implicit
behavior with `SEED_DEFAULT_USERS=false` and use `npm run seed:users` as an
intentional bootstrap step instead.

Recommended production procedure:

1. Generate new strong passwords and store them only in the approved secret
   manager.
2. Update `DEFAULT_ADMIN_PASSWORD`, `DEFAULT_COMPLIANCE_PASSWORD`, and
   `DEFAULT_AUDITOR_PASSWORD` in Railway.
3. If `SEED_DEFAULT_USERS=false` is set, run `npm run seed:users` against the
   target environment after the variable update. Otherwise, trigger or confirm a
   fresh Railway deployment for the API service so the next login can refresh
   the stored hashes.
4. Verify the new credentials by performing a real login against the live API.
5. If the login still uses stale hashes after redeploy or manual bootstrap,
   manually sync the `app_users` password hashes with the same `scrypt`
   algorithm used by the API before declaring the rotation complete.

Do not assume that updating the Railway variables alone is sufficient.

---

## Environment Variable Best Practices

### Never commit secrets to git

The `.env` file is listed in `.gitignore`. Never remove it from `.gitignore`
and never commit a `.env` file with real values. The `.env.example` file in
this repository contains only placeholder values — keep it that way.

If you accidentally commit a secret, treat it as compromised immediately and
rotate it. Removing it from git history is not sufficient — assume it has
already been read.

### Use platform secret managers

| Platform | Where to store secrets |
|---|---|
| Railway | Service → Variables |
| Vercel | Project → Settings → Environment Variables |
| GitHub Actions | Repository → Settings → Secrets and variables → Actions |
| Local development | `.env` file (gitignored) |

### Separate secrets per environment

Never share secrets between development, staging, and production. Each
environment must have its own:

- Database with its own credentials
- Redis instance with its own token
- `AUTH_TOKEN_SECRET` value
- SumSub sandbox vs. production tokens

### Principle of least privilege

- The `SUPABASE_SERVICE_KEY` (service_role) bypasses Row Level Security. Use
  it only in the API Gateway — never in the frontend or any client-side code.
- Database users should have only the permissions they need. The application
  user should not have `CREATE TABLE` or `DROP TABLE` privileges in production.
- Keep `AUTHORITY_KEYPAIR_JSON` scoped to the API service only and rotate it
  alongside any Solana authority changes.

### Secret length and entropy

| Secret | Minimum requirement |
|---|---|
| `AUTH_TOKEN_SECRET` | 32 characters, randomly generated |
| Seed user passwords | 12 characters, mixed case + digits + symbols |
| `SUMSUB_WEBHOOK_SECRET` | As provided by SumSub (do not truncate) |

Generate secrets with:

```bash
# 32-byte hex string (64 chars) — suitable for AUTH_TOKEN_SECRET
openssl rand -hex 32

# 24-byte base64 string (32 chars) — alternative format
openssl rand -base64 24
```

---

## Secrets in CI/CD

### GitHub Actions

Store all secrets in **GitHub Repository Secrets** (Settings → Secrets and
variables → Actions). Reference them in workflows as `${{ secrets.NAME }}`.

```yaml
# Example: run migrations in CI
- name: Run database migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: npm run db:migrate
```

**Rules**:
- Never print secrets to logs (`echo $SECRET` will be masked by GitHub, but
  avoid it anyway to prevent accidental exposure in third-party actions).
- Use environment-scoped secrets (GitHub Environments) to prevent production
  secrets from being accessible in PR workflows.
- Rotate CI secrets on the same schedule as production secrets.

### Railway Deploy Hooks

Railway can be triggered via a deploy hook URL. Treat this URL as a secret —
it allows anyone with the URL to trigger a production deploy.

```bash
# Store the deploy hook URL as a GitHub secret, not in code
# RAILWAY_DEPLOY_HOOK_URL → GitHub Secrets
curl -X POST ${{ secrets.RAILWAY_DEPLOY_HOOK_URL }}
```

### Vercel Deploy Tokens

If using the Vercel CLI in CI, use a scoped token:

```bash
# Generate: Vercel Dashboard → Settings → Tokens → Create
# Store as: VERCEL_TOKEN in GitHub Secrets
npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## Pre-Production Security Checklist

Complete every item before routing real user traffic to the production
environment.

### Secrets & Credentials

- [ ] All secrets in `.env.example` are placeholders — no real values
- [ ] `.env` is listed in `.gitignore` and not tracked by git
- [ ] `AUTH_TOKEN_SECRET` is at least 32 characters and randomly generated
- [ ] All seed user passwords are strong (≥12 chars, mixed complexity)
- [ ] SumSub is configured with **production** tokens (not sandbox `sbx:...`)
- [ ] `SUPABASE_SERVICE_KEY` is the `service_role` key, not the `anon` key
- [ ] No secrets are hardcoded anywhere in the source code
- [ ] Git history has been audited for accidentally committed secrets

### Network & CORS

- [ ] `FRONTEND_URL` in Railway is set to the exact production Vercel URL
- [ ] `NODE_ENV=production` is set in Railway
- [ ] The API Gateway is not accessible on any port other than 443 (HTTPS)
- [ ] TLS certificates are valid and auto-renewing (Railway + Vercel handle this)

### Browser Surface

- [ ] `curl -I https://treasuryos.aicustombot.net` shows the dashboard browser security headers
- [ ] The dashboard returns `Content-Security-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`
- [ ] The dashboard returns `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, and `Origin-Agent-Cluster`
- [ ] The dashboard remains non-embeddable (`X-Frame-Options: DENY` and `frame-ancestors 'none'`)

### Database

- [ ] `DATABASE_SSL=true` is set in Railway
- [ ] The Neon database is using the **pooled** connection string
- [ ] Database migrations have been run against the production database
- [ ] The database user has only the minimum required permissions

### Authentication

- [ ] `AUTH_TOKEN_TTL_MINUTES` is set to an appropriate value (≤480 for production)
- [ ] Supabase JWT secret matches between Supabase and `SUPABASE_JWT_SECRET`
- [ ] Default seed user passwords have been changed after initial seeding

### KYC / Webhooks

- [ ] `SUMSUB_WEBHOOK_SECRET` is set and matches the SumSub Dashboard configuration
- [ ] The SumSub webhook URL is set to `https://api.treasuryos.aicustombot.net/api/kyc/webhooks/sumsub`
- [ ] Webhook signature verification is working (test via SumSub Dashboard → Webhooks → Send test)

### Solana

- [ ] `SOLANA_RPC_URL` points to mainnet (not devnet) for production
- [ ] `PROGRAM_ID_WALLET_WHITELIST` is the mainnet-deployed program ID
- [ ] Production signing is configured with `SOLANA_SIGNING_MODE=environment` and a valid `AUTHORITY_KEYPAIR_JSON`, or with a mounted `AUTHORITY_KEYPAIR_PATH`
- [ ] Example or local-only signer material is not present in production variables

### Monitoring & Observability

- [ ] Railway health check is passing (`/api/health` returns `200`)
- [ ] Railway restart policy is set to `ON_FAILURE` with at least 3 retries
- [ ] Error alerting is configured (Railway → Observability or an external service)

---

## Incident Response

### Suspected credential compromise

1. **Rotate immediately** — do not wait to confirm. Use the procedures in
   [Credential Rotation Procedures](#credential-rotation-procedures).
2. **Audit access logs** — check Railway logs and Neon query history for
   unauthorized access.
3. **Revoke active sessions** — rotating `AUTH_TOKEN_SECRET` invalidates all
   active tokens immediately.
4. **Notify affected parties** — if user data may have been accessed, follow
   your data breach notification obligations (GDPR Article 33: 72-hour
   notification to supervisory authority).

### Secret found in git history

1. Rotate the exposed secret immediately — assume it has been read.
2. Use `git filter-repo` or BFG Repo Cleaner to remove it from history.
3. Force-push the cleaned history and notify all contributors to re-clone.
4. Audit for any downstream forks or clones that may have cached the secret.

```bash
# Remove a file from all git history (use with caution)
git filter-repo --path .env --invert-paths

# Or remove a specific string pattern
git filter-repo --replace-text <(echo '=ACTUAL_SECRET_VALUE==>=[REMOVED]')
```

> Removing a secret from git history does not guarantee it was never read.
> Always rotate first, then clean history.
