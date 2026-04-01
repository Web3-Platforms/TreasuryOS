# Production Services Quick Reference

## Start Any Service Locally

```bash
# Development (with file watchers)
npm run dev --workspace=@treasuryos/api-gateway
npm run dev --workspace=@treasuryos/kyc-service
npm run dev --workspace=@treasuryos/bank-adapter
npm run dev --workspace=@treasuryos/reporter

# Production (run after `npm run build --workspace=...`)
npm run start:prod --workspace=@treasuryos/api-gateway
npm run start:prod --workspace=@treasuryos/kyc-service
npm run start:prod --workspace=@treasuryos/bank-adapter
npm run start:prod --workspace=@treasuryos/reporter
```

## Default Ports

| Service | Port |
|---------|------|
| api-gateway | 3001 |
| kyc-service | 3002 |
| bank-adapter | 3003 |
| reporter | 3004 |

Override with `PORT` environment variable:
```bash
PORT=8080 npm run start:prod --workspace=@treasuryos/api-gateway
```

## Health Checks

All services expose health endpoint:
```bash
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health
curl http://localhost:3003/api/health
curl http://localhost:3004/api/health
```

## Build All Services

```bash
npm run build --workspace=@treasuryos/api-gateway --workspace=@treasuryos/kyc-service --workspace=@treasuryos/bank-adapter --workspace=@treasuryos/reporter
```

Or build individual:
```bash
npm run build --workspace=@treasuryos/api-gateway
```

## Railway Deployment

Each service needs individual Railway config. Ready-to-use service configs live at:

- `infra/railway/kyc-service.railway.json`
- `infra/railway/bank-adapter.railway.json`
- `infra/railway/reporter.railway.json`

Underlying format:

```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci --include=dev && npm run build --workspace=@treasuryos/SERVICE_NAME",
    "buildEnv": {
      "BP_DISABLE_RUST": "true",
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

Replace `SERVICE_NAME` with:
- `api-gateway`
- `kyc-service`
- `bank-adapter`
- `reporter`

## Environment Variables

**All services:**
- `NODE_ENV=production` (set by Railway)
- `PORT` (injected by Railway)

**api-gateway specific:**
- `DATABASE_URL`
- `AUTH_TOKEN_SECRET`
- `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_COMPLIANCE_EMAIL`, `DEFAULT_COMPLIANCE_PASSWORD`
- `DEFAULT_AUDITOR_EMAIL`, `DEFAULT_AUDITOR_PASSWORD`

## Node.js Requirement

All services require Node.js >=22.0.0

Railway automatically provides compatible Node.js version.

## Error Handling

All services automatically handle:
- Uncaught exceptions
- Unhandled promise rejections
- Startup failures

Errors are logged and process exits gracefully.

## Type Checking

```bash
npm run typecheck --workspace=@treasuryos/api-gateway
npm run typecheck --workspace=@treasuryos/kyc-service
npm run typecheck --workspace=@treasuryos/bank-adapter
npm run typecheck --workspace=@treasuryos/reporter
```
