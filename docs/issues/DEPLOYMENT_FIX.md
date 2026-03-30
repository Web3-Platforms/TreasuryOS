# Railway Deployment Fix

## Problem
Railway deployment was failing with the error:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/app/apps/api-gateway/src/main.ts'
```

The deployment was attempting to run TypeScript files directly using `tsx`, but the Docker build was not including the `src` directory in the runner stage.

## Root Causes

1. **Dockerfile**: The runner stage was copying only the compiled `dist` folder but the `CMD` was trying to run TypeScript directly from `src/main.ts`
2. **railway.json**: The `startCommand` was using `npm run start:prod` which invokes `tsx` to run TypeScript, but `tsx` and source files weren't available in the production container

## Solution

### 1. Fixed Dockerfile (apps/api-gateway/Dockerfile)
Changed the CMD to run the compiled JavaScript:
```dockerfile
# Before
CMD ["node", "node_modules/tsx/dist/cli.mjs", "apps/api-gateway/src/main.ts"]

# After
CMD ["node", "apps/api-gateway/dist/main.js"]
```

### 2. Fixed railway.json 
Updated the deployment start command to run the compiled JavaScript:
```json
{
  "deploy": {
    "startCommand": "node apps/api-gateway/dist/main.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## How It Works Now

1. **Build Stage**: TypeScript is compiled to JavaScript in the `dist` folder via `npm run build`
2. **Runtime Stage**: 
   - Docker copies only the compiled `dist` folder (no `src` needed)
   - The app runs the pre-compiled JavaScript directly with Node
   - No need for `tsx` at runtime
   - Smaller, faster deployment container
   - No missing module errors

## Benefits
- ✅ Proper production deployment (runs compiled code, not source)
- ✅ No runtime TypeScript compilation needed
- ✅ Smaller Docker image footprint
- ✅ Faster startup time
- ✅ Eliminates the missing `src/main.ts` error
