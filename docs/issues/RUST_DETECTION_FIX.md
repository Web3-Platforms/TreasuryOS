# Rust Detection Override - Build Error Fix (UPDATED)

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
The repository contains `Cargo.toml` and `Cargo.lock` in the project root (for Solana Rust programs in `/programs`). Railpack auto-detects these files and prioritizes Rust provider over Node.js.

**Detection Order (Railpack Default):**
1. Scan for language files (Cargo.toml → Rust detected)
2. Check for workspace configs (package.json → Node detected)
3. Pick first detected language

Cargo.toml is detected first, so Rust wins.

## Solution Implemented

### 1. Updated `railway.json`
Moved build environment variables to correct `buildEnv` section:

```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci && npm run build --workspace=@treasuryos/api-gateway",
    "buildEnv": {
      "BP_DISABLE_RUST": "true",
      "BP_DISABLE_RUST_TOOLCHAIN": "true"
    }
  },
  "deploy": { ... }
}
```

**What this does:**
- `buildEnv` - Build environment variables are read during Railpack build phase (NOT regular variables)
- `BP_DISABLE_RUST=true` - Tells Railpack/Cloud Native Buildpacks to skip Rust detection
- `BP_DISABLE_RUST_TOOLCHAIN=true` - Prevents Rust toolchain from being installed as fallback

### 2. Updated `railpack.json`
Triple-layer protection to prevent Rust detection:

```json
{
  "providers": ["node"],
  "ignoredPaths": ["programs", "Cargo.toml", "Cargo.lock", ".cargo"],
  "buildpacks": {
    "rust": false,
    "node": true
  }
}
```

**What this does:**
- `providers: ["node"]` - Tells Railpack Node.js is the only provider
- `ignoredPaths` - Excludes Cargo.toml/lock and .cargo from detection
- `buildpacks: { rust: false, node: true }` - Explicit buildpack disable (future-proofing)

### 3. Updated `.railway.yaml`
Kept YAML config in sync:

```yaml
build:
  builder: RAILPACK
  buildEnv:
    BP_DISABLE_RUST: "true"
    BP_DISABLE_RUST_TOOLCHAIN: "true"
deploy:
  ...
```

## Key Lesson: buildEnv vs variables

**CRITICAL DIFFERENCE:**
- `railway.json "variables"` → Runtime environment variables (available when app runs)
- `railway.json "build.buildEnv"` → Build-phase environment variables (available during `npm ci` & `npm run build`)

BP_* variables must go in `buildEnv`, not `variables`.

## Build Flow (After Fix)

```
1. Railpack initializes
2. Reads railway.json buildEnv section
3. Sets BP_DISABLE_RUST=true, BP_DISABLE_RUST_TOOLCHAIN=true
4. Scans for languages with Rust buildpack disabled
5. Finds railpack.json with ignoredPaths
6. Ignores programs/, Cargo.toml, Cargo.lock, .cargo
7. Detects package.json (Node.js only)
8. Installs Node.js 22.x
9. Runs `npm ci` ← npm is now available!
10. Runs `npm run build --workspace=@treasuryos/api-gateway`
11. Compiles TypeScript to dist/
12. Container starts
13. Runs `npm run start:prod` ← npm works!
```

## Deployment Instructions

1. **Trigger Redeploy**
   - Go to Railway Dashboard → TreasuryOS project
   - Click "Redeploy" button
   - IMPORTANT: Ensure "Use cached build" is UNCHECKED (need fresh build)

2. **Monitor Logs**
   - Should see: `Using RAILPACK builder`
   - Should see: `Detected Node.js` or no language detection (just Node.js)
   - Should see: `npm ci` and `npm run build`
   - Should NOT see: Rust installation steps

3. **Verify Success**
   - Build completes without npm errors
   - Healthcheck passes ✅
   - App logs show "API gateway listening"

## Environment Variables Still Required
- `AUTH_TOKEN_SECRET` (critical - 32+ chars)
- `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_COMPLIANCE_EMAIL`, `DEFAULT_COMPLIANCE_PASSWORD`
- `DEFAULT_AUDITOR_EMAIL`, `DEFAULT_AUDITOR_PASSWORD`
- Optional: `NODE_ENV`, `SUPABASE_JWT_SECRET`, database URLs, etc.

## Technical Deep Dive

### Why buildEnv?
- Cloud Native Buildpacks (used by Railpack) read `BP_*` environment variables during build phase
- These variables control buildpack behavior (e.g., disable Rust, enable Node)
- Runtime variables in `railway.json "variables"` aren't available during build
- Must use `railway.json "build.buildEnv"` to pass BP_* vars to buildpacks

### Why Triple Protection?
1. **buildEnv variables** - Primary: disables Rust buildpack system-wide
2. **railpack.json ignoredPaths** - Secondary: prevents Cargo.toml from being scanned
3. **railpack.json buildpacks** - Tertiary: explicit disable flag for robustness

### Why Not Delete Cargo.toml?
- `Cargo.toml` is needed for Solana programs in `/programs`
- Only should be excluded from Node.js/Railway build process
- Solution: Exclude via `ignoredPaths`, not delete

## Files Modified
- `railway.json` - Moved BP_* vars to buildEnv section
- `railpack.json` - Added explicit buildpacks disable, expanded ignoredPaths
- `.railway.yaml` - Synced with railway.json

## Commits
- `ea182ef` - Added BP_DISABLE_RUST to variables (first attempt)
- `827c446` - Moved BP_DISABLE_RUST to buildEnv (correct fix) ✅

## Related Issues
- [logs.1774859918910.log](logs.1774859918910.log) - Initial TypeScript path error
- [logs.1774860453444.log](logs.1774860453444.log) - ZodError environment validation
- [logs.1774861006262.log](logs.1774861006262.log) - Healthcheck failures (Docker)
- [logs.1774861404810.log](logs.1774861404810.log) - Dockerfile cache issue
- [logs.1774863233260.log](logs.1774863233260.log) - npm not found (Procfile conflict)
- [logs.1774864793911.log](logs.1774864793911.log) - Rust detection (variables section)
- **[logs.1774865658501.log](logs.1774865658501.log) - Rust detection (buildEnv fix)** ← Current fix

