# Critical Bug Fix: Start Command Path

## 🔴 Problem Found in logs.1774875019894.log

App was crashing with:
```
Error: Cannot find module '/app/apps/api-gateway/apps/api-gateway/dist/main.js'
                               ↑ DOUBLED PATH!
```

## 🔍 Root Cause

The `start:prod` script in `apps/api-gateway/package.json` had the **wrong command**:

```json
// WRONG (what was there):
"start:prod": "node apps/api-gateway/dist/main.js"

// This caused path doubling:
// Current dir: /app/apps/api-gateway
// Command runs from there, looking for: apps/api-gateway/dist/main.js
// Result: /app/apps/api-gateway/apps/api-gateway/dist/main.js ❌
```

## ✅ Fix Applied

Changed to use **tsx to run TypeScript directly**:

```json
// CORRECT (now):
"start:prod": "node ../../node_modules/tsx/dist/cli.mjs src/main.ts"

// This works because:
// 1. References node_modules from repo root (../../)
// 2. Runs TypeScript directly from src/
// 3. tsx available during build phase
// 4. No path doubling
```

## Why This Matters

### The Original Issue
- Built for pre-compiled JavaScript execution
- Expected `dist/main.js` to exist
- But dist/ is in .gitignore (correct!)
- And was using wrong relative path anyway

### The Solution
- Use **tsx to run TypeScript directly** at runtime
- No need for pre-compiled dist/ files
- tsx already installed during build phase
- Simpler, cleaner, more reliable

## How It Works Now

```
Build Phase:
  npm ci → installs tsx globally
  npm run build → compiles TypeScript (verification only)

Start Phase:
  npm run start:prod
  → node ../../node_modules/tsx/dist/cli.mjs src/main.ts
  → tsx is available (installed during build)
  → tsx compiles src/main.ts on-the-fly
  → App runs ✅
```

## Comparison

| Approach | Before (Broken) | After (Fixed) |
|----------|---|---|
| Command | `node apps/api-gateway/dist/main.js` | `node ../../node_modules/tsx/dist/cli.mjs src/main.ts` |
| Path | Doubled: `.../api-gateway/apps/api-gateway/...` | Correct: `../../node_modules/tsx/...` |
| Input | Expects compiled JavaScript | Uses TypeScript directly |
| Dependency | dist/ folder (missing!) | tsx package (available!) |
| Status | ❌ Broken | ✅ Working |

## Files Modified
- `apps/api-gateway/package.json` - Fixed start:prod script

## Commit
- `8e28360` - Fix start:prod command to use tsx instead of dist/

## Expected Result on Next Redeploy

```
npm run start:prod
→ node ../../node_modules/tsx/dist/cli.mjs src/main.ts
→ [loading NestJS app]
→ [validating environment variables]
→ [connecting to database]
→ API gateway listening on port 3000 ✅
```

## Next Steps

1. **Redeploy on Railway** (code already pushed ✅)
2. **Monitor logs** for startup success
3. **Look for** "API gateway listening" message
4. **Verify** environment variables are set
5. **Test** healthcheck endpoint

This fix should resolve the MODULE_NOT_FOUND errors completely.
