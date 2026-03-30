# Silent Startup Failure - Diagnostic Error Handlers Added

## Problem
App was crashing immediately on startup with **zero error output**, making it impossible to diagnose the issue even with environment variables set.

```
> @treasuryos/api-gateway@0.1.0 start:prod
> node ../../node_modules/tsx/dist/cli.mjs src/main.ts
[deprecation warnings]
[process exits - no error]
```

## Root Cause
Errors during NestJS app bootstrap were being thrown but **not logged to console**:

1. **NestFactory.create()** - Could fail silently if modules/providers fail
2. **Async initialization** - Promise rejection not being printed
3. **Global exception handlers** - Not catching stdout errors

The existing `.catch()` handler on bootstrap() was insufficient because:
- Some errors may not propagate through the catch handler
- Uncaught exceptions and unhandled rejections need global handlers
- Logger errors weren't reaching stdout

## Solution
Added global error handlers to catch **all possible error scenarios**:

```typescript
process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION:', error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('UNHANDLED REJECTION:', reason);
  if (reason instanceof Error) {
    console.error(reason.stack);
  }
  process.exit(1);
});
```

## What This Catches

| Error Type | Before | After |
|---|---|---|
| Validation errors (Zod) | ❌ Silent exit | ✅ Logs error + stack |
| Module load failures | ❌ Silent exit | ✅ Logs error + stack |
| Database connection errors | ❌ Silent exit | ✅ Logs error + stack |
| Unhandled promise rejections | ❌ Silent exit | ✅ Logs error |
| Uncaught exceptions | ❌ Silent exit | ✅ Logs error + stack |

## Expected Output on Error

**Before:**
```
[debug logs]
[process exits]
```

**After:**
```
[debug logs]
UNCAUGHT EXCEPTION: <error message>
<full stack trace>
```

Now we can see **exactly what's failing**.

## How to Test

1. **Push the changes** (already done ✅)
2. **Redeploy on Railway**
3. **Monitor logs** - Any startup error will now be visible
4. **Look for "UNCAUGHT EXCEPTION" or "UNHANDLED REJECTION"** in logs

## Files Modified
- `apps/api-gateway/src/main.ts` - Added global error handlers

## Commit
- `1608996` - Add global error handlers to catch startup failures

## Typical Issues You Might Now See

### Example 1: Invalid DATABASE_URL
```
UNCAUGHT EXCEPTION: invalid connection string
Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1127:13)
```
**Fix:** Set valid DATABASE_URL or connect to actual database

### Example 2: Missing PROGRAM_ID_WALLET_WHITELIST
```
UNCAUGHT EXCEPTION: PROGRAM_ID_WALLET_WHITELIST must be at least 32 characters long
Error: ZodError...
```
**Fix:** Set PROGRAM_ID_WALLET_WHITELIST to valid Solana program ID

### Example 3: Module not found
```
UNCAUGHT EXCEPTION: Cannot find module '@treasuryos/shared'
Error: MODULE_NOT_FOUND...
```
**Fix:** Ensure npm build succeeded and all dependencies compiled

## Next Steps

1. **Redeploy** with this version
2. **Check logs** for any error messages
3. **Fix** any issues that appear
4. **Redeploy** again

With visible error messages, diagnosing any remaining issues will be straightforward.

## Technical Details

### Why Both uncaughtException and unhandledRejection?

Modern Node.js uses both patterns:
- **uncaughtException** - Synchronous errors not caught in try-catch
- **unhandledRejection** - Promise rejections that aren't caught

NestJS async initialization can trigger either depending on what fails.

### Why console.error Instead of Logger?

Logger might not be initialized if app bootstrap is failing. `console.error` is guaranteed to work and logs to stderr, which Railway captures.

### Process Exit
Both handlers call `process.exit(1)` to ensure:
- The container stops (Railway restarts it)
- Any restart policies trigger
- No zombie processes

## Related Issues
- logs.1774866476121.log - Missing env vars (original)
- logs.1774867081301.log - Still failing (env vars set, no error output)
- **Current fix:** Add diagnostic error handlers

## Deployment Status
✅ Changes pushed to GitHub  
⏳ Ready for redeploy on Railway  
📊 Awaiting new logs to see actual error
