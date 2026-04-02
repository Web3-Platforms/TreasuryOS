# TreasuryOS - Environment Variables by Microservice

## 📋 Quick Summary

| Service | Required | Optional | Default Port |
|---------|----------|----------|--------------|
| dashboard | API_BASE_URL | KYC flag, demo access, Sentry | Vercel |
| api-gateway | DATABASE_URL, AUTH_TOKEN_SECRET, seed users | Redis, Supabase, Sentry, KYC/Solana options | 3001 |
| kyc-service | SOLANA_RPC_URL, PROGRAM_ID_COMPLIANCE_REGISTRY | KYC providers, SOLANA_NETWORK | 3002 |
| bank-adapter | None | AMINA_API_URL, AMINA_API_KEY | 3003 |
| reporter | None | None | 3004 |

---

## 🔧 1. API Gateway (port 3001)

### Required Variables

```env
# ── Core Configuration ──────────────────────────────────────────
NODE_ENV=production
AUTH_TOKEN_SECRET=your-32-char-secret-key-min-length        # Must be 32+ chars for JWT signing
AUTH_TOKEN_TTL_MINUTES=480                                   # Token validity: 15-10080 min (default 480)

# ── Database (PostgreSQL) ───────────────────────────────────
DATABASE_URL=postgresql://user:password@host:5432/treasury_os

# ── Seed Users (Must provide all 6) ────────────────────────
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=SecurePassword123                     # Min 8 chars
DEFAULT_COMPLIANCE_EMAIL=compliance@example.com
DEFAULT_COMPLIANCE_PASSWORD=SecurePassword123                # Min 8 chars
DEFAULT_AUDITOR_EMAIL=auditor@example.com
DEFAULT_AUDITOR_PASSWORD=SecurePassword123                   # Min 8 chars

# ── Solana Configuration ────────────────────────────────────
PROGRAM_ID_WALLET_WHITELIST=YourSolana32CharProgramId123456  # 32+ chars
```

### Optional Variables

```env
# ── Port Configuration (Railway) ───────────────────────────
PORT=3001                                      # Used by Railway only
API_GATEWAY_PORT=3001                          # Local fallback

# ── CORS ─────────────────────────────────────────────────
FRONTEND_URL=https://app.example.com           # For CORS headers

# ── Solana RPC ───────────────────────────────────────────
SOLANA_RPC_URL=https://api.devnet.solana.com   # Local default; use testnet for beta launch
SOLANA_NETWORK=devnet                          # Optional cluster label; set testnet for beta launch
SOLANA_SIGNING_MODE=filesystem                 # Options: filesystem, environment
AUTHORITY_KEYPAIR_PATH=path/to/keypair.json    # For filesystem signing
AUTHORITY_KEYPAIR_JSON=[1,2,3,...]             # For Railway-injected signer material
SOLANA_SYNC_ENABLED=false                      # Enable on-chain sync
SQUADS_MULTISIG_ENABLED=false                  # Enable multisig
SQUADS_MULTISIG_ADDRESS=YourSquadsAddress      # If multisig enabled

# ── Redis / Upstash ─────────────────────────────────────
REDIS_URL=redis://localhost:6379               # Local Redis
REDIS_QUEUE_ENABLED=true
REDIS_QUEUE_NAME=treasuryos:events
UPSTASH_REDIS_REST_URL=https://your-upstash.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token            # For cloud deployments

# ── Database SSL ─────────────────────────────────────────
DATABASE_SSL=false                             # Enable for managed databases

# ── KYC Providers ───────────────────────────────────────
KYC_SUMSUB_ENABLED=false                        # Keep false for the first pilot launch
SUMSUB_APP_TOKEN=your-app-token
SUMSUB_SECRET_KEY=your-secret-key
SUMSUB_WEBHOOK_SECRET=your-webhook-secret
SUMSUB_LEVEL_NAME=basic-kyc-level              # Default: basic-kyc-level

# ── Supabase (Storage & Auth) ───────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_STORAGE_BUCKET=compliance-documents
SUPABASE_JWT_SECRET=your-jwt-secret            # Min 32 chars

# ── Sentry Error Tracking ──────────────────────────────
SENTRY_DSN=https://key@sentry.io/project-id

# ── Pilot/Test Configuration ───────────────────────────
PILOT_REPORTS_DIR=data/reports                 # Reports storage directory
PILOT_INSTITUTION_ID=pilot-eu-casp
PILOT_INSTITUTION_NAME=TreasuryOS Pilot Institution
PILOT_CUSTOMER_PROFILE=eu-regulated-casp

# ── Railway (Auto-injected) ────────────────────────────
RAILWAY_ENVIRONMENT=production                 # Read-only, auto-set
```

