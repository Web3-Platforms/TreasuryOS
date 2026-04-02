# 🏗️ TreasuryOS Architecture & Deployment Explained (Visual Guide)

## Part 1: What is a Microservice Architecture?

### Traditional Monolith (❌ Not what we're doing)
```
┌─────────────────────────────────────┐
│  ONE BIG APPLICATION                │
│  (Does everything)                  │
│                                     │
│  - User auth                        │
│  - KYC verification                 │
│  - Bank connections                 │
│  - Compliance reports               │
│  - All on one server                │
│                                     │
│  Problem: If one part breaks,       │
│  whole system crashes! 💥           │
└─────────────────────────────────────┘
```

### Microservices Architecture (✅ What we're using)
```
┌────────────────┐  ┌────────────────┐
│   API Gateway  │  │   KYC Service  │
│    Port 3001   │  │   Port 3002    │
│ (User Login)   │  │ (Verification) │
└────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐
│  Bank Adapter  │  │   Reporter     │
│   Port 3003    │  │   Port 3004    │
│ (Connections) │  │  (Compliance)  │
└────────────────┘  └────────────────┘

All sharing:
┌─────────────────────┐
│  PostgreSQL DB      │
│  (Shared Data)      │
└─────────────────────┘
```

**Benefits:**
- ✅ If KYC service breaks, API still works
- ✅ Can scale each service independently
- ✅ Teams can work on different services
- ✅ Easy to update one service without restarting all

---

## Part 2: One Project vs Four Projects - Which Should You Choose?

### Architecture Option A: Single Project (RECOMMENDED ✅)

```
┌─────────────────────────────────────────────────────┐
│           RAILWAY PROJECT: TreasuryOS               │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  API-GW      │  │  KYC         │                │
│  │  :3001       │  │  :3002       │                │
│  └──────────────┘  └──────────────┘                │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Bank        │  │  Reporter    │                │
│  │  :3003       │  │  :3004       │                │
│  └──────────────┘  └──────────────┘                │
│                                                     │
│  ┌──────────────────────────────┐                  │
│  │  PostgreSQL (Shared)         │                  │
│  │  (Database for all)          │                  │
│  └──────────────────────────────┘                  │
└─────────────────────────────────────────────────────┘
```

**Characteristics:**
- 1 Railway project
- 1 PostgreSQL database
- All services communicate internally (fast)
- One billing project
- Single dashboard to manage

**Perfect for:**
- Beginners ✅
- MVP/Testing
- Small teams
- Learning Railway
- Initial deployment

---

### Architecture Option B: Four Separate Projects

```
┌──────────────────┐  ┌──────────────────┐
│ RAILWAY PROJECT  │  │ RAILWAY PROJECT  │
│   API-GW         │  │   KYC            │
│                  │  │                  │
│ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │  API-GW      │ │  │ │  KYC         │ │
│ │  :3001       │ │  │ │  :3002       │ │
│ └──────────────┘ │  │ └──────────────┘ │
│ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │  PostgreSQL  │ │  │ │  PostgreSQL  │ │
│ │  (Own DB)    │ │  │ │  (Own DB)    │ │
│ └──────────────┘ │  │ └──────────────┘ │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ RAILWAY PROJECT  │  │ RAILWAY PROJECT  │
│   Bank Adapter   │  │   Reporter       │
│                  │  │                  │
│ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │  Bank        │ │  │ │  Reporter    │ │
│ │  :3003       │ │  │ │  :3004       │ │
│ └──────────────┘ │  │ └──────────────┘ │
│ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │  PostgreSQL  │ │  │ │  PostgreSQL  │ │
│ │  (Own DB)    │ │  │ │  (Own DB)    │ │
│ └──────────────┘ │  │ └──────────────┘ │
└──────────────────┘  └──────────────────┘
```

**Characteristics:**
- 4 Railway projects
- 4 PostgreSQL databases
- Services communicate via HTTP (internet)
- 4 separate billing projects
- 4 dashboards to manage
- Each service is isolated

**Perfect for:**
- Production at scale
- Experienced teams
- Separate teams per service
- Maximum isolation
- Enterprise grade

---

## Part 3: Data Flow - How Services Communicate

### Single Project Setup (Our Choice)

