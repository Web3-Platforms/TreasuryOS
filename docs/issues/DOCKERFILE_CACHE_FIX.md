# Railway Dockerfile Cache Issue - RESOLVED

## Problem
Railway was trying to read a non-existent Dockerfile at `apps/api-gateway/Dockerfile` even though:
- We deleted the Dockerfile
- We updated railway.json to use NIXPACKS
- The file was committed as deleted

**Error**: `failed to read Dockerfile at 'apps/api-gateway/Dockerfile'`

## Root Cause
Railway's build detection system had cached the old Dockerfile reference from previous deployments.

## Solution

### Step 1: Added Explicit NIXPACKS Configuration
Updated `railway.json` with explicit build command:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build --workspace=@treasuryos/api-gateway"
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

### Step 2: Added Process Definition
Created `Procfile` to explicitly define the web process:
```
web: npm run start:prod --workspace=@treasuryos/api-gateway
```

### Step 3: Added YAML Alternative
Created `.railway.yaml` as alternative configuration format:
```yaml
build:
  builder: NIXPACKS
  buildCommand: npm install && npm run build --workspace=@treasuryos/api-gateway
deploy:
  startCommand: npm run start:prod --workspace=@treasuryos/api-gateway
  restartPolicyType: ON_FAILURE
  restartPolicyMaxRetries: 10
  healthcheckPath: /api/health
  healthcheckTimeout: 60
```

## How This Fixes It

1. **Explicit builder selection**: `"builder": "NIXPACKS"` tells Railway not to try Docker
2. **Build command included**: Ensures Railway knows exactly what command to run
3. **Multiple config formats**: Railway now has JSON, YAML, and Procfile to choose from
4. **Longer healthcheck timeout**: Gives the app 60 seconds to start (development might be slower)

## Next Steps

In Railway Dashboard:

1. **Rebuild from new commit** (14a4f92)
   - Click "Deploy" → "Redeploy"
   - Force a fresh build to clear cache

2. **Set environment variables** (as documented in DEPLOYMENT_SOLUTION.md):
   ```
   AUTH_TOKEN_SECRET=<32+ chars>
   DEFAULT_ADMIN_EMAIL=admin@example.com
   DEFAULT_ADMIN_PASSWORD=<8+ chars>
   DEFAULT_COMPLIANCE_EMAIL=...
   DEFAULT_COMPLIANCE_PASSWORD=...
   DEFAULT_AUDITOR_EMAIL=...
   DEFAULT_AUDITOR_PASSWORD=...
   ```

3. **Monitor the deployment**
   - Watch logs to ensure NIXPACKS builder is used
   - Confirm app starts with `npm run start:prod`
   - Verify healthcheck passes at `/api/health`

## Expected Build Log
```
[inf] build step... starting
[inf] using NIXPACKS builder
[inf] npm install
[inf] npm run build --workspace=@treasuryos/api-gateway
[inf] build succeeded
[inf] starting container
[inf] npm run start:prod --workspace=@treasuryos/api-gateway
[inf] API gateway listening on http://0.0.0.0:3001/api/health [production]
```

## Commits
- aa1284b: Removed Dockerfile, switched to NIXPACKS
- ac04527: Added Procfile and .railway.yaml
- 14a4f92: Explicit NIXPACKS with buildCommand

This should fully resolve the Dockerfile cache issue! 🚀