### Beta testnet Railway sequence

For the first real Solana beta rollout, use this API-service sequence:

1. Generate a one-line Railway secret from a local Solana CLI keypair:
   - `npm run solana:keypair:export -- ~/.config/solana/id.json`
2. Use the template at `infra/railway/api-gateway.testnet.env.example`.
3. Set these API variables in Railway:
   - `SOLANA_RPC_URL=https://api.testnet.solana.com`
   - `SOLANA_NETWORK=testnet`
   - `PROGRAM_ID_WALLET_WHITELIST=<real testnet program id>`
   - `SOLANA_SIGNING_MODE=environment`
   - `AUTHORITY_KEYPAIR_JSON=<single-line json array>`
   - `SOLANA_SYNC_ENABLED=false`
   - `SQUADS_MULTISIG_ENABLED=false`
4. Redeploy while sync stays disabled.
5. Verify:
   - `GET /api/health`
   - `GET /api/health/live`
   - `GET /api/health/ready`
6. Only after readiness is green and the deployed program is confirmed should `SOLANA_SYNC_ENABLED=true` be considered.

---

## 🖥️ 2. Dashboard (Vercel)

### Required Variables

```env
# Server-side dashboard → API wiring
API_BASE_URL=https://api.example.com/api
```

### Optional Variables

```env
# Keep false for the pilot launch unless Sumsub is intentionally enabled.
KYC_SUMSUB_ENABLED=false

# Demo access only works when all three values are provided.
DEMO_ACCESS_ENABLED=false
DEMO_ACCESS_EMAIL=demo@example.com
DEMO_ACCESS_PASSWORD=replace-with-demo-password

# Sentry for dashboard server/client runtimes
SENTRY_DSN=https://key@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project-id
```

### Notes

- The dashboard uses `API_BASE_URL`, not `NEXT_PUBLIC_API_BASE_URL`.
- `KYC_SUMSUB_ENABLED` is read by both the dashboard and the API so the launch posture stays consistent.
- Leave demo access disabled unless you explicitly want a public demo login path.

---

## 🔐 3. KYC Service (port 3002)

### Required Variables

```env
# ── Core Configuration ──────────────────────────────────────────
NODE_ENV=production
SOLANA_RPC_URL=https://api.devnet.solana.com   # Local default; use testnet for beta launch
PROGRAM_ID_COMPLIANCE_REGISTRY=YourProgram32CharId123456789  # 32+ chars
```

### Optional Variables

```env
# ── Port Configuration (Railway) ───────────────────────────
PORT=3002                                      # Used by Railway only
KYC_SERVICE_PORT=3002                          # Local fallback

# ── Solana RPC Labels ─────────────────────────────────────
SOLANA_NETWORK=devnet                          # Optional label, defaults to devnet

# ── KYC Providers ───────────────────────────────────────
SUMSUB_APP_TOKEN=your-app-token                # For SumSub KYC
SUMSUB_SECRET_KEY=your-secret-key

JUMIO_API_TOKEN=your-api-token                 # For Jumio KYC
JUMIO_API_SECRET=your-api-secret
JUMIO_WORKFLOW_ID=your-workflow-id
```

