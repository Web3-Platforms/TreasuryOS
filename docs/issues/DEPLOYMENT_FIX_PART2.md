# Railway Deployment Fix - Part 2: Configuration Validation

## Problem
After the first fix, Railway deployment was failing with:
```
ZodError: [
  {
    "expected": "string",
    "code": "invalid_type",
    "path": ["JWT_SECRET"],
    "message": "Invalid input: expected string, received undefined"
  }
]
```

The error occurred at `loadApiGatewayEnv` in the compiled config module.

## Root Cause Analysis

1. **Stale Compiled Code**: The `/app/apps/api-gateway/dist/config/env.js` file was outdated and contained an old schema requiring `JWT_SECRET`
2. **Monorepo Build Output Structure**: TypeScript compiler outputs files to `dist/apps/api-gateway/src/` not `apps/api-gateway/dist/` (because it's compiling from the monorepo root)
3. **Docker Copy Mismatch**: The Dockerfile was copying from `apps/api-gateway/dist` but the actual compiled files were at `apps/api-gateway/dist/apps/api-gateway/src/`

## Solution

### Updated Dockerfile
Changed the COPY command to reference the correct monorepo dist path:

```dockerfile
# Before
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist

# After
COPY --from=builder /app/apps/api-gateway/dist/apps/api-gateway/src ./apps/api-gateway/dist
```

This ensures:
- The compiled files from the monorepo build are copied to the correct location
- The `env.js` file contains the current schema (with `AUTH_TOKEN_SECRET`, not `JWT_SECRET`)
- No stale compiled code is used

## How to Fix at Runtime

If you encounter this error during Railway deployment:

1. **Set Required Environment Variables**:
   ```
   AUTH_TOKEN_SECRET=<minimum 32 characters>
   SUPABASE_JWT_SECRET=<minimum 32 characters - required for auth>
   DEFAULT_ADMIN_EMAIL=admin@example.com
   DEFAULT_ADMIN_PASSWORD=<minimum 8 characters>
   DEFAULT_COMPLIANCE_EMAIL=compliance@example.com
   DEFAULT_COMPLIANCE_PASSWORD=<minimum 8 characters>
   DEFAULT_AUDITOR_EMAIL=auditor@example.com
   DEFAULT_AUDITOR_PASSWORD=<minimum 8 characters>
   ```

2. **Optional but Recommended**:
   ```
   DATABASE_URL=<your Neon database connection string>
   SOLANA_RPC_URL=https://api.devnet.solana.com (or your preferred RPC)
   PROGRAM_ID_WALLET_WHITELIST=<your Solana program ID>
   ```

## Testing Locally

To verify the build works before deploying:
```bash
cd /Users/ekf/Downloads/Projects/TreasuryOS
npm run build --workspace=@treasuryos/api-gateway
node apps/api-gateway/dist/apps/api-gateway/src/main.js
```

The app should start without validation errors if all required env vars are set.
