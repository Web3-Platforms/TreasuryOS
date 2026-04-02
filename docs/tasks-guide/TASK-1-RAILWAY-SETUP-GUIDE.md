# 🚀 TASK-1 Complete Beginner's Guide: Railway Infrastructure Setup

## Part 0: Understanding the Basics (Read This First!)

### What is Railway?
Railway is a hosting platform where you run applications on the internet (like buying a server but automated). Think of it as:
- **Analogy:** Railway is like renting a furnished apartment with utilities included
  - You just move in (deploy code) and everything works
  - Railway handles: servers, networking, backups, security updates, monitoring
  - You just pay for what you use

### What Are "Services"?
In TreasuryOS, we have 4 separate applications:
1. **API Gateway** (Port 3001) - Main API, handles requests from users
2. **KYC Service** (Port 3002) - Verifies user identity (Know Your Customer)
3. **Bank Adapter** (Port 3003) - Connects to bank systems (AMINA integration)
4. **Reporter** (Port 3004) - Creates compliance reports (MICA requirements)

Each service is independent but they communicate with each other.

### Two Deployment Strategies

#### **Option A: One Railway Project (Recommended for Beginners) ✅**
```
┌─────────────────────────────────────────┐
│  TreasuryOS (Single Railway Project)    │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌────────────┐            │
│  │ API-GW   │ │ KYC Service│            │
│  │ :3001    │ │ :3002      │            │
│  └──────────┘ └────────────┘            │
│  ┌──────────┐ ┌────────────┐            │
│  │ Bank     │ │ Reporter   │            │
│  │ Adapter  │ │ :3004      │            │
│  │ :3003    │ └────────────┘            │
│  └──────────┘                           │
│  Shared PostgreSQL Database             │
└─────────────────────────────────────────┘
```

**Pros:**
- ✅ Single billing project (simpler accounting)
- ✅ All services can see each other easily (localhost:3002, etc. on same network)
- ✅ Single database connection
- ✅ Easier to manage (1 dashboard, not 4)
- ✅ **Best for beginners**

**Cons:**
- ❌ Services might compete for resources
- ❌ One service crash doesn't isolate others

#### **Option B: Four Separate Railway Projects**
```
Project 1               Project 2
┌──────────────┐        ┌──────────────┐
│ API Gateway  │        │ KYC Service  │
│ :3001        │        │ :3002        │
└──────────────┘        └──────────────┘

Project 3               Project 4
┌──────────────┐        ┌──────────────┐
│ Bank Adapter │        │ Reporter     │
│ :3003        │        │ :3004        │
└──────────────┘        └──────────────┘

Each has: PostgreSQL, Environment Vars, Secrets
```