### Environment Detection

The KYC Service automatically:
- Checks `PORT` first (from Railway)
- Falls back to `KYC_SERVICE_PORT` if PORT not set
- Defaults to `3002` if neither is set

---

## 🏦 4. Bank Adapter (port 3003)

### Required Variables

```env
# ── Core Configuration ──────────────────────────────────────────
NODE_ENV=production
```

### Optional Variables

```env
# ── Port Configuration (Railway) ───────────────────────────
PORT=3003                                      # Used by Railway only
BANK_ADAPTER_PORT=3003                         # Local fallback

# ── AMINA Bank Integration ─────────────────────────────
AMINA_API_URL=https://api.aminabank.example/v1 # AMINA endpoint
AMINA_API_KEY=your-amina-api-key               # Bearer token

# ── Additional Bank APIs ───────────────────────────────
# Add more as services are integrated
```

### Environment Detection

The Bank Adapter automatically:
- Checks `PORT` first (from Railway)
- Falls back to `BANK_ADAPTER_PORT` if PORT not set
- Defaults to `3003` if neither is set

---

## 📊 5. Reporter Service (port 3004)

### Required Variables

```env
# ── Core Configuration ──────────────────────────────────────────
NODE_ENV=production
```

### Optional Variables

```env
# ── Port Configuration (Railway) ───────────────────────────
PORT=3004                                      # Used by Railway only
REPORTER_PORT=3004                             # Local fallback
```

### Environment Detection

The Reporter automatically:
- Checks `PORT` first (from Railway)
- Falls back to `REPORTER_PORT` if PORT not set
- Defaults to `3004` if neither is set

### Capabilities

Currently supports:
- MICA (EU Market in Crypto-assets Regulation) reporting
- Monthly report generation

---

## 🔐 6. GitHub Actions / Deployment Secrets

These values are configured as repository **Actions secrets** in GitHub, not as
runtime variables inside Railway or Vercel.

### Required Secrets

```env
RAILWAY_TOKEN=your-railway-project-token         # Required by .github/workflows/cd.yml deploy-api
NEON_DATABASE_URL=postgresql://...               # Required by .github/workflows/cd.yml migrate-neon
```

### Notes

- Add them in **GitHub → Repository → Settings → Secrets and variables → Actions**.
- `RAILWAY_TOKEN` should be created as a Railway **Project Token** from the target project's settings.
- `RAILWAY_API_TOKEN` is the separate account/workspace token name for account-level Railway API access and is not used by this workflow.
- `NEON_DATABASE_URL` is only used when changes under `infra/db/migrations/`
  trigger the migration job on `main`.

---

## 🚀 Railway Deployment Guide

### How Railway Sets Environment Variables

1. **Auto-injected by Railway:**
   - `PORT` - The port your app must listen on (always set)
   - `RAILWAY_ENVIRONMENT` - The environment name (production, staging, etc.)

2. **Set in Railway Dashboard:**
   - Navigate to your Railway project
   - Go to "Variables" tab
   - Add all required and optional variables

3. **Priority Order (how variables are resolved):**
   ```
   Railway Dashboard Variables > Service ENV file > Defaults in code
   ```

### Example Railway Setup

For **api-gateway**:
```
NODE_ENV = production
AUTH_TOKEN_SECRET = your-super-secret-key-32-chars-long
DATABASE_URL = postgresql://user:pass@neon.tech/db
KYC_SUMSUB_ENABLED = false
DEFAULT_ADMIN_EMAIL = admin@treasuryos.example
DEFAULT_ADMIN_PASSWORD = AdminPass123!
DEFAULT_COMPLIANCE_EMAIL = compliance@treasuryos.example
DEFAULT_COMPLIANCE_PASSWORD = CompliancePass123!
DEFAULT_AUDITOR_EMAIL = auditor@treasuryos.example
DEFAULT_AUDITOR_PASSWORD = AuditorPass123!
SOLANA_RPC_URL = https://api.devnet.solana.com
PROGRAM_ID_WALLET_WHITELIST = YourProgramId32CharsLongHere123456
SUPABASE_JWT_SECRET = your-jwt-secret-min-32-chars-long
```

