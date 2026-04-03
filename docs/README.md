# TreasuryOS Documentation Index

## 📖 Main Documentation Files

### Deployment & Configuration

1. **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** ⭐ START HERE
2. **[reports/README.md](reports/README.md)** ⭐ Reports archive index
3. **[LANDING_PAGE_REPORT.md](reports/LANDING_PAGE_REPORT.md)** ⭐ Landing Page & Lead Capture Overview
   - Implementation summary
   - Bug & Risk report
   - Security hardening strategy
4. **[LANDING_PAGE_REDESIGN_PROCESS.md](LANDING_PAGE_REDESIGN_PROCESS.md)** ⭐ Redesign Overview
5. **[LANDING_PAGE_REFINEMENT.md](LANDING_PAGE_REFINEMENT.md)** ⭐ Refinement & CI/CD Overview
6. **[LANDING_PAGE_REDESIGN_V3.md](LANDING_PAGE_REDESIGN_V3.md)** ⭐ V3 Institutional Redesign
   - Ground-up visual transformation
   - Bento grid & Obsidian design system
7. **[ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)** ⭐ REQUIRED FOR SETUP
   - Complete environment variable reference
   - Required vs optional for each service
   - Security best practices
   - Railway deployment guide
   - Local development examples
   - Validation rules explained

8. **[ENV_VAR_QUICK_REFERENCE.md](ENV_VAR_QUICK_REFERENCE.md)** ⭐ QUICK LOOKUP
    - Quick reference tables
    - Copy-paste .env templates
    - Common connection strings
    - Port resolution strategy

9. **[SERVICES_QUICK_REFERENCE.md](SERVICES_QUICK_REFERENCE.md)** ⭐ COMMANDS
    - Start any service locally
    - Build commands
    - Health check tests
    - Port reference table
    - Railway deployment template

10. **[guides/README.md](guides/README.md)** ⭐ OPERATOR GUIDES
      - Manual step-by-step guides for user-owned work
      - AI advisory enablement & operation guide
      - Real LLM provider setup guide
      - Audit firm primer
      - Protocol audit engagement guide
      - Testnet environment setup guide
      - Auditor handoff & kickoff guide
11. **[reports/AI_ADVISORY_FOUNDATION_REPORT.md](reports/AI_ADVISORY_FOUNDATION_REPORT.md)** ⭐ AI DELIVERY REPORT
     - What shipped in the first AI slice
     - Safety boundaries and rollout posture
     - Validation commands and follow-up recommendations
12. **[reports/AI_REAL_LLM_IMPLEMENTATION_REPORT.md](reports/AI_REAL_LLM_IMPLEMENTATION_REPORT.md)** ⭐ REAL LLM REPORT
    - What shipped in the OpenAI-compatible provider phase
    - Fallback, feedback, and runtime configuration
    - Validation evidence and live rollout checklist
13. **[plans/REAL_LLM_INTEGRATION_PLAN.md](plans/REAL_LLM_INTEGRATION_PLAN.md)** ⭐ NEXT AI PHASE
    - Detailed plan for integrating a real external provider
    - Management workflow from planning through maintenance
    - Provider, security, rollout, and feedback requirements
14. **[thoughts/brainstorm.md](thoughts/brainstorm.md)** ⭐ STRATEGIC THOUGHTS
     - What happens if TreasuryOS builds the AI layer first
     - Whether audit/manual work can be deferred
     - Whether the AI layer can act like an internal audit function
    - See also: `thoughts/ai-layer-as-audit-firm-study.md`
    - See also: `thoughts/ai-growth-recommendations.md`

---

## 🏗️ Architecture & Services

### API Gateway (Port 3001)
**Purpose:** Main API entry point for compliance & treasury operations

**Key Features:**
- JWT authentication
- User role management (Admin, Compliance, Auditor)
- Database-backed (PostgreSQL)
- Solana wallet whitelist integration
- KYC/AML provider integration
- Redis caching
- Supabase file storage

**Required Env Vars:**
```
DATABASE_URL (PostgreSQL)
AUTH_TOKEN_SECRET (32+ chars)
SOLANA_RPC_URL
PROGRAM_ID_WALLET_WHITELIST
DEFAULT_{ADMIN,COMPLIANCE,AUDITOR}_{EMAIL,PASSWORD}
```

---

### KYC Service (Port 3002)
**Purpose:** Know-Your-Customer verification & compliance registry

**Key Features:**
- On-chain compliance registry sync
- Solana integration
- Support for SumSub & Jumio KYC providers
- Entity KYC status tracking

**Required Env Vars:**
```
SOLANA_RPC_URL
PROGRAM_ID_COMPLIANCE_REGISTRY (32+ chars)
```

**Optional:** KYC provider credentials (SumSub, Jumio)

---

### Bank Adapter (Port 3003)
**Purpose:** Bank integration & counterparty verification

**Key Features:**
- AMINA bank API integration
- Counterparty verification
- Compliance checking

**Required Env Vars:**
```
(Minimal - only NODE_ENV=production)
```

**Optional:** AMINA credentials

---

### Reporter Service (Port 3004)
**Purpose:** Regulatory reporting & compliance reports

**Key Features:**
- MICA (EU crypto regulation) reporting
- Monthly report generation
- Report scheduling

**Required Env Vars:**
```
(Minimal - only NODE_ENV=production)
```

---

## 🚀 Quick Start Guide

