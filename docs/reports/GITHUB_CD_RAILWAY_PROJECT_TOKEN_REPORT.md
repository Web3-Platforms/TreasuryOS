# GitHub CD Railway Project Token Report

## Summary

I verified the GitHub Actions secrets after they were added and re-ran the
`TreasuryOS CD` workflow.

The rerun proved that the repository now has both expected Actions secrets:

- `RAILWAY_TOKEN`
- `NEON_DATABASE_URL`

However, the deploy job still failed at the workflow's explicit Railway auth
probe:

```text
railway whoami >/dev/null
Unauthorized. Please check that your RAILWAY_TOKEN is valid and has access to the resource you're trying to use.
```

## Root Cause

The failure is caused by a mismatch between the token type expected by Railway
CI/CD and the command used in the workflow.

Railway's CLI docs state that:

- `RAILWAY_TOKEN` is for **project-level actions**
- `RAILWAY_API_TOKEN` is for **account/workspace-level actions**
- `railway whoami` displays the currently logged-in **user**

That means `railway whoami` is the wrong validation command for a CI deploy that
uses `RAILWAY_TOKEN`, because a project token is intended for project-scoped
deploy operations like `railway up`, not for user/account identity checks.

## Fix Applied

I updated `.github/workflows/cd.yml` to:

- keep the explicit presence check for `RAILWAY_TOKEN`
- remove the `railway whoami` validation step
- continue deploying with `railway up`

I also updated deployment docs so the token type is explicit:

- `DEPLOYMENT.md`
- `docs/ENVIRONMENT_VARIABLES.md`

Both now document that `RAILWAY_TOKEN` should be a Railway **Project Token**
from the target project's settings.

## Expected Outcome

With the incorrect `whoami` step removed, GitHub CD should validate the token in
the right context by using it for the actual deploy operation.

If deployment still fails after this fix, the next failure will be a more
reliable signal about the token itself or the Railway service configuration,
rather than a false negative from a user-level auth check.

## Follow-up Failure and Targeting Fix

After pushing the project-token fix, GitHub Actions run `#86` reached the real
deploy step and failed with:

```text
railway up --service api-gateway --detach
Service not found
```

I then re-linked the live Railway project locally and confirmed the actual API
Gateway service identity in Railway production is:

- service name: `@treasuryos/api-gateway`
- service ID: `3337810b-af7f-4377-912c-5ae9a2557284`

That means the workflow's `api-gateway` alias was too short for the live
Railway project. I updated `.github/workflows/cd.yml` again to deploy to the
exact live service name:

```text
railway up --service '@treasuryos/api-gateway' --detach
```

This should move the CD workflow past the service lookup error and reveal the
next true deploy result.

## Final Verification Result

That follow-up fix worked.

GitHub Actions run `#87` (`23871526778`) completed successfully:

- `deploy-api` passed
- `migrate-neon` was unblocked and skipped cleanly because no migration files changed on that push

This confirms that the GitHub CD path is now correctly configured for:

- Railway Project Token authentication via `RAILWAY_TOKEN`
- the exact live Railway API service target `@treasuryos/api-gateway`
