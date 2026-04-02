# Environment Variables - Quick Lookup Tables

## API Gateway (Port 3001)

### Required
| Variable | Format | Min Length | Example |
|----------|--------|-----------|---------|
| NODE_ENV | `production` | - | `production` |
| AUTH_TOKEN_SECRET | hex string | 32 chars | `a1b2c3d4e5f6...` |
| DATABASE_URL | PostgreSQL URI | - | `postgresql://user:pass@host/db` |
| DEFAULT_ADMIN_EMAIL | email | - | `admin@example.com` |
| DEFAULT_ADMIN_PASSWORD | string | 8 | `AdminP@ss123!` |
| DEFAULT_COMPLIANCE_EMAIL | email | - | `compliance@example.com` |
| DEFAULT_COMPLIANCE_PASSWORD | string | 8 | `CompP@ss123!` |
| DEFAULT_AUDITOR_EMAIL | email | - | `auditor@example.com` |
| DEFAULT_AUDITOR_PASSWORD | string | 8 | `AuditP@ss123!` |
| SOLANA_RPC_URL | HTTPS URL | - | `https://api.testnet.solana.com` |
| PROGRAM_ID_WALLET_WHITELIST | base58 | 32 | `TokenkegQfeZyiNwAJsyFbPVwwQQftsrPJ4...` |

### Recommended Optional
| Variable | Format | Purpose |
|----------|--------|---------|
| REDIS_URL | Redis URI | Caching & queues |
| SOLANA_NETWORK | `devnet`/`testnet`/`mainnet-beta`/`custom` | Solana cluster label |
| SOLANA_SIGNING_MODE | `filesystem`/`environment` | Selects signer source |
| AUTHORITY_KEYPAIR_JSON | JSON array | Railway-injected Solana signer |
| SOLANA_SYNC_ENABLED | `true`/`false` | Enables real on-chain wallet sync |
| SUPABASE_URL | HTTPS URL | File storage |
| SUPABASE_JWT_SECRET | base64 string | JWT validation |
| SUPABASE_SERVICE_KEY | string | Service access |
| SENTRY_DSN | HTTPS URL | Error tracking |

---

## KYC Service (Port 3002)

### Required
| Variable | Format | Min Length | Example |
|----------|--------|-----------|---------|
| NODE_ENV | `production` | - | `production` |
| SOLANA_RPC_URL | HTTPS URL | - | `https://api.testnet.solana.com` |
| PROGRAM_ID_COMPLIANCE_REGISTRY | base58 | 32 | `AuthProgId...` |

### Optional
| Variable | Format | Purpose |
|----------|--------|---------|
| SOLANA_NETWORK | `devnet`/`testnet`/`mainnet-beta`/`custom` | Solana cluster label |
| SUMSUB_APP_TOKEN | string | SumSub KYC |
| SUMSUB_SECRET_KEY | string | SumSub auth |
| JUMIO_API_TOKEN | string | Jumio KYC |
| JUMIO_API_SECRET | string | Jumio auth |
| JUMIO_WORKFLOW_ID | string | Jumio config |

---

## Bank Adapter (Port 3003)

### Required
| Variable | Format | Example |
|----------|--------|---------|
| NODE_ENV | `production` | `production` |

### Optional
| Variable | Format | Example |
|----------|--------|---------|
| AMINA_API_URL | HTTPS URL | `https://api.aminabank.example/v1` |
| AMINA_API_KEY | Bearer token | `eyJhbGc...` |

---

## Reporter Service (Port 3004)

### Required
| Variable | Format | Example |
|----------|--------|---------|
| NODE_ENV | `production` | `production` |

### Optional
None - minimal configuration needed

---

## Port Resolution Strategy

All services follow this priority:
1. `PORT` environment variable (set by Railway)
2. Service-specific port env var (KYC_SERVICE_PORT, BANK_ADAPTER_PORT, REPORTER_PORT)
3. Default port (3002, 3003, 3004)

```
If PORT is set (Railway):     Use PORT
Else if KYC_SERVICE_PORT:    Use KYC_SERVICE_PORT
Else:                        Use 3002 (default)
```

---

## Common Values Reference

### Solana RPC URLs
- **Devnet**: `https://api.devnet.solana.com`
- **Testnet**: `https://api.testnet.solana.com`
- **Mainnet**: `https://api.mainnet-beta.solana.com`
- **Custom**: Your own Solana validator RPC endpoint