### 1. Local Development
```bash
# Install dependencies
npm install

# Start all services in separate terminals
npm run dev --workspace=@treasuryos/api-gateway    # Terminal 1
npm run dev --workspace=@treasuryos/kyc-service    # Terminal 2
npm run dev --workspace=@treasuryos/bank-adapter   # Terminal 3
npm run dev --workspace=@treasuryos/reporter       # Terminal 4

# Test health endpoints
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health
curl http://localhost:3003/api/health
curl http://localhost:3004/api/health
```

### 2. Production Setup on Railway
1. Go to railway.app
2. Create project for each service
3. Set environment variables (see ENV_VAR_QUICK_REFERENCE.md)
4. Deploy
5. Monitor /api/health endpoints

### 3. Environment Variables
- **Development:** Use `.env` file
- **Railway:** Use Railway Dashboard → Variables
- **See:** ENVIRONMENT_VARIABLES.md for complete reference

---

## 📋 Environment Variables by Service

### API Gateway
**Required (11 variables)**
- NODE_ENV, AUTH_TOKEN_SECRET, DATABASE_URL
- 3x user seeds (admin, compliance, auditor)
- SOLANA_RPC_URL, PROGRAM_ID_WALLET_WHITELIST

**Recommended Optional (6 variables)**
- Redis, Supabase, Sentry, signer configuration

### KYC Service
**Required (3 variables)**
- NODE_ENV, SOLANA_RPC_URL, PROGRAM_ID_COMPLIANCE_REGISTRY

**Optional (5 variables)**
- SumSub & Jumio credentials

### Bank Adapter
**Required (1 variable)**
- NODE_ENV

**Optional (2 variables)**
- AMINA credentials

### Reporter
**Required (1 variable)**
- NODE_ENV

---

## 🔒 Security Checklist

- [ ] Generated strong AUTH_TOKEN_SECRET (32+ chars)
- [ ] Generated strong SUPABASE_JWT_SECRET if using (32+ chars)
- [ ] All passwords 8+ characters
- [ ] Database credentials not in git
- [ ] Secrets stored in Railway Variables (not code)
- [ ] Different secrets for dev/staging/production
- [ ] SSL enabled for database connections
- [ ] CORS properly configured (FRONTEND_URL)
- [ ] Error tracking enabled (SENTRY_DSN)

---

## 📚 Additional Resources

### Configuration Files
- `railway.json` - Primary deployment config (RAILPACK builder)
- `.railway.yaml` - Backup YAML config
- `apps/*/package.json` - Service-specific scripts

### Key Commands
```bash
# Build all services
npm run build --workspace=@treasuryos/api-gateway
npm run build --workspace=@treasuryos/kyc-service
npm run build --workspace=@treasuryos/bank-adapter
npm run build --workspace=@treasuryos/reporter

# Type checking
npm run typecheck --workspace=@treasuryos/api-gateway

# Production start
npm run start:prod --workspace=@treasuryos/api-gateway
PORT=3002 npm run start:prod --workspace=@treasuryos/kyc-service
```

### Error Handling
All services implement:
- Global uncaught exception handlers
- Unhandled promise rejection handlers
- Bootstrap logging with [Bootstrap] prefix
- Graceful shutdown on errors

---

## 🐛 Troubleshooting

### Service won't start
1. Check for [Bootstrap] error messages in logs
2. Verify all required environment variables are set
3. Confirm NODE_ENV is set to "production"
4. Check PORT environment variable is available

### Health check returns 401
- Ensure /api/health is in public routes list
- Check JWT guard configuration
- Verify no authentication middleware on health endpoint

### Database connection fails
- Check DATABASE_URL format
- Verify database is running/accessible
- Check SSL settings (DATABASE_SSL env var)
- Ensure firewall allows connections

### Service crashes after startup
- Check for unhandled exceptions in logs
- Verify external service connectivity (APIs, databases)
- Check environment variable values are valid
- Review application logs for specific errors

---

## 📊 Monitoring & Logs

### Railway Dashboard
- Deployments tab: View build/deploy history
- Logs tab: Real-time application logs
- Variables tab: Manage environment variables
- Metrics tab: CPU, memory, bandwidth usage

### Health Checks
All services expose `/api/health` endpoint:
- Returns 200 if service is healthy
- Returns 500 if service has errors
- Railway monitors this for automatic restarts

### Bootstrap Logging
All services log startup message:
```
[Bootstrap] Service listening on http://localhost:PORT/api/health [NODE_ENV]
```

---

## 🔗 Related Documentation

### Issues & Solutions
- `docs/issues/JWT_GUARD_PUBLIC_ROUTES_FIX.md` - Health endpoint 401 fix
- `docs/issues/PRODUCTION_DEPLOYMENT.md` - Deployment solutions
- `docs/issues/SILENT_STARTUP_FAILURE_FIX.md` - Database initialization fix

### Previous Deployment Attempts
- `docs/issues/DEPLOYMENT_COMPARISON.md` - Docker vs NIXPACKS vs RAILPACK
- `docs/issues/RUST_DETECTION_FIX.md` - Build configuration issues
- `docs/issues/NPM_NOT_FOUND_FIX.md` - npm availability in production

---

## ✅ Deployment Status

- ✅ All 4 microservices production-ready
- ✅ Environment variables documented
- ✅ Health endpoints configured
- ✅ Error handling implemented
- ✅ Railway configuration ready
- ✅ Local development setup verified
- ✅ Build process validated
- ⏳ Ready for Railway deployment

---

## 📞 Support

For detailed information on:
- **Environment setup** → ENVIRONMENT_VARIABLES.md
- **Quick commands** → SERVICES_QUICK_REFERENCE.md
- **Production deployment** → PRODUCTION_DEPLOYMENT.md
- **Table reference** → ENV_VAR_QUICK_REFERENCE.md

All documentation is in the `docs/` directory of the repository.