---

## 🔒 Security Best Practices

### Secret Generation

```bash
# Generate AUTH_TOKEN_SECRET (32+ chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SUPABASE_JWT_SECRET (32+ chars)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Do NOT

❌ Commit `.env` files to git
❌ Put secrets in code
❌ Use weak passwords (min 8 chars, but use complex)
❌ Reuse tokens across environments

### DO

✅ Use Railway's dashboard to set variables
✅ Use different secrets for prod vs dev
✅ Rotate secrets regularly
✅ Use at least 32 characters for token secrets

---

## 🧪 Local Development Setup

Create `.env` file in repository root:

```env
# Development defaults (can override per app)
NODE_ENV=development

# ── API Gateway ──────────────────────────────────────────
API_GATEWAY_PORT=3001
AUTH_TOKEN_SECRET=dev-secret-key-longer-than-32-characters
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/treasury_os_dev
DEFAULT_ADMIN_EMAIL=admin@local.test
DEFAULT_ADMIN_PASSWORD=AdminPass123
DEFAULT_COMPLIANCE_EMAIL=compliance@local.test
DEFAULT_COMPLIANCE_PASSWORD=CompliancePass123
DEFAULT_AUDITOR_EMAIL=auditor@local.test
DEFAULT_AUDITOR_PASSWORD=AuditorPass123
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PROGRAM_ID_WALLET_WHITELIST=YourProgramIdHere123456789012345

# ── KYC Service ──────────────────────────────────────────
KYC_SERVICE_PORT=3002
SOLANA_NETWORK=devnet
PROGRAM_ID_COMPLIANCE_REGISTRY=YourComplianceProgramId123456789012345

# ── Bank Adapter ─────────────────────────────────────────
BANK_ADAPTER_PORT=3003
# AMINA_API_URL=https://api.aminabank.example/v1
# AMINA_API_KEY=dev-key

# ── Reporter ─────────────────────────────────────────────
REPORTER_PORT=3004

# ── Optional Services ────────────────────────────────────
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret-dev
```

---

## 📝 Validation Rules

### api-gateway
- `AUTH_TOKEN_SECRET`: 32+ chars (Zod validation)
- `AUTH_TOKEN_TTL_MINUTES`: 15-10080 (Zod validation)
- `DEFAULT_*_EMAIL`: Valid email format
- `DEFAULT_*_PASSWORD`: Min 8 chars
- `PROGRAM_ID_WALLET_WHITELIST`: Min 32 chars
- `SUPABASE_JWT_SECRET`: 32+ chars (if set)

### kyc-service
- `SOLANA_RPC_URL`: Valid URL
- `PROGRAM_ID_COMPLIANCE_REGISTRY`: Min 32 chars

### bank-adapter
- No strict validation (all optional)

### reporter
- No strict validation (all optional)

---

## 🧩 Microservice Communication

If services need to communicate with each other:

```env
# Add service URLs as environment variables
KYC_SERVICE_URL=http://localhost:3002
BANK_ADAPTER_URL=http://localhost:3003
REPORTER_URL=http://localhost:3004
```

Then in code:
```typescript
const kycResponse = await axios.get(`${process.env.KYC_SERVICE_URL}/api/verify`);
```

---

## 📚 Additional Resources

- **Zod Documentation:** https://zod.dev
- **Railway Docs:** https://docs.railway.app
- **Solana RPC:** https://solana.com/rpc
- **Supabase Docs:** https://supabase.com/docs
- **Sentry Docs:** https://docs.sentry.io