**Pros:**
- ✅ Complete isolation (one crash doesn't affect others)
- ✅ Independent scaling
- ✅ Better for large teams (separate repos/deploy pipelines)
- ✅ Production-grade approach

**Cons:**
- ❌ 4x complexity for beginners
- ❌ 4 databases to manage
- ❌ Services need to use public URLs to talk to each other
- ❌ 4x configuration work
- ❌ 4x more expensive (4 databases vs 1)

---

### **RECOMMENDATION: Use Option A (One Project with 4 Services)**

For your team and current stage, **one Railway project is better** because:
1. ✅ Simpler to understand and manage
2. ✅ Services on same network = fast communication
3. ✅ Single shared database = easier data consistency
4. ✅ Lower cost (1 database instead of 4)
5. ✅ Faster initial deployment

**This guide will use Option A.** If you later need Option B, the steps are almost identical (just repeat 4 times).

---

## Part 1: What is TASK-1?

TASK-1 breaks down into 4 sub-tasks:

| Task | What | Why | Effort |
|------|------|-----|--------|
| **TASK-1.1** | Create Railway Project + Add Services | Gets your app on the internet | 30 mins |
| **TASK-1.2** | Provision PostgreSQL Database | Store user data, transactions, compliance logs | 15 mins |
| **TASK-1.3** | Generate Secrets | Security keys for authentication | 10 mins |
| **TASK-1.4** | Set Environment Variables | Tell services where to find database, secrets, etc | 20 mins |
| **TOTAL** | Complete Infrastructure Setup | Everything ready to deploy | 75 mins |

---

## Part 2: Prerequisites (Check These First!)

Before starting, you need:

- [ ] **GitHub Account** (you have this ✅)
- [ ] **Railway Account** (FREE - see step 0)
- [ ] **GitHub Repository Access** (TreasuryOS repo)
- [ ] **Admin access to Railway project** (when created)

### Do you have Railway account?
```bash
# Check if you can access Railway
# Go to: https://railway.app
# Login or click "Sign up with GitHub"
```

If you don't have one, **go to https://railway.app** and click **"Start Free"** → **"Sign up with GitHub"**

---

## Part 3: Step-by-Step Guide

### STEP 0: Create Railway Account (5 minutes)
Only if you don't have one already.

**Instructions:**
1. Go to https://railway.app
2. Click **"Start Free"** button (top right)
3. Click **"Sign up with GitHub"**
4. Authorize Railway to access your GitHub account
5. Follow setup wizard (just click "Next" through questions)
6. You'll land on the Railway dashboard

**What you should see:**
- Empty dashboard with "Create New Project" button
- Your GitHub account linked (top right corner)

✅ **TASK-0 COMPLETE: Railway account ready**

---

### STEP 1: Create Railway Project (10 minutes)

**What you're doing:**
Creating a container where all 4 services will live (like renting an office building instead of 4 separate buildings).

**Step-by-step:**

1. **Go to https://railway.app/dashboard**

2. **Click "Create New Project"** (big button in center)
   ```
   [Create New Project] ← Click here
   ```

3. **Choose deployment method:**
   ```
   ┌─────────────────────────────────┐
   │ Create a new project             │
   │                                 │
   │ • Deploy from GitHub ✅         │ ← Select this
   │ • From Template                 │
   │ • Empty Project                 │
   └─────────────────────────────────┘
   ```
   Click: **"Deploy from GitHub"**

4. **Authorize Railway to access GitHub:**
   - You may see: "Authorize railway-app?"
   - Click: **"Authorize railway-app"** (blue button)
   - This lets Railway see your repos and deploy code automatically

5. **Select the TreasuryOS Repository:**
   ```
   Search box appears asking: "What repository?"
   Type: "TreasuryOS"
   
   Results show:
   ┌────────────────────────────────┐
   │ your-username/TreasuryOS       │ ← Click this
   └────────────────────────────────┘
   ```
   Click the result to select it.

6. **Select GitHub Branch:**
   ```
   Question: "Which branch?"
   
   Options shown:
   ┌────────────────────┐
   │ • main      ✅     │ ← Select this
   │ • develop          │
   └────────────────────┘
   ```
   Select **"main"** (or your default branch where production code is)

7. **Choose Deploy Type:**
   ```
   Question: "What should we deploy?"
   
   Options shown:
   ┌─────────────────────────────────┐
   │ • Monorepo ✅                   │ ← Select this
   │ • Single Service                │
   └─────────────────────────────────┘
   ```
   Click: **"Monorepo"** (because TreasuryOS has 4 services in one repo)

8. **Select Root Directory:**
   ```
   Question: "What's the root directory of your project?"
   
   Show:
   ┌─────────────────┐
   │ . (root)   ✅   │ ← Select this
   └─────────────────┘
   ```
   Keep as **"."** (root directory)

9. **Name Your Project:**
   ```
   Question: "Project Name?"
   
   Suggested: [TreasuryOS-Production]
   
   Type: TreasuryOS-Production
   ```
   Enter: **"TreasuryOS-Production"**
   (or any name you like - this shows on your Railway dashboard)

10. **Wait for Project Creation:**
    ```
    Loading... Creating project...
    (Takes 10-20 seconds)
    ```
    
    You should see a blank project dashboard with:
    - Project name at top left
    - "Add Service" button in center

✅ **STEP 1 COMPLETE: Railway project created**

---

### STEP 2: Add the 4 Services to Your Project (10 minutes)

**What you're doing:**
Telling Railway about your 4 microservices and how to run them.

**Important:** Railway should auto-detect services from your monorepo. But we'll add them manually to ensure correct configuration.

#### 2.1: Add API Gateway Service

**Instructions:**

1. **Click "Add Service"** (button in center of project)
   ```
   [+ Add Service]
   ```

2. **Choose "GitHub Repository"**
   ```
   Select from:
   ┌───────────────────────────┐
   │ • GitHub Repository  ✅   │ ← Click here
   │ • Docker Image            │
   │ • Public Template         │
   └───────────────────────────┘
   ```

3. **Select Repository:**
   Same as before - should already show "your-username/TreasuryOS"
   Click it to select.

4. **Choose Branch:**
   Select **"main"** (or your production branch)

5. **Railway Will Ask: "What service?"**
   It should show detected services:
   ```
   ┌────────────────────────────────────┐
   │ Services detected:                 │
   │                                    │
   │ ☑ api-gateway           ← API-GW  │
   │ ☐ kyc-service                     │
   │ ☐ bank-adapter                    │
   │ ☐ reporter                        │
   │                                    │
   │ [Save & Continue]                │
   └────────────────────────────────────┘
   ```
   
   Check ONLY: **api-gateway**
   Then click: **"Save & Continue"**

6. **Service gets added to project:**
   You should see a new card appear:
   ```
   ┌──────────────────────────┐
   │ api-gateway              │
   │ Status: Building...      │
   └──────────────────────────┘
   ```

7. **Wait for first build:** (5-10 minutes)
   ```
   Building...
   ↓
   Build succeeded (or might fail - that's OK for now)
   ```
   
   Don't worry if first build fails - we'll add secrets next.

#### 2.2: Add KYC Service

**Repeat the same process:**

1. Click **"Add Service"** again
2. Choose **"GitHub Repository"**
3. Select **TreasuryOS** repo
4. Select **main** branch
5. **This time, check ONLY: "kyc-service"**
6. Click **"Save & Continue"**

You should now see 2 service cards.

#### 2.3: Add Bank Adapter Service

1. Click **"Add Service"** again
2. Choose **"GitHub Repository"**
3. Select **TreasuryOS** repo
4. Select **main** branch
5. **Check ONLY: "bank-adapter"**
6. Click **"Save & Continue"**

#### 2.4: Add Reporter Service

1. Click **"Add Service"** again
2. Choose **"GitHub Repository"**
3. Select **TreasuryOS** repo
4. Select **main** branch
5. **Check ONLY: "reporter"**
6. Click **"Save & Continue"**

**Final Result:**
You should see 4 service cards:
```
┌──────────────────────┐  ┌──────────────────────┐
│ api-gateway          │  │ kyc-service          │
│ Status: Failed       │  │ Status: Failed       │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ bank-adapter         │  │ reporter             │
│ Status: Failed       │  │ Status: Failed       │
└──────────────────────┘  └──────────────────────┘
```

They show "Failed" because we haven't added the PostgreSQL database yet. **This is normal!** ✅

✅ **STEP 2 COMPLETE: 4 services added to project**

---

### STEP 3: Provision PostgreSQL Database (15 minutes)

**What you're doing:**
Creating a database that all 4 services share to store:
- User accounts
- KYC verification data
- Bank transactions
- Compliance reports

**Step-by-step:**

1. **Click "Add Service"** again (yes, database is a "service" too)

2. **Look for Database/Postgres Option:**
   ```
   You should see options like:
   ┌─────────────────────────┐
   │ • GitHub Repository     │
   │ • Docker Image          │
   │ • PostgreSQL      ✅    │ ← Click here
   │ • MySQL                 │
   │ • MongoDB               │
   │ • Redis                 │
   └─────────────────────────┘
   ```
   Click: **"PostgreSQL"**

3. **Railway Creates Database:**
   ```
   Creating PostgreSQL instance...
   (Wait 30 seconds)
   ```

4. **You'll See a New Card:**
   ```
   ┌──────────────────────┐
   │ PostgreSQL           │
   │ Status: Running ✅   │
   └──────────────────────┘
   ```

5. **Railway Auto-Generates Connection String:**
   Inside the Postgres service card, you'll find:
   ```
   DATABASE_URL: 
   postgresql://user:password@host:5432/database
   ```
   
   This is the address where all services connect to the database.

✅ **STEP 3 COMPLETE: PostgreSQL database created and running**

---

### STEP 4: Generate Secrets (10 minutes)

**What you're doing:**
Creating security keys used for:
- Encrypting user passwords
- Signing authentication tokens
- Securing communication between services

**Understanding Secrets:**
```
Think of secrets like:
- Your house keys (for authentication)
- Your WiFi password (for service communication)
- Your credit card (for payments)

You need them but NEVER show them publicly or commit to GitHub!
```

#### What Secrets to Generate?

For **API Gateway**, you need:

| Secret Name | What It's For | Example | Length |
|-------------|---------------|---------|--------|
| AUTH_TOKEN_SECRET | Signs user login tokens | `a1b2c3d4e5f6...` | 32+ chars |
| SUPABASE_JWT_SECRET | JWT token encryption | `base64string...` | 32+ chars |

For **Bank Adapter**, you need:

| Secret Name | What It's For |
|-------------|---------------|
| PRIVATE_KEY_ENCRYPT | Encrypts bank credentials |

#### How to Generate a Secret:

**Method 1: Using macOS Terminal (Recommended)**

```bash
# Open Terminal and run this command:
openssl rand -hex 32

# Output will look like:
# a1b2c3d4e5f6789012345678901234567890abcdef123456789012345

# Copy the output - that's your secret!
```

**Method 2: Online Generator (If terminal doesn't work)**

Go to: https://www.uuidgenerator.net/
- Click "Generate UUID"
- Copy it
- Add more random characters from it again to make it 32+

**Method 3: Just Make One Up (Last Resort)**
```
a1b2c3d4e5f67890a1b2c3d4e5f67890
^ This is a valid secret (32 characters)
```

#### Step-by-Step: Add Secrets to Railway

1. **Go to API Gateway Service Card** (click on it)
   ```
   ┌──────────────────────┐
   │ api-gateway          │
   │ (Click anywhere)     │
   └──────────────────────┘
   ```

2. **Service Details Page Opens:**
   You should see tabs at top:
   ```
   [Variables] [Deployments] [Logs] [Settings]
   ```
   Click: **"Variables"** tab

3. **You'll See Environment Variables Section:**
   ```
   ┌────────────────────────────────────┐
   │ Environment Variables              │
   │                                    │
   │ [+] Add Variable                   │
   │                                    │
   │ PORT                   3001        │
   │ (other existing vars...)           │
   └────────────────────────────────────┘
   ```

4. **Add AUTH_TOKEN_SECRET:**
   - Click: **"[+] Add Variable"** button
   - Type in Name field: `AUTH_TOKEN_SECRET`
   - Generate secret using terminal: `openssl rand -hex 32`
   - Paste generated value into Value field
   - Click: **"Add"** or press Enter
   
   ```
   NAME:  AUTH_TOKEN_SECRET
   VALUE: a1b2c3d4e5f6789012345678901234567890...
   ```

5. **Add SUPABASE_JWT_SECRET:**
   - Click: **"[+] Add Variable"** again
   - Type in Name field: `SUPABASE_JWT_SECRET`
   - Generate another secret: `openssl rand -hex 32`
   - Paste value into Value field
   - Click: **"Add"**

6. **Verify Both Secrets Added:**
   ```
   ┌────────────────────────────────────┐
   │ Environment Variables              │
   │                                    │
   │ PORT                   3001        │
   │ AUTH_TOKEN_SECRET      ****...     │ ✓
   │ SUPABASE_JWT_SECRET    ****...     │ ✓
   └────────────────────────────────────┘
   ```
   
   Note: Railway hides secret values for security (shows ****...)

✅ **STEP 4 COMPLETE: Secrets generated and added**

---

### STEP 5: Set Environment Variables for All Services (20 minutes)

**What you're doing:**
Telling each service:
- Where the database is (DATABASE_URL)
- What port to run on (PORT)
- What the secret keys are (AUTH_TOKEN_SECRET, etc)
- Other service-specific settings

**Important Variables Needed:**

#### For ALL Services (Shared):
```
DATABASE_URL = postgresql://user:pass@host:5432/db
                ↑ Get this from PostgreSQL service card
```

#### For API Gateway (Port 3001):
```
PORT = 3001
AUTH_TOKEN_SECRET = (your generated secret)
SUPABASE_JWT_SECRET = (your generated secret)
API_GATEWAY_PORT = 3001
```

#### For KYC Service (Port 3002):
```
PORT = 3002
KYC_SERVICE_PORT = 3002
DATABASE_URL = (shared)
```

#### For Bank Adapter (Port 3003):
```
PORT = 3003
BANK_ADAPTER_PORT = 3003
DATABASE_URL = (shared)
PRIVATE_KEY_ENCRYPT = (generate: openssl rand -hex 32)
```

#### For Reporter (Port 3004):
```
PORT = 3004
REPORTER_PORT = 3004
DATABASE_URL = (shared)
```

#### Step-by-Step: Set Variables

**For Each Service (Repeat 4 times):**

1. **Click on Service Card** (e.g., api-gateway)

2. **Go to Variables Tab:**
   ```
   [Variables] [Deployments] [Logs] [Settings]
   ↑ Click here
   ```

3. **Get DATABASE_URL from PostgreSQL:**
   - Click on **PostgreSQL** service card
   - Go to **Variables** tab
   - Find variable named: `DATABASE_URL`
   - Copy the value (starts with postgresql://)
   - Go back to current service
   - Paste it into new variable

4. **Add Variables One by One:**
   ```
   Click [+] Add Variable
   
   Add:
   - PORT = [service port number]
   - [SERVICE]_PORT = [same port]
   - DATABASE_URL = [copy from PostgreSQL]
   - (AUTH_TOKEN_SECRET if API Gateway)
   - (SUPABASE_JWT_SECRET if API Gateway)
   - (PRIVATE_KEY_ENCRYPT if Bank Adapter)
   ```

5. **Example: API Gateway Variables:**
   ```
   ┌─────────────────────────────────┐
   │ Environment Variables           │
   │                                 │
   │ PORT                       3001 │
   │ API_GATEWAY_PORT           3001 │
   │ DATABASE_URL      postgresql://..│
   │ AUTH_TOKEN_SECRET      ****..   │
   │ SUPABASE_JWT_SECRET    ****..   │
   └─────────────────────────────────┘
   ```

6. **Repeat for all 4 services**

✅ **STEP 5 COMPLETE: All environment variables set**

---

## Part 4: Verify Everything Works

After completing all steps, services should restart automatically and build.

**What you should see:**

```
┌──────────────────────┐  ┌──────────────────────┐
│ api-gateway          │  │ kyc-service          │
│ Status: Running ✅   │  │ Status: Running ✅   │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ bank-adapter         │  │ reporter             │
│ Status: Running ✅   │  │ Status: Running ✅   │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐
│ PostgreSQL           │
│ Status: Running ✅   │
└──────────────────────┘
```

**To Test Each Service:**

1. **Find the Service URL:**
   - Click on service card (e.g., api-gateway)
   - At top, you'll see something like:
     ```
     api-gateway.up.railway.app
     ```
   - This is your public URL

2. **Test Health Endpoint:**
   - Open browser or use curl:
     ```
     https://api-gateway.up.railway.app/api/health
     ```
   - Should return:
     ```json
     { "status": "ok" }
     ```
   - If you see this, ✅ Service is working!

3. **Repeat for all services:**
   ```
   https://api-gateway.up.railway.app/api/health
   https://kyc-service.up.railway.app/api/health
   https://bank-adapter.up.railway.app/api/health
   https://reporter.up.railway.app/api/health
   ```

✅ **VERIFICATION COMPLETE: All services running on internet!**

---

## Part 5: Troubleshooting

### Problem: Services show "Failed" status

**Cause:** Usually missing environment variables

**Fix:**
1. Click on service → Variables tab
2. Check if DATABASE_URL is set
3. Check if PORT is set
4. If missing, add them (see Step 5 again)
5. Railway auto-restarts after variable changes (wait 30 seconds)

### Problem: Can't access service URL

**Cause:** Service still building or crashed

**Fix:**
1. Click service → Deployments tab
2. Click latest deployment to see build logs
3. Look for error messages
4. Common issues:
   - Missing DATABASE_URL
   - Missing PORT variable
   - Database not ready yet

### Problem: Database connection error

**Cause:** PostgreSQL not running or DATABASE_URL malformed

**Fix:**
1. Check PostgreSQL service - should show "Running"
2. Copy DATABASE_URL again from PostgreSQL → Variables
3. Make sure it starts with: `postgresql://`
4. Paste into all services again

### Problem: "Too many connections" error

**Cause:** Services creating too many database connections

**Fix:**
1. Railway PostgreSQL default allows 60 connections
2. With 4 services, each needing 5-10 = tight
3. Not critical for now - just note it
4. After MVP, upgrade to larger database

---

## Part 6: Summary & Next Steps

### What You Just Did:

✅ Created Railway project with 4 services  
✅ Set up PostgreSQL database  
✅ Generated security secrets  
✅ Configured environment variables  
✅ All services running on internet with public URLs  

### Your Service URLs (Save These!):

```
API Gateway:      https://api-gateway.up.railway.app
KYC Service:      https://kyc-service.up.railway.app
Bank Adapter:     https://bank-adapter.up.railway.app
Reporter:         https://reporter.up.railway.app
```

### Auto-Deployment Enabled!

Every time you push to GitHub main branch:
1. Railway detects the push
2. Builds your services automatically
3. Deploys new version in ~5 minutes
4. Services restart with new code

**No manual deployment needed after this!**

### Next Steps (TASK-2):

After completing TASK-1:

1. **TASK-2.1:** Verify all health checks pass
   ```
   curl https://api-gateway.up.railway.app/api/health
   ```

2. **TASK-2.2:** Get Solana Program IDs from team
   - PROGRAM_ID_WALLET_WHITELIST
   - PROGRAM_ID_COMPLIANCE_REGISTRY
   - Add to variables

3. **TASK-3:** Full end-to-end testing
   - Test user registration (KYC)
   - Test bank connection (Bank Adapter)
   - Test compliance reports (Reporter)

4. **TASK-4:** Security audit before going live

---

## FAQ for Beginners

### Q: What's the difference between "Project" and "Service"?
**A:** 
- **Project** = Organization container (like company name)
- **Service** = Individual application (like departments)
- In your case: Project = "TreasuryOS", Services = API-GW, KYC, etc.

### Q: Why do we need secrets?
**A:** Without them, anyone could log in as anyone else or hack the system.

### Q: Can I have 4 separate projects instead?
**A:** Yes, but it's 4x more work. Stick with 1 project for now.

### Q: What if I make a mistake with secrets?
**A:** You can click the "X" next to any variable to delete it, then add the correct one.

### Q: Will services automatically restart?
**A:** Yes! Railway restarts after:
- Code push to GitHub
- Environment variable changes
- Database connection restored

### Q: How much will this cost?
**A:** Railway is free for first month, then ~$5-50/month depending on usage:
- $5/month: Small usage (good for MVP/testing)
- $50/month: Heavy usage (production scale)
- Much cheaper than most self-hosted or multi-cloud setups

### Q: What if a service crashes?
**A:** Railway restarts it automatically. Check logs to see why.

### Q: Can I test locally first?
**A:** Yes! Before pushing to Railway, test on your laptop:
```bash
cd apps/api-gateway
npm install
npm run start:prod
```

### Q: How do I see error logs?
**A:** 
1. Click service card
2. Go to "Logs" tab
3. See real-time error messages

---

## Estimated Time to Complete TASK-1

- **Step 0 (Railway account):** 5 minutes
- **Step 1 (Create project):** 10 minutes
- **Step 2 (Add 4 services):** 10 minutes
- **Step 3 (PostgreSQL):** 15 minutes
- **Step 4 (Generate secrets):** 10 minutes
- **Step 5 (Environment variables):** 20 minutes
- **Step 6 (Verification):** 10 minutes

**Total: ~80 minutes**

🎉 **After this, you have a fully deployed system on the internet!**

---

**Last Updated:** March 30, 2026  
**Created for:** Beginners with no Railway experience  
**Questions?** Ask before proceeding to ensure you understand