```
USER REQUEST
     │
     ▼
┌─────────────────────────┐
│  API Gateway (3001)     │
│  - Authentication       │
│  - Request routing      │
└─────────────────────────┘
     │
     ├────────┬────────┬────────┐
     │        │        │        │
     ▼        ▼        ▼        ▼
   ┌──┐    ┌──┐    ┌──┐    ┌──┐
   │KY│    │BA│    │RE│    │DB│
   │C │    │NK│    │PO│    │  │
   └──┘    └──┘    └──┘    └──┘
   3002    3003    3004    5432

1. User submits request to API-GW
2. API-GW routes to correct service (localhost:3002, 3003, or 3004)
3. Services read/write to PostgreSQL
4. Response returns to user

This is FAST because:
- Services on same network (localhost)
- Direct database access
- No internet round-trips
```

### Four Project Setup (If You Choose This Later)

```
USER REQUEST
     │
     ▼
┌──────────────────────────────────┐
│  api-gateway.up.railway.app      │
└──────────────────────────────────┘
     │
     ├─────────────┬─────────────┬─────────────┐
     │             │             │             │
     ▼             ▼             ▼             ▼
  https://      https://       https://      https://
  kyc-ser...    bank-ada...    repor...      <local DB>
  3002          3003           3004          5432

1. User submits request to API-GW
2. API-GW makes HTTPS requests to other services
   (like calling 3rd party APIs)
3. Each service has own database
4. Response returns to user

This is SLOWER because:
- Services communicate via internet
- Need public URLs
- SSL/TLS encryption overhead
- Internet latency
```

---

## Part 4: The Complete Data Flow Explained

### What Happens When User Logs In?

#### With Single Project:
```
USER (Browser)
   │
   │ POST https://api-gateway.up.railway.app/api/auth/login
   │ { email: "user@example.com", password: "pass123" }
   │
   ▼
┌────────────────────────────────┐
│ API Gateway (Port 3001)        │
│ Running on Railway             │
│                                │
│ 1. Receive login request       │
│ 2. Hash password               │
│ 3. Query KYC service:          │
│    localhost:3002/verify       │
│ 4. KYC checks database         │
│ 5. KYC returns: "OK"           │
│ 6. Create JWT token            │
│ 7. Save to database:           │
│    postgresql://[host]:5432    │
│ 8. Return token to user        │
└────────────────────────────────┘
   │
   │ Response: { token: "jwt..." }
   │
   ▼
USER (Browser)
  Token saved in browser
  ✅ User logged in!
```

**Flow Diagram:**
```
Browser
   │
   ├─ Login request ──────────────→ API-GW (3001)
   │                                   │
   │                                   ├─ Check KYC (localhost:3002)
   │                                   │  → Database query
   │                                   │  ← "User verified"
   │                                   │
   │                                   ├─ Save session
   │                                   │  → Database write
   │                                   │
   │ ← JWT token ──────────────────────┘
   │
   ✅ Logged in!
```

---

## Part 5: Port Numbers Explained

```
PORT 3000 ┐
PORT 3001 ├─ API Gateway (PUBLIC - users access this)
          │
PORT 3002 ├─ KYC Service (INTERNAL - api-gw talks to it)
          │
PORT 3003 ├─ Bank Adapter (INTERNAL - api-gw talks to it)
          │
PORT 3004 ├─ Reporter (INTERNAL - api-gw talks to it)
          │
PORT 5432 ├─ PostgreSQL (INTERNAL - all services talk to it)
          │
PORT 5433+└─ (Reserved for future use)
```

**Important:**
- **Only API-GW (3001)** is exposed to the internet
- All other ports are INTERNAL (not accessible from internet)
- Users only talk to API-GW
- API-GW delegates to other services via internal network

---

## Part 6: Environment Variables - What Goes Where?

### All 4 Services Share:
```
DATABASE_URL = postgresql://user:pass@host:5432/treasury

Think of it like: Everyone lives in same building, 
                 so they share the same address
```

### Each Service Has Its Own:
```
┌──────────────────────────┐
│ API Gateway              │
├──────────────────────────┤
│ PORT = 3001              │ ← Service uses this port
│ DATABASE_URL = ...       │ ← Shared database
│ AUTH_TOKEN_SECRET = ...  │ ← Sign login tokens
│ SUPABASE_JWT_SECRET = .  │ ← JWT encryption
└──────────────────────────┘

┌──────────────────────────┐
│ KYC Service              │
├──────────────────────────┤
│ PORT = 3002              │ ← Different port
│ DATABASE_URL = ...       │ ← Same database
│ (No secrets)             │ ← Only API-GW has secrets
└──────────────────────────┘

etc...
```

