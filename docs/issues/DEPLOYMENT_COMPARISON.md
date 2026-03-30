# Railway Deployment Builders Comparison

## TreasuryOS Deployment Journey

We've explored three approaches for deploying TreasuryOS on Railway:

### ❌ Approach 1: Custom Dockerfile (Deleted)
**Problem**: Complex multi-stage builds, dist path mismatches, Docker cache issues

**Issues**:
- TSX execution path complications
- Build dist folder structure conflicts
- Old Dockerfile references cached by Railway
- Monorepo complexity with Docker layers

---

### ⚠️ Approach 2: Nixpacks (Deprecated)
**Status**: Older system, still works but not recommended

**Configuration**:
```json
{
  "builder": "NIXPACKS",
  "buildCommand": "npm install && npm run build --workspace=@treasuryos/api-gateway"
}
```

**Issues**:
- Requires explicit build command
- Older documentation
- Limited monorepo intelligence
- Slower builds

**When to use**: Only if Railpack doesn't work for your use case

---

### ✅ Approach 3: Railpack (RECOMMENDED)
**Status**: Railway's modern, native builder

**Configuration**:
```json
{
  "builder": "RAILPACK"
}
```

**Advantages**:
- ✅ Auto-detects Node.js and dependencies
- ✅ Intelligent monorepo handling
- ✅ Better performance
- ✅ Smarter build caching
- ✅ Clear error messages
- ✅ Future-proof (Railway's direction)

**Key Files**:
- `railpack.json` - Specifies providers (Node.js)
- `railway.json` - Deployment configuration
- `.railway.yaml` - Alternative YAML format
- `Procfile` - Process definitions

---

## Current Setup (Railpack)

### Configuration Files

**`railpack.json`**:
```json
{
  "$schema": "https://schema.railway.com/railpack.json",
  "providers": ["node"]
}
```
Tells Railpack to use Node.js provider.

**`railway.json`**:
```json
{
  "build": {
    "builder": "RAILPACK"
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

**`Procfile`**:
```
web: npm run start:prod --workspace=@treasuryos/api-gateway
```

**`.railway.yaml`**:
```yaml
build:
  builder: RAILPACK
deploy:
  startCommand: npm run start:prod --workspace=@treasuryos/api-gateway
  restartPolicyType: ON_FAILURE
  restartPolicyMaxRetries: 10
  healthcheckPath: /api/health
  healthcheckTimeout: 60
```

---

## Deployment Flow (Railpack)

```
1. Push code to main branch
        ↓
2. Railway webhook triggered
        ↓
3. Railpack detects Node.js project
        ↓
4. npm install (all dependencies)
        ↓
5. Starts app with: npm run start:prod --workspace=@treasuryos/api-gateway
        ↓
6. NestJS starts, loads environment variables
        ↓
7. Healthcheck probes /api/health
        ↓
8. ✅ App is live!
```

---

## Environment Variables Required

### Critical (App won't start without these)
```
AUTH_TOKEN_SECRET=<32+ random chars>
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=<8+ chars>
DEFAULT_COMPLIANCE_EMAIL=compliance@example.com
DEFAULT_COMPLIANCE_PASSWORD=<8+ chars>
DEFAULT_AUDITOR_EMAIL=auditor@example.com
DEFAULT_AUDITOR_PASSWORD=<8+ chars>
```

### Recommended
```
NODE_ENV=production
SUPABASE_JWT_SECRET=<32+ random chars>
DATABASE_URL=postgresql://...
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID_WALLET_WHITELIST=<program-id>
```

### Optional
```
FRONTEND_URL=https://dashboard.vercel.app
SENTRY_DSN=https://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## How to Deploy

### Step 1: Set Environment Variables
Railway Dashboard → Variables → Add all critical variables above

### Step 2: Trigger Redeploy
Railway Dashboard → Deployments → Redeploy

### Step 3: Monitor
Watch logs for:
```
[inf] Using RAILPACK builder
[inf] npm install
[inf] npm run start:prod --workspace=@treasuryos/api-gateway
[inf] API gateway listening on http://0.0.0.0:3001/api/health [production]
```

### Step 4: Verify
- Health tab shows ✅
- `/api/health` returns HTTP 200
- API responds to requests

---

## Troubleshooting by Symptom

| Symptom | Cause | Solution |
|---------|-------|----------|
| Build fails with "npm not found" | Railpack not detecting Node.js | Check `railpack.json` has providers: ["node"] |
| Healthcheck fails | App didn't start | Check critical env vars are set |
| "Invalid input: expected string" | Missing environment variable | Add to Railway Variables |
| Slow first build | First npm install | Normal (2-3 min), caches after |
| "Cannot find module" | Module not installed | Check package.json has dependency |
| Port conflicts | Hardcoded port | Use `process.env.PORT` or fall back |

---

## Commits Related to Deployment

```
16d3934 Switch to Railpack builder (Railway's modern deployment system)
d3ff3b2 Add documentation for Dockerfile cache issue resolution
14a4f92 Explicit NIXPACKS build with buildCommand for Railway
ac04527 Add Procfile and .railway.yaml for clearer Railway configuration
aa1284b Switch to NIXPACKS builder for Railway deployment
cfe6244 Fix Docker build: copy compiled app from correct monorepo dist path
fe4d421 Fix Railway deployment: use compiled JavaScript instead of TypeScript
```

---

## Next Steps

1. **Set Environment Variables** in Railway dashboard
2. **Trigger Redeploy** to build with Railpack
3. **Monitor logs** - watch for RAILPACK builder messages
4. **Verify deployment** - check health endpoint
5. **Test the API** - call endpoints to verify functionality

**Expected deployment time**: 2-3 minutes for first build, 30-60 sec for subsequent

---

## FAQ

**Q: Why Railpack over Nixpacks?**
A: Railpack is Railway's modern system with better monorepo support, faster builds, and better caching.

**Q: Do I need Dockerfile?**
A: No! Railpack handles everything automatically.

**Q: How long does deployment take?**
A: First time ~2-3 min (npm install + build), subsequent ~30-60 sec.

**Q: Can I use Docker if I want?**
A: Not recommended. Railpack is simpler and works better for this project.

**Q: What if Railpack fails?**
A: Fall back to Nixpacks by changing `"builder": "RAILPACK"` to `"builder": "NIXPACKS"`.

**Q: Do I need .railway.yaml and railway.json?**
A: Only need one. railway.json (JSON) is simpler and recommended.