### PostgreSQL Connection Strings
```
postgresql://username:password@host:5432/database
postgresql://user:pass@db.neon.tech/mydb?sslmode=require
```

### Redis Connection Strings
```
redis://localhost:6379                    # Local
redis://user:pass@host:6379              # With auth
rediss://user:pass@upstash.io:1234       # Upstash (TLS)
```

---

## Environment Variable Validation

### Zod Validation Rules

**api-gateway:**
- `AUTH_TOKEN_SECRET`: minimum 32 characters
- `AUTH_TOKEN_TTL_MINUTES`: 15 to 10080
- Email fields: valid email format
- Password fields: minimum 8 characters
- `PROGRAM_ID_WALLET_WHITELIST`: minimum 32 characters
- `SUPABASE_JWT_SECRET`: minimum 32 characters

**kyc-service:**
- `SOLANA_RPC_URL`: valid URL
- `PROGRAM_ID_COMPLIANCE_REGISTRY`: minimum 32 characters

**bank-adapter:**
- All optional, no strict validation

**reporter:**
- All optional, no strict validation

---

## Migration from Development to Production

### Development `.env`
```env
NODE_ENV=development
API_GATEWAY_PORT=3001
AUTH_TOKEN_SECRET=dev-key-32-chars-or-more-here-12345
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/treasury_os_dev
```

### Production Railway Variables
```
NODE_ENV           production
AUTH_TOKEN_SECRET  (same as dev, but use strong random)
DATABASE_URL       (managed database URL from Railway)
```

### API Gateway beta testnet snippet
```env
SOLANA_RPC_URL=https://api.testnet.solana.com
SOLANA_NETWORK=testnet
PROGRAM_ID_WALLET_WHITELIST=<real-testnet-program-id>
SOLANA_SIGNING_MODE=environment
AUTHORITY_KEYPAIR_JSON=<single-line-json-array>
SOLANA_SYNC_ENABLED=false
SQUADS_MULTISIG_ENABLED=false
```

Generate `AUTHORITY_KEYPAIR_JSON` with:

```bash
npm run solana:keypair:export -- ~/.config/solana/id.json
```

---

## Quick Copy-Paste Templates

### API Gateway (.env for local dev)
```env
NODE_ENV=development
API_GATEWAY_PORT=3001
AUTH_TOKEN_SECRET=copy-32-chars-from-generation-command-here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/treasury_os
DEFAULT_ADMIN_EMAIL=admin@local.test
DEFAULT_ADMIN_PASSWORD=AdminPass123
DEFAULT_COMPLIANCE_EMAIL=compliance@local.test
DEFAULT_COMPLIANCE_PASSWORD=CompliancePass123
DEFAULT_AUDITOR_EMAIL=auditor@local.test
DEFAULT_AUDITOR_PASSWORD=AuditorPass123
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PROGRAM_ID_WALLET_WHITELIST=TokenkegQfeZyiNwAJsyFbPVwwQQftsr...
```

### KYC Service (.env for local dev)
```env
NODE_ENV=development
KYC_SERVICE_PORT=3002
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PROGRAM_ID_COMPLIANCE_REGISTRY=AuthProgIdZvDH...
```

### Bank Adapter (.env for local dev)
```env
NODE_ENV=development
BANK_ADAPTER_PORT=3003
# AMINA_API_URL=https://api.aminabank.example/v1
# AMINA_API_KEY=your-key-here
```

### Reporter (.env for local dev)
```env
NODE_ENV=development
REPORTER_PORT=3004
```

---

## Environment-Specific Recommendations

### Development (Local)
- Use localhost database
- Use Solana devnet RPC
- Store secrets in `.env` (never commit)
- Use weak but valid passwords

### Staging
- Use managed database (Neon, Railway Postgres)
- Use Solana devnet RPC
- Store secrets in Railway Variables
- Use realistic test data

### Production
- Use managed database with SSL
- Beta launch: use Solana testnet and keep sync disabled until signer + program IDs are ready
- Full production launch: use Solana mainnet or custom RPC
- Store secrets in Railway Variables (encrypted)
- Use strong random secrets (32+ chars)
- Enable error tracking (Sentry)
- Enable caching (Redis/Upstash)
- Verify `GET /api/health/ready` before enabling `SOLANA_SYNC_ENABLED=true`
