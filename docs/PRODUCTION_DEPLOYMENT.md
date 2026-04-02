# TreasuryOS Microservices - Production Deployment Guide

## Overview

TreasuryOS is a NestJS monorepo with multiple microservices ready for Railway deployment:

- **api-gateway** (port 3001) - Main API entry point
- **kyc-service** (port 3002) - KYC/AML verification
- **bank-adapter** (port 3003) - Bank integration adapter
- **reporter** (port 3004) - Reporting and analytics

All services follow 12-factor app principles and are configured for production environments.

## Production Setup Complete ✅

### What Was Done

#### 1. **All Services Now Have Production Scripts**
```bash
npm run start:prod --workspace=@treasuryos/api-gateway
npm run start:prod --workspace=@treasuryos/kyc-service
npm run start:prod --workspace=@treasuryos/bank-adapter
npm run start:prod --workspace=@treasuryos/reporter
```

Each service uses tsx to compile TypeScript at runtime:
```
node ../../node_modules/tsx/dist/cli.mjs src/main.ts
```

#### 2. **Engine Specifications**
All services require Node.js >=22.0.0
```json
"engines": {
  "node": ">=22.0.0"
}
```

#### 3. **Global Error Handling**
All services now catch uncaught exceptions and unhandled rejections:
```typescript
process.on('uncaughtException', (err: Error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Fatal error', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled rejection', reason instanceof Error ? reason.stack : String(reason));
  process.exit(1);
});
```

#### 4. **Environment Variable Handling**

**KYC Service** - Uses Zod schema:
```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).optional(),
  KYC_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(3002),
});
```

**Reporter & Bank Adapter** - Skip .env file loading in production:
```typescript
const fileEnv = process.env.NODE_ENV === 'production' ? {} : loadDotEnvFile(path.join(repoRoot, '.env'));
```

#### 5. **Bootstrap Logging**
All services log startup with consistent format:
```
[Bootstrap] Service listening on http://localhost:PORT/api/health [production]
```

### Port Configuration

Each service has a default port and supports Railway's `PORT` environment variable:

| Service | Default | Env Var | Notes |
|---------|---------|---------|-------|
| api-gateway | 3001 | PORT | Uses LISTEN_PORT originally |
| kyc-service | 3002 | KYC_SERVICE_PORT or PORT | Prefers PORT (Railway standard) |
| bank-adapter | 3003 | BANK_ADAPTER_PORT or PORT | Prefers PORT |
| reporter | 3004 | REPORTER_PORT or PORT | Prefers PORT |

### Railway Configuration Strategy

To deploy each service on Railway, create separate railway.json for each, or:

**Option A: Individual Services (Recommended)**
Create separate Railway projects for each service, each with:
```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci --include=dev && npm run build --workspace=@treasuryos/SERVICE_NAME",
    "buildEnv": {
      "BP_DISABLE_RUST": "true",
      "BP_DISABLE_RUST_TOOLCHAIN": "true",
      "NODE_ENV": "production"
    }
  },
  "deploy": {
    "startCommand": "npm run start:prod --workspace=@treasuryos/SERVICE_NAME",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60,
    "environment": "production"
  }
}
```

Committed service configs now live at:
- `infra/railway/kyc-service.railway.json`
- `infra/railway/bank-adapter.railway.json`
- `infra/railway/reporter.railway.json`

**Option B: Monorepo Single Service (Current)**
Keep the current railway.json approach with single service per Railway project.

### Health Checks

All services expose `/api/health` endpoint:
- Returns 200 OK if service is healthy
- Returns 500 if service encountered errors
- Railway monitors this for deployment health

The API gateway also exposes:
- `/api/health/live` for process liveness
- `/api/health/ready` for dependency readiness, including Solana wallet-sync checks when live sync is enabled

For the Solana beta testnet path:
1. keep `SOLANA_SYNC_ENABLED=false`
2. set `SOLANA_RPC_URL=https://api.testnet.solana.com`
3. set `SOLANA_NETWORK=testnet`
4. set `PROGRAM_ID_WALLET_WHITELIST` to the real deployed testnet program id
5. generate `AUTHORITY_KEYPAIR_JSON` with `npm run solana:keypair:export -- ~/.config/solana/id.json`
6. confirm `/api/health/ready` is green before any canary approval

### Error Handling Features

1. **Startup Errors** - Exit with code 1 on bootstrap failure
2. **Unhandled Exceptions** - Caught and logged before exit
3. **Promise Rejections** - Caught and logged before exit
4. **Request Timeouts** - Handled by NestJS platform-express

### Local Development

Start any service in development mode:
```bash
npm run dev --workspace=@treasuryos/api-gateway
npm run dev --workspace=@treasuryos/kyc-service
npm run dev --workspace=@treasuryos/bank-adapter
npm run dev --workspace=@treasuryos/reporter
```

Each service watches for file changes and automatically recompiles.

### Production Environment Variables

#### Required for All Services
- `NODE_ENV=production` - Set by Railway buildEnv
- `PORT` - Injected by Railway (3001-3004 range)

#### Service-Specific Variables

**api-gateway:**
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_TOKEN_SECRET` - JWT signing secret (32+ chars)
- `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_COMPLIANCE_EMAIL`, `DEFAULT_COMPLIANCE_PASSWORD`
- `DEFAULT_AUDITOR_EMAIL`, `DEFAULT_AUDITOR_PASSWORD`

**kyc-service:**
- (Check src/config/env.ts for required vars)

**bank-adapter:**
- (Check src/config/env.ts for required vars)

**reporter:**
- (Check src/config/env.ts for required vars)

### Deployment Checklist

- [ ] Create Railway project for each microservice
- [ ] Configure environment variables in Railway dashboard
- [ ] Set buildCommand to specific service
- [ ] Set startCommand to specific service  
- [ ] Verify healthcheck passes (status 200)
- [ ] Monitor logs for [Bootstrap] messages
- [ ] Test service endpoints with auth tokens
- [ ] Configure DNS/networking between services if needed

### Troubleshooting

**Service won't start:**
1. Check logs for [Bootstrap] error messages
2. Verify all required environment variables are set
3. Check NODE_ENV is set to "production"
4. Verify PORT environment variable is available

**Health check fails (401 Unauthorized):**
1. Check if service has @Public() decorator support
2. Verify jwt guard is configured correctly
3. Check for authentication middleware blocking health endpoint

**Service crashes after startup:**
1. Look for unhandled exceptions in logs
2. Check unhandled promise rejections
3. Verify database connections work
4. Check external service availability (APIs, databases)

### Notes

- All services use tsx for runtime TypeScript compilation
- No pre-compiled dist/ files needed in production
- Each service is independently deployable
- Services can be deployed to different Railway projects
- Services communicate via HTTP (configure URLs in env vars)
- All services follow consistent error handling patterns
