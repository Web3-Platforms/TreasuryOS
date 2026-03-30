# Railway Deployment using Railpack (Recommended)

## What is Railpack?

**Railpack** is Railway's modern, native build system that:
- Auto-detects your project type (Node.js, Python, Go, Ruby, etc.)
- Intelligently handles monorepos
- Replaces the older Nixpacks system
- Provides faster, more reliable builds
- Handles environment detection automatically

## Configuration

### `railpack.json` (Repo Root)
```json
{
  "$schema": "https://schema.railway.com/railpack.json",
  "providers": ["node"]
}
```
This explicitly tells Railpack to use Node.js provider.

### `railway.json` (Deployment Config)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
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

### `.railway.yaml` (Alternative Format)
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

### `Procfile` (Process Definition)
```
web: npm run start:prod --workspace=@treasuryos/api-gateway
```

## How Railpack Works for TreasuryOS

### Build Phase (Automatic)
1. Railpack detects Node.js from `package.json` engines: `"node": ">=22.0.0"`
2. Installs Node 22.x and npm 10.x
3. Runs: `npm install` (respects workspaces)
4. App is ready to run

### Deploy Phase
1. Starts container with environment variables from Railway dashboard
2. Runs: `npm run start:prod --workspace=@treasuryos/api-gateway`
3. This executes:
   ```bash
   node ../../node_modules/tsx/dist/cli.mjs src/main.ts
   ```
4. NestJS server starts and listens on PORT (Railway-injected)
5. Healthcheck probes `/api/health` endpoint

### Runtime Environment
- **PORT**: Auto-injected by Railway (e.g., 3001, 8080)
- **NODE_ENV**: You set this in Railway dashboard (typically "production")
- **Other vars**: Set in Railway dashboard variables

## Setup Instructions

### 1. In Railway Dashboard

#### Settings → Environment
Set all required variables:

**Critical**:
```
AUTH_TOKEN_SECRET=<generate 32+ random chars with: openssl rand -hex 32>
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=<min 8 chars>
DEFAULT_COMPLIANCE_EMAIL=compliance@example.com
DEFAULT_COMPLIANCE_PASSWORD=<min 8 chars>
DEFAULT_AUDITOR_EMAIL=auditor@example.com
DEFAULT_AUDITOR_PASSWORD=<min 8 chars>
```

**Recommended**:
```
NODE_ENV=production
SUPABASE_JWT_SECRET=<generate 32+ random chars>
DATABASE_URL=<your-neon-postgres-url>
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID_WALLET_WHITELIST=<your-solana-program-id>
```

**Optional** (for specific features):
```
FRONTEND_URL=https://your-frontend.vercel.app
SENTRY_DSN=<your-sentry-dsn>
UPSTASH_REDIS_REST_URL=<redis-url>
UPSTASH_REDIS_REST_TOKEN=<redis-token>
```

#### Deploy → Redeploy
Click "Redeploy" to:
- Clear old caches
- Force Railpack builder
- Start fresh build

### 2. Monitor the Build

Watch Railway logs for these messages:

```
[inf] Detecting builder...
[inf] Using RAILPACK builder
[inf] Detecting provider...
[inf] Using Node.js provider
[inf] npm install
[inf] Starting application
[inf] npm run start:prod --workspace=@treasuryos/api-gateway
[inf] API gateway listening on http://0.0.0.0:3001/api/health [production]
```

### 3. Verify Healthcheck

Once deployed:
1. Go to Railway dashboard → Deployments
2. Check "Health" tab
3. Should show green checkmark ✅ after 10-20 seconds
4. Endpoint: `https://your-railway-url/api/health`

## Advantages of Railpack vs Nixpacks

| Feature | Railpack | Nixpacks |
|---------|----------|----------|
| Auto-detection | ✅ Better | ⚠️ Needs nixpacks.toml |
| Monorepo support | ✅ Excellent | ⚠️ Limited |
| Build speed | ✅ Faster | ⚠️ Slower |
| Cache handling | ✅ Better | ⚠️ Issues with old refs |
| Node modules optimization | ✅ Smart pruning | ⚠️ Manual |
| Error messages | ✅ Clear | ⚠️ Generic |

## Troubleshooting with Railpack

### Build fails with "npm not found"
- Check `railpack.json` has `"providers": ["node"]`
- Verify `package.json` exists at repo root
- Ensure `engines.node` is specified in package.json

### Healthcheck keeps failing
- App might not have started yet (increase timeout to 120)
- Check PORT environment variable is set
- Verify `/api/health` endpoint exists:
  ```bash
  npm run start:prod --workspace=@treasuryos/api-gateway
  curl http://localhost:3001/api/health
  ```

### Missing environment variables
- Railpack doesn't auto-load `.env` files in production
- Must set all vars in Railway dashboard → Variables
- Check logs: `[err] Invalid input: expected string, received undefined`

### Slow builds
- First build: ~2-3 minutes (installs 600+ npm packages)
- Subsequent builds: ~30-60 seconds (cached node_modules)
- Check if node_modules is being cached between builds

### Port conflicts
- Railway auto-injects PORT environment variable
- App respects it: `const port = process.env.PORT || 3001`
- Don't hardcode port numbers in code

## Testing Railpack Locally

To verify the build works before deploying:

```bash
cd /Users/ekf/Downloads/Projects/TreasuryOS

# Clean install (simulates Railway)
rm -rf node_modules package-lock.json
npm install

# Test the build
npm run build --workspace=@treasuryos/api-gateway

# Test runtime with env vars
export AUTH_TOKEN_SECRET="test-secret-minimum-32-characters-long-here"
export DEFAULT_ADMIN_EMAIL="admin@test.com"
export DEFAULT_ADMIN_PASSWORD="password123"
export DEFAULT_COMPLIANCE_EMAIL="compliance@test.com"
export DEFAULT_COMPLIANCE_PASSWORD="password123"
export DEFAULT_AUDITOR_EMAIL="auditor@test.com"
export DEFAULT_AUDITOR_PASSWORD="password123"
export NODE_ENV="production"

npm run start:prod --workspace=@treasuryos/api-gateway
```

Expected output:
```
[Nest] 12345  - 03/30/2026, 9:30:00 PM     LOG [Bootstrap] 
API gateway listening on http://0.0.0.0:3001/api/health [production]
```

Then in another terminal:
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok"}
```

## Summary

✅ Using Railpack (modern Railway builder)
✅ Auto-detects Node.js and installs dependencies
✅ Runs app via npm workspaces
✅ Proper healthchecks configured
✅ Ready for production deployment

**Deploy now**: Push to main branch → Railway auto-redeploys → Set env vars → App goes live! 🚀
