# Railway Deployment - Complete Solution

## Problem Summary
The app was failing to deploy on Railway due to:
1. Complex Docker multi-stage build with dist path mismatches
2. Stale/incorrect compiled code
3. Missing environment variables causing validation errors
4. Failed healthchecks and app startup issues

## New Approach: NIXPACKS Builder

We've switched to Railway's **NIXPACKS builder** which:
- Handles Node.js monorepo builds automatically
- Runs the app via `npm run start:prod` with tsx (TypeScript executor)
- Eliminates Docker complexity and path mismatches
- Lets Railway manage the deployment environment

### Updated railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod --workspace=@treasuryos/api-gateway",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health"
  }
}
```

## What This Does

1. **Build Phase (Automatic)**:
   - Installs Node.js 22 (detected from package.json engines)
   - Runs `npm ci` to install dependencies
   - Runs `npm run start:prod` which executes:
     ```bash
     node ../../node_modules/tsx/dist/cli.mjs src/main.ts
     ```

2. **Runtime Phase**:
   - App loads environment variables
   - Validates with Zod schema
   - Starts NestJS server on PORT (Railway-injected)
   - Responds to healthcheck at `/api/health`

## Required Environment Variables

Set these in Railway dashboard → Variables:

### Critical (App won't start without these):
```
AUTH_TOKEN_SECRET=<minimum 32 random characters>
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=<minimum 8 characters>
DEFAULT_COMPLIANCE_EMAIL=compliance@example.com
DEFAULT_COMPLIANCE_PASSWORD=<minimum 8 characters>
DEFAULT_AUDITOR_EMAIL=auditor@example.com
DEFAULT_AUDITOR_PASSWORD=<minimum 8 characters>
```

### Recommended:
```
NODE_ENV=production
SUPABASE_JWT_SECRET=<32+ random characters>
DATABASE_URL=<your-postgres-connection-string>
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID_WALLET_WHITELIST=<your-solana-program-id>
```

### Optional (Features):
```
FRONTEND_URL=https://your-dashboard.vercel.app
SENTRY_DSN=<your-sentry-dsn>
UPSTASH_REDIS_REST_URL=<redis-url>
UPSTASH_REDIS_REST_TOKEN=<redis-token>
```

## Testing Locally

Before deploying, verify the build works locally:

```bash
cd /Users/ekf/Downloads/Projects/TreasuryOS

# Install dependencies
npm install

# Build
npm run build --workspace=@treasuryos/api-gateway

# Test run (with environment variables)
export AUTH_TOKEN_SECRET="test-secret-minimum-32-characters-long"
export DEFAULT_ADMIN_EMAIL="admin@test.com"
export DEFAULT_ADMIN_PASSWORD="password123"
export DEFAULT_COMPLIANCE_EMAIL="compliance@test.com"
export DEFAULT_COMPLIANCE_PASSWORD="password123"
export DEFAULT_AUDITOR_EMAIL="auditor@test.com"
export DEFAULT_AUDITOR_PASSWORD="password123"

npm run start:prod --workspace=@treasuryos/api-gateway
```

Expected output:
```
[Nest] 1234   - 03/30/2026, 3:00:00 PM     LOG [Bootstrap] API gateway listening on http://0.0.0.0:3001/api/health [production]
```

## Troubleshooting

### App starts but healthcheck fails
- Verify `/api/health` endpoint is responding
- Check the app actually loaded all modules without errors
- Look at Railway logs for detailed error messages

### "Invalid input: expected string" error
- You're missing a required environment variable
- Refer to the "Critical" section above and add all variables
- See `.env.example` for complete list

### Build takes too long or times out
- Monorepo might be installing too many packages
- Check if node_modules is being cached between builds

### Port conflicts
- Railway automatically injects PORT environment variable
- App listens on `process.env.PORT` or defaults to 3001

## Summary

✅ Removed Docker complexity
✅ Using Railway's native NIXPACKS builder
✅ Running TypeScript directly via tsx (no pre-compilation issues)
✅ Proper healthcheck configured
✅ Ready for deployment with environment variables set

Your next Railway deployment should succeed! 🚀
