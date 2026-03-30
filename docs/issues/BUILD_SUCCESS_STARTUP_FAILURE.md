# Build Success ✅ but App Startup Failure

## Status Update: **GOOD PROGRESS** 🎉

### What Worked ✅
1. **Build succeeded!** 
   - ✅ `npm ci` ran successfully
   - ✅ `npm run build --workspace=@treasuryos/api-gateway` compiled TypeScript
   - ✅ Container started

2. **Cargo issue resolved!**
   - ✅ No more Rust detection
   - ✅ Node.js 22.x installed properly
   - ✅ npm available in build environment

### What's Failing ❌
App crashes on startup with **no error message**. Process exits silently after loading dependencies.

```
> @treasuryos/api-gateway@0.1.0 start:prod
> node ../../node_modules/tsx/dist/cli.mjs src/main.ts
[deprecation warnings]
[process exits with code 1]
```

## Root Cause: Missing Environment Variables

The app calls `loadApiGatewayEnv()` in `src/main.ts` line 12, which validates environment variables using Zod schema. If validation fails, it throws an error that:
- Is not caught/printed
- Causes the process to exit immediately
- Has no visible error output

## Required Environment Variables

**CRITICAL (must be set):**
- `AUTH_TOKEN_SECRET` - JWT secret (minimum 32 characters)
- `DEFAULT_ADMIN_EMAIL` - Valid email address
- `DEFAULT_ADMIN_PASSWORD` - Minimum 8 characters
- `DEFAULT_COMPLIANCE_EMAIL` - Valid email address
- `DEFAULT_COMPLIANCE_PASSWORD` - Minimum 8 characters
- `DEFAULT_AUDITOR_EMAIL` - Valid email address
- `DEFAULT_AUDITOR_PASSWORD` - Minimum 8 characters
- `PROGRAM_ID_WALLET_WHITELIST` - Solana program ID (32+ chars)

**Optional (have defaults):**
- `NODE_ENV` - Defaults to 'development' (set to 'production')
- `DATABASE_URL` - Defaults to local PostgreSQL
- `REDIS_URL` - Defaults to local Redis
- `SOLANA_RPC_URL` - Defaults to devnet
- `SUPABASE_JWT_SECRET` - For JWT validation (optional)

## How to Set Variables on Railway

1. **Go to Railway Dashboard**
   - Navigate to your TreasuryOS project
   - Click the **"Variables"** tab

2. **Add the critical variables:**
   ```
   AUTH_TOKEN_SECRET = [your 32+ char secret]
   DEFAULT_ADMIN_EMAIL = admin@treasuryos.local
   DEFAULT_ADMIN_PASSWORD = [8+ char password]
   DEFAULT_COMPLIANCE_EMAIL = compliance@treasuryos.local
   DEFAULT_COMPLIANCE_PASSWORD = [8+ char password]
   DEFAULT_AUDITOR_EMAIL = auditor@treasuryos.local
   DEFAULT_AUDITOR_PASSWORD = [8+ char password]
   PROGRAM_ID_WALLET_WHITELIST = [your Solana program ID]
   NODE_ENV = production
   ```

3. **Recommendations:**
   - For secrets, use a password generator
   - For `PROGRAM_ID_WALLET_WHITELIST`, use your actual Solana program ID
   - Set `NODE_ENV = production` for proper error handling

4. **Save and Redeploy**
   - Click "Deploy" or "Redeploy" button
   - Monitor logs for "API gateway listening" message

## Example Environment Setup

```env
AUTH_TOKEN_SECRET=abcdefghijklmnopqrstuvwxyz123456
DEFAULT_ADMIN_EMAIL=admin@treasuryos.local
DEFAULT_ADMIN_PASSWORD=SecurePassword123
DEFAULT_COMPLIANCE_EMAIL=compliance@treasuryos.local
DEFAULT_COMPLIANCE_PASSWORD=Compliance2024
DEFAULT_AUDITOR_EMAIL=auditor@treasuryos.local
DEFAULT_AUDITOR_PASSWORD=AuditorPass2024
PROGRAM_ID_WALLET_WHITELIST=11111111111111111111111111111111
NODE_ENV=production
```

## Deployment Checklist

- [ ] Set all 8 critical environment variables on Railway
- [ ] Click **"Redeploy"** on the project
- [ ] Monitor logs for ~2-3 minutes
- [ ] Wait for "API gateway listening" message
- [ ] Verify healthcheck passes ✅
- [ ] Test API endpoint: `curl https://<your-railway-url>/api/health`

## Expected Logs After Variables Set

```
2026-03-30T10:25:00.000Z [info] API gateway listening on port 3000
2026-03-30T10:25:01.000Z [info] Healthcheck passed
```

## Why No Error Message?

The app's environment validation is synchronous and happens during module bootstrap. When Zod validation fails:
1. It throws a ZodError
2. There's no try-catch wrapping it
3. Node.js catches the uncaught exception
4. Process exits with code 1
5. No error context is printed to stdout/stderr

**Solution:** Railway needs the variables set BEFORE the app starts, so validation passes.

## Next Steps

1. ✅ Verify builds are succeeding (they are!)
2. ⏭️ **Set environment variables on Railway** (you need to do this)
3. ⏭️ Redeploy with variables set
4. ⏭️ Monitor logs for successful startup

## Technical Details

**File:** `apps/api-gateway/src/main.ts` line 12
```typescript
async function bootstrap() {
  const env = loadApiGatewayEnv();  // ← Validation happens here
  // If validation fails, process exits silently
}
```

**Validation Schema:** `apps/api-gateway/src/config/env.ts`
- Uses Zod for runtime validation
- Checks variable types, formats, and minimums
- No custom error handlers (silent exit on failure)

## Previous Issues Timeline
- logs.1774859918910.log - Docker path mismatch
- logs.1774860453444.log - Stale compiled code
- logs.1774861006262.log - Docker healthcheck
- logs.1774861404810.log - Dockerfile cache
- logs.1774863233260.log - npm not found (Procfile)
- logs.1774864793911.log - Rust detection (ignoredPaths)
- logs.1774865658501.log - Rust detection (buildEnv)
- logs.1774865908499.log - Rust detection (Cargo deletion)
- **logs.1774866476121.log - Missing env vars** ← Current

## Summary
**Build pipeline is now fully working!** ✅ The only remaining issue is setting the required environment variables. Once those are configured on Railway, the app should start successfully.