---

## Part 7: Your Deployment Timeline

### What Happens After You Complete TASK-1

```
TODAY:
┌─────────────┐
│ TASK-1 Done │ ← You are here
│ Services up │   (All 4 on internet)
└─────────────┘
       │
       ▼
   Automatic!
   ┌──────────────────────┐
   │ Every GitHub Push    │
   │ → Auto Deploy        │
   │ → Services Restart   │
   │ → New Code Live      │
   │ (5 minutes total)    │
   └──────────────────────┘

USERS CAN NOW:
✅ Access public URLs
✅ Register accounts (→ KYC Service)
✅ Verify identity (→ KYC checks)
✅ Connect banks (→ Bank Adapter)
✅ Generate reports (→ Reporter)
```

---

## Part 8: Security - What's Protected?

### What Railway DOES Protect:
```
✅ Internet traffic: HTTPS (encrypted)
✅ Database: Secure PostgreSQL (authentication)
✅ Environment variables: Stored encrypted
✅ Server infrastructure: Hardware security
✅ Network isolation: Services can't reach internet directly
```

### What YOU Need to Protect:
```
⚠️ Secrets (AUTH_TOKEN_SECRET, etc) - NEVER share!
⚠️ Database URL - NEVER commit to GitHub
⚠️ PostgreSQL credentials - Store securely
⚠️ Private keys - Rotate regularly
```

---

## Part 9: Common Questions About Architecture

### Q: Why do we have 4 services instead of 1?

**A:** Separation of concerns:
```
API-GW      handles: User requests, routing
KYC-SVC     handles: Only identity verification
Bank-Ada    handles: Only bank connections
Reporter    handles: Only compliance reports

If KYC service crashes:
- Users can still login
- Banks can still connect
- Reports still generate
- Only identity verification fails

With 1 monolith:
- ENTIRE system crashes
- Nothing works
```

### Q: What if PostgreSQL crashes?

**A:** All services go down (but this is rare). Railway manages backups.

### Q: What if one service uses too much CPU?

**A:**
- Single project: Might slow down other services
- Four projects: Only that service affected

### Q: Can services talk to each other?

**A:** Yes! They use:
- `localhost:3002` (API-GW calls KYC)
- `localhost:3003` (API-GW calls Bank)
- `localhost:3004` (API-GW calls Reporter)

In four-project setup, they'd use:
- `https://kyc-service.up.railway.app`
- `https://bank-adapter.up.railway.app`
- etc.

---

## Part 10: After TASK-1 - What's Next?

```
TASK-1 Complete ✅
   └─ All services on internet
   └─ Database running
   └─ Secrets configured
   └─ Health checks passing
         │
         ▼
    TASK-2: Testing
    ├─ Test each endpoint
    ├─ Verify database works
    └─ Check service communication
         │
         ▼
    TASK-3: Get Solana IDs
    ├─ PROGRAM_ID_WALLET_WHITELIST
    ├─ PROGRAM_ID_COMPLIANCE_REGISTRY
    └─ Add to environment variables
         │
         ▼
    TASK-4: Security Audit
    ├─ Penetration testing
    ├─ Authentication checks
    └─ Database security review
         │
         ▼
    LAUNCH 🚀
    └─ Go live to users!
```

---

## Summary

**What You're Building:**
- ✅ 4 microservices (independent apps)
- ✅ 1 PostgreSQL database (shared data)
- ✅ 1 Railway project (container)
- ✅ Auto-deployment on every push
- ✅ HTTPS encryption
- ✅ Secure secrets management

**Your Services Are:**
- 🌐 Live on internet
- 🔄 Auto-scaling
- 💾 Backed up
- 🔐 Secure
- ✅ Monitored

**Total Effort to Launch:**
- TASK-1: Infrastructure (80 mins) ← You are here
- TASK-2: Testing (1 day)
- TASK-3: Solana setup (1 day)
- TASK-4: Security (2 days)
- **TOTAL: 5 days to production**

---

**Ready to start TASK-1? Follow the step-by-step guide!** 🚀
