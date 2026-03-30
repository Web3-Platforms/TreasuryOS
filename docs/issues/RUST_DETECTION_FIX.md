# Rust Detection Override - Build Error Fix

## Problem
Railway deployment failed with: `sh: 1: npm: command not found`

Log analysis revealed Railpack was detecting **Rust** instead of **Node.js**, installing Rust 1.89.0 but NOT installing Node.js or npm.

```
[inf]  ↳ Detected Rust
...
[inf]    rust  │  1.89.0  │  railpack default (1.89)
[err]  sh: 1: npm: not found
```

## Root Cause
The repository contains `Cargo.toml` and `Cargo.lock` in the project root (for Solana Rust programs in `/programs`). Railpack auto-detects these files and prioritizes Rust provider over Node.js, even though `railpack.json` specifies `"providers": ["node"]`.

**Detection Order (Railpack Default):**
1. Scan for language files (Cargo.toml → Rust detected)
2. Check for workspace configs (package.json → Node detected)
3. Pick first detected language

Cargo.toml is detected first, so Rust wins.

## Solution Implemented

### 1. Updated `railpack.json`
Added path filters to exclude Rust-related files:

```json
{
  "$schema": "https://schema.railway.com/railpack.json",
  "providers": ["node"],
  "ignoredPaths": ["programs", "Cargo.toml", "Cargo.lock"]
}
```

**What this does:**
- Tells Railpack to ignore `programs/` directory (contains Solana Rust code)
- Tells Railpack to ignore `Cargo.toml` and `Cargo.lock` (Rust manifest files)
- Prevents Railpack from detecting Rust in the first place

### 2. Updated `railway.json`
Added explicit environment variable to disable Rust buildpack:

```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci && npm run build --workspace=@treasuryos/api-gateway"
  },
  "deploy": { ... },
  "variables": {
    "BP_DISABLE_RUST": "true"
  }
}
```

**What this does:**
- `BP_DISABLE_RUST=true` explicitly disables the Rust buildpack during build
- Failsafe in case Railpack still detects Rust despite ignored paths
- Forces Node.js to be the only active provider

### 3. Updated `.railway.yaml`
Kept YAML config in sync with JSON for consistency:

```yaml
build:
  builder: RAILPACK
deploy:
  ...
variables:
  BP_DISABLE_RUST: "true"
```

## Build Flow (After Fix)

```
1. Railpack initializes
2. Scans for languages
3. Finds railpack.json with ignoredPaths
4. Ignores programs/, Cargo.toml, Cargo.lock
5. Detects package.json (Node.js)
6. BP_DISABLE_RUST=true ensures no Rust buildpack
7. Installs Node.js 22.x
8. Runs `npm ci` ← npm is now available!
9. Runs `npm run build --workspace=@treasuryos/api-gateway`
10. Compiles TypeScript to dist/
11. Container starts
12. Runs `npm run start:prod` ← npm works!
```

## Deployment Instructions

1. **Trigger Redeploy**
   - Go to Railway Dashboard → TreasuryOS project
   - Click "Redeploy" button
   - Ensure "Use cached build" is UNCHECKED (need fresh detection)

2. **Monitor Logs**
   - Should see: `Using RAILPACK builder`
   - Should see: `Detected Node.js` (NOT Rust)
   - Should see: `npm ci` and `npm run build`
   - Should NOT see: Rust installation steps

3. **Verify Success**
   - Build completes without npm errors
   - Healthcheck passes ✅
   - App logs show "API gateway listening"

## Environment Variables Still Required
- `AUTH_TOKEN_SECRET` (critical)
- `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_COMPLIANCE_EMAIL`, `DEFAULT_COMPLIANCE_PASSWORD`
- `DEFAULT_AUDITOR_EMAIL`, `DEFAULT_AUDITOR_PASSWORD`
- Optional: `NODE_ENV`, `SUPABASE_JWT_SECRET`, database URLs, etc.

## Technical Notes

### Why BP_DISABLE_RUST?
- `BP_` prefix = Build Pack environment variable
- Railpack uses Cloud Native Buildpacks under the hood
- `BP_DISABLE_RUST=true` tells buildpack system to skip Rust completely
- Double-layered protection: both ignored paths + explicit disable

### Why Not Delete Cargo.toml?
- `Cargo.toml` is needed for Solana programs in `/programs`
- Only should be excluded from Rails/Node.js build process
- Solution: Exclude via `ignoredPaths`, not delete

### Why Keep .railway.yaml?
- Railpack might read `.railway.yaml` as fallback
- Better to keep both files in sync than risk divergence
- No harm in maintaining both (one serves as backup)

## Files Modified
- `railpack.json` - Added ignoredPaths filter
- `railway.json` - Added BP_DISABLE_RUST variable
- `.railway.yaml` - Added BP_DISABLE_RUST variable

## Commit
```
69e2fda - Disable Rust detection in Railpack to prioritize Node.js
```

## Related Issues
- [logs.1774859918910.log](logs.1774859918910.log) - Initial TypeScript path error
- [logs.1774860453444.log](logs.1774860453444.log) - ZodError environment validation
- [logs.1774861006262.log](logs.1774861006262.log) - Healthcheck failures (Docker)
- [logs.1774861404810.log](logs.1774861404810.log) - Dockerfile cache issue
- [logs.1774863233260.log](logs.1774863233260.log) - npm not found (Procfile conflict)
- **[logs.1774864793911.log](logs.1774864793911.log) - Rust detection override** ← Current fix
