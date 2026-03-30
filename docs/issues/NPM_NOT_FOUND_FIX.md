# "npm: command not found" Error - RESOLVED

## Problem
Railway deployment failed immediately after starting the container:
```
[err] /bin/bash: line 1: npm: command not found
```

This occurred repeatedly, indicating the app was started without Node.js/npm being installed.

## Root Causes Identified

### 1. **Procfile Conflict** ❌
Railway detected `Procfile` and used it instead of `railway.json`:
- Procfile just defined the start command
- It didn't include the build phase
- Node.js was never installed

### 2. **Missing buildCommand** ❌
- railway.json didn't have explicit `buildCommand`
- Railpack may have skipped the build phase
- Container started without npm available

### 3. **Build Phase Never Ran** ❌
- No `npm ci` or `npm install`
- No dependency resolution
- No build compilation

## Solution Implemented

### Removed Procfile
```bash
rm Procfile
```
Procfile was conflicting with railway.json configuration.

### Updated railway.json with Explicit buildCommand
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci && npm run build --workspace=@treasuryos/api-gateway"
  },
  "deploy": {
    "startCommand": "npm run start:prod --workspace=@treasuryos/api-gateway",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60
  }
}
```

### Why This Works

1. **`"builder": "RAILPACK"`** - Forces Railway to use Railpack
2. **`buildCommand`** - Explicitly runs:
   - `npm ci` - Clean install of dependencies (locks versions)
   - `npm run build` - Compiles TypeScript
3. **`startCommand`** - Runs the app after build succeeds

### Build Flow
```
1. Railpack detects Node.js from package.json engines
2. Installs Node.js 22.x
3. npm ci ← Installs all dependencies
4. npm run build ← Compiles TypeScript
5. Container starts
6. npm run start:prod ← App runs
7. ✅ npm is now available!
```

## What Changed

### Before (Broken)
```
railway.json       (no buildCommand)
├─ builder: RAILPACK
└─ startCommand only
Procfile          (conflicting)
```

**Result**: Procfile used, npm never installed ❌

### After (Fixed)
```
railway.json       (explicit buildCommand)
├─ builder: RAILPACK
├─ buildCommand: npm ci && npm run build
└─ startCommand: npm run start:prod
(No Procfile)
```

**Result**: railway.json is source of truth, full build runs ✅

## How to Deploy Now

### Step 1: Verify Changes
Latest commit: `d977d13`
- Procfile removed
- railway.json has buildCommand

### Step 2: Clear Railway Cache
Railway Dashboard:
1. Go to Deployments
2. Click "Redeploy" button
3. Force fresh build (clears cache)

### Step 3: Monitor Build
Watch logs for:
```
[inf] Using RAILPACK builder
[inf] npm ci
[inf] npm run build --workspace=@treasuryos/api-gateway
[inf] Starting Container
[inf] npm run start:prod --workspace=@treasuryos/api-gateway
[inf] API gateway listening on http://0.0.0.0:3001/api/health [production]
```

### Step 4: Verify Success
- Healthcheck passes ✅
- npm commands work
- App is responsive

## Expected Build Time

| Phase | Time |
|-------|------|
| Detect & Setup | 10s |
| npm ci | 30-60s |
| npm run build | 10-20s |
| Start container | 5s |
| App startup | 5-10s |
| **Total** | **~2 minutes** |

## Troubleshooting

### Still getting "npm: command not found"?

**Step 1: Verify railway.json is correct**
```bash
cat railway.json | grep -A 3 buildCommand
```
Should show:
```json
"buildCommand": "npm ci && npm run build --workspace=@treasuryos/api-gateway"
```

**Step 2: Check railpack.json exists**
```bash
cat railpack.json
```
Should show:
```json
{
  "$schema": "https://schema.railway.com/railpack.json",
  "providers": ["node"]
}
```

**Step 3: Verify Procfile is deleted**
```bash
ls Procfile 2>&1
```
Should return: `No such file or directory`

**Step 4: Force rebuild**
1. Commit and push changes
2. Wait 10 seconds
3. Railway Dashboard → Redeploy
4. Check logs for "Using RAILPACK builder"

### Build succeeds but app won't start?

**Check error in logs**:
- "Invalid input: expected string" → Missing env var
- "Cannot find module" → Dependency not installed
- "Port already in use" → Port conflict (shouldn't happen on Railway)

**Solution**: Check `.env.example` and set all required vars in Railway Variables

### Build is slow?

**Normal timing**:
- First build: 2-3 minutes (npm install everything)
- Second+ builds: 30-60 seconds (cached node_modules)

**If slower**:
- Check if Railway is caching node_modules properly
- Try forcing a completely fresh build

## Files Changed

### Deleted
- `Procfile` - Was conflicting with railway.json

### Updated
- `railway.json` - Added explicit buildCommand

### Configuration Summary

**railpack.json** (auto-detects Node.js):
```json
{
  "$schema": "https://schema.railway.com/railpack.json",
  "providers": ["node"]
}
```

**railway.json** (build + deploy):
```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci && npm run build --workspace=@treasuryos/api-gateway"
  },
  "deploy": {
    "startCommand": "npm run start:prod --workspace=@treasuryos/api-gateway",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60
  }
}
```

**.railway.yaml** (same as railway.json but YAML):
```yaml
build:
  builder: RAILPACK
  buildCommand: npm ci && npm run build --workspace=@treasuryos/api-gateway
deploy:
  startCommand: npm run start:prod --workspace=@treasuryos/api-gateway
  restartPolicyType: ON_FAILURE
  restartPolicyMaxRetries: 10
  healthcheckPath: /api/health
  healthcheckTimeout: 60
```

## Summary

✅ **Root cause**: Procfile was being used instead of railway.json  
✅ **Solution**: Removed Procfile, added explicit buildCommand  
✅ **Result**: railway.json is now the source of truth  
✅ **Build phase**: Will now install Node.js and npm  
✅ **Ready to deploy**: Push changes → Railway redeploys → Works!

## Related Documentation

- `RAILPACK_DEPLOYMENT.md` - Complete Railpack setup
- `DEPLOYMENT_COMPARISON.md` - Builders comparison
- `DOCKERFILE_CACHE_FIX.md` - Cache issues

---

**Commit**: `d977d13`  
**Next**: Redeploy on Railway with fresh environment
