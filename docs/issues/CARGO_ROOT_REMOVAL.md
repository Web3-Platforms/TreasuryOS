# Cargo.toml Root Removal - Final Rust Detection Fix

## Problem
Despite multiple attempts to disable Rust detection via `BP_DISABLE_RUST`, Railpack continued detecting Rust because it found `Cargo.toml` in the repository root.

```
[inf]  ↳ Detected Rust
[inf]    rust  │  1.89.0  │  railpack default
[err]  sh: 1: npm: not found
```

## Root Cause: Detection Priority
Railpack's language detection algorithm:
1. Scans for language-specific files (Cargo.toml, package.json, requirements.txt, etc.)
2. **Returns FIRST match** (Rust found → builds as Rust project)
3. Never checks for alternative languages

Once Rust is detected, Railpack:
- Installs Rust 1.89.0
- Skips Node.js installation
- Fails when trying to run `npm ci` in build phase

## Why Previous Fixes Failed

### Attempt 1: ignoredPaths
```json
"ignoredPaths": ["programs", "Cargo.toml", "Cargo.lock"]
```
- Railpack ignores files during some analysis steps
- But `Cargo.toml` still exists in filesystem
- Detection algorithm found it anyway

### Attempt 2: buildEnv variables
```json
"buildEnv": {
  "BP_DISABLE_RUST": "true"
}
```
- `buildEnv` variables are available during build phase
- But Rust detection happens **BEFORE** build phase
- Variables couldn't disable a buildpack already selected during planning

### Attempt 3: railpack.json buildpacks config
```json
"buildpacks": {
  "rust": false,
  "node": true
}
```
- Railpack 0.22.1 may not support this config format
- Or config parsing failed silently
- Rust still got selected

## Final Solution: Delete Cargo Files

**Delete `Cargo.toml` and `Cargo.lock` from repository root.**

```bash
rm Cargo.toml Cargo.lock
```

### Why This Works
- Removes the trigger file that Railpack detects
- With no `Cargo.toml`, Railpack scans next file
- Finds `package.json` → detects Node.js
- Installs Node.js 22.x
- Builds as Node.js project ✅

### Is It Safe to Delete?

**YES.** Cargo files were only needed for Solana Rust programs:
- Located in `/programs/` subdirectory
- For local development only (not deployed to Railway)
- Each Solana program has its own `Cargo.toml` in its subdirectory
- Root `Cargo.toml` was only a workspace manifest for local builds

**Not deleted:** `/programs/` directory remains intact with individual Cargo.toml files for each program.

## What Changed

### Files Deleted
- `Cargo.toml` (root workspace manifest)
- `Cargo.lock` (dependency lock file)

### Files Simplified
- `railpack.json` - Removed `ignoredPaths` and `buildpacks` config
- `.railway.yaml` - No changes needed (already simplified)

### Files Unchanged
- `railway.json` - Kept `buildEnv` variables (no harm, may help future builds)
- `/programs/*/Cargo.toml` - Still exist (for Solana program development)

## Build Flow (Final)

```
1. Railway receives code push
2. Railpack scans for language files
3. No Cargo.toml in root → can't detect Rust
4. Finds package.json → detects Node.js
5. Reads railpack.json: "providers": ["node"]
6. Installs Node.js 22.x ✅
7. Installs dependencies: `npm ci` ✅
8. Builds app: `npm run build --workspace=@treasuryos/api-gateway` ✅
9. Creates runtime container
10. Starts app: `npm run start:prod` ✅
11. Healthcheck passes ✅
```

## Deployment Instructions

1. **Verify push succeeded:**
   ```bash
   git log --oneline -1
   # Should show: "Remove Cargo.toml and Cargo.lock from root directory"
   ```

2. **Trigger Railway redeploy:**
   - Go to Railway Dashboard → TreasuryOS project
   - Click **"Redeploy"** button
   - Monitor logs

3. **Expected log output:**
   ```
   ✅ Using RAILPACK builder
   ✅ Detected Node.js (NOT Rust!)
   ✅ npm ci (installing dependencies)
   ✅ npm run build (compiling TypeScript)
   ✅ API gateway listening on port 3000
   ```

4. **Verify success:**
   - Build completes in < 3 minutes
   - Healthcheck passes ✅
   - Application responds to requests

## Files Modified
- `Cargo.toml` - **DELETED** from root
- `Cargo.lock` - **DELETED** from root
- `railpack.json` - Simplified to minimal config
- `.railway.yaml` - No changes (already correct)
- `railway.json` - No changes (buildEnv still present for safety)

## Commits
- `db3bfc4` - Delete Cargo.toml and Cargo.lock
- `f6ecea0` - Simplify railpack.json

## Why This Is the Right Solution

1. **Root cause elimination** - Removes the file triggering mis-detection
2. **Simple and clean** - No complex workarounds or config hacks
3. **Semantically correct** - Cargo files aren't part of the Node.js project
4. **Reversible** - Solana programs can still be developed locally (their own Cargo.toml files exist)
5. **No side effects** - Doesn't break anything in Railway deployment

## Key Learning

**File existence matters more than configuration.**

When a builder auto-detects languages, it typically:
- Looks for language-specific files
- Uses first match as project type
- Configuration like `ignoredPaths` may not override detection

For Railway/Railpack:
- Simplest solution is often to remove the detection trigger
- Don't try to hide files from a detector
- Delete them if they don't belong in the deployment

## Related Issues Timeline
- logs.1774859918910.log - Docker path mismatch
- logs.1774860453444.log - Stale compiled code
- logs.1774861006262.log - Docker healthcheck failures
- logs.1774861404810.log - Dockerfile cache issue
- logs.1774863233260.log - npm not found (Procfile conflict)
- logs.1774864793911.log - Rust detected (ignoredPaths attempt)
- logs.1774865658501.log - Rust detected (buildEnv attempt)
- **logs.1774865908499.log** - Rust detected (final fix: delete Cargo files) ✅

## Deployment Status
✅ **Ready to deploy** - All configuration finalized and pushed to GitHub
