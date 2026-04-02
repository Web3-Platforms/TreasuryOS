# ✅ TASK-1 Quick Checklist (Print This!)

Use this checklist as you follow the guide. Check off each step as you complete it.

---

## STEP 0: Railway Account
- [ ] Go to https://railway.app
- [ ] Click "Start Free"
- [ ] Sign up with GitHub
- [ ] Complete setup wizard
- [ ] Confirm you can access Railway dashboard

**Status:** ⏳ Ready / ✅ Done

---

## STEP 1: Create Railway Project
- [x] Go to https://railway.app/dashboard
- [x] Click "Create New Project"
- [x] Select "Deploy from GitHub"
- [x] Authorize Railway to access GitHub
- [x] Search and select "TreasuryOS" repository
- [x] Select "main" branch
- [x] Choose "Monorepo" (not "Single Service")
- [x] Keep root directory as "." (dot)
- [x] Name project: "TreasuryOS-Production"
- [x] Wait for project creation

**Project Name:** ________________  
**Project URL:** ________________

**Status:** ⏳ In Progress / ✅ Done

---

## STEP 2: Add 4 Services to Project

### 2.1 - Add API Gateway
- [x] Click "Add Service"
- [x] Choose "GitHub Repository"
- [x] Select "TreasuryOS"
- [x] Select "main" branch
- [x] Check ONLY "api-gateway"
- [x] Click "Save & Continue"
- [x] Wait for service to appear

**Status:** ✅ Done

### 2.2 - Add KYC Service
- [x] Click "Add Service"
- [x] Choose "GitHub Repository"
- [x] Select "TreasuryOS"
- [x] Select "main" branch
- [x] Check ONLY "kyc-service"
- [x] Click "Save & Continue"

**Status:** ✅ Done

### 2.3 - Add Bank Adapter
- [x] Click "Add Service"
- [x] Choose "GitHub Repository"
- [x] Select "TreasuryOS"
- [x] Select "main" branch
- [x] Check ONLY "bank-adapter"
- [x] Click "Save & Continue"

**Status:** ✅ Done

### 2.4 - Add Reporter
- [x] Click "Add Service"
- [x] Choose "GitHub Repository"
- [x] Select "TreasuryOS"
- [x] Select "main" branch
- [x] Check ONLY "reporter"
- [x] Click "Save & Continue"

**Status:** ✅ Done

**Verification:**
- [x] See 4 service cards (all showing "Failed" is OK)
- [x] Service names match above

**Status:** ⏳ In Progress / ✅ Done

---

## STEP 3: Provision PostgreSQL Database

- [ ] Click "Add Service"
- [ ] Look for "PostgreSQL" option
- [ ] Click "PostgreSQL"
- [ ] Wait for database to create (~30 seconds)
- [ ] See PostgreSQL service card with "Running" status
- [ ] Open PostgreSQL service
- [ ] Go to "Variables" tab
- [ ] Find and COPY: `DATABASE_URL`

**DATABASE_URL Value:**  
```
postgresql://____________________________
```

**Status:** ⏳ In Progress / ✅ Done

---

## STEP 4: Generate Secrets

### 4.1 - Generate AUTH_TOKEN_SECRET

Open Terminal and run:
```bash
openssl rand -hex 32
```

**Generated Value:**
```
________________________________
```

### 4.2 - Generate SUPABASE_JWT_SECRET

Open Terminal and run:
```bash
openssl rand -hex 32
```

**Generated Value:**
```
________________________________
```

### 4.3 - Generate PRIVATE_KEY_ENCRYPT (for Bank Adapter)

Open Terminal and run:
```bash
openssl rand -hex 32
```

**Generated Value:**
```
________________________________
```

**Status:** ⏳ In Progress / ✅ Done

---

## STEP 5: Set Environment Variables

For each service, go to Variables tab and add:

### 5.1 - API Gateway (Port 3001)

- [ ] Click on "api-gateway" service
- [ ] Go to "Variables" tab
- [ ] Add these variables:

| Name                | Value                      |
| ------------------- | -------------------------- |
| PORT                | `3001`                     |
| API_GATEWAY_PORT    | `3001`                     |
| DATABASE_URL        | `[paste from PostgreSQL]`  |
| AUTH_TOKEN_SECRET   | `[paste generated secret]` |
| SUPABASE_JWT_SECRET | `[paste generated secret]` |

✅ Verification: See 5 variables in list

### 5.2 - KYC Service (Port 3002)

- [ ] Click on "kyc-service" service
- [ ] Go to "Variables" tab
- [ ] Add these variables:

| Name             | Value                     |     |
| ---------------- | ------------------------- | --- |
| PORT             | `3002`                    |     |
| KYC_SERVICE_PORT | `3002`                    |     |
| DATABASE_URL     | `[paste from PostgreSQL]` |     |

✅ Verification: See 3 variables in list

### 5.3 - Bank Adapter (Port 3003)

- [ ] Click on "bank-adapter" service
- [ ] Go to "Variables" tab
- [ ] Add these variables:

| Name | Value |
|------|-------|
| PORT | `3003` |
| BANK_ADAPTER_PORT | `3003` |
| DATABASE_URL | `[paste from PostgreSQL]` |
| PRIVATE_KEY_ENCRYPT | `[paste generated secret]` |

✅ Verification: See 4 variables in list

### 5.4 - Reporter (Port 3004)

- [ ] Click on "reporter" service
- [ ] Go to "Variables" tab
- [ ] Add these variables:

| Name | Value |
|------|-------|
| PORT | `3004` |
| REPORTER_PORT | `3004` |
| DATABASE_URL | `[paste from PostgreSQL]` |

✅ Verification: See 3 variables in list

**Status:** ⏳ In Progress / ✅ Done

---

## STEP 6: Wait for Services to Restart

After adding all variables:

- [ ] Wait 30-60 seconds
- [ ] Watch service cards for status changes
- [ ] ALL should eventually show: **"Running ✅"**

**If any show "Failed":**
- [ ] Click on failed service
- [ ] Go to "Logs" tab
- [ ] Look for error message
- [ ] Check that all variables are set correctly

**Status:** ⏳ In Progress / ✅ Done

---

## STEP 7: Verify Services Work

For each service:

1. **Click service card** (e.g., api-gateway)
2. **Look at top right** - you'll see a URL like:
   ```
   api-gateway.up.railway.app
   ```
3. **Open in browser:**
   ```
   https://api-gateway.up.railway.app/api/health
   ```
4. **Should return:**
   ```json
   { "status": "ok" }
   ```
   If you see this, the service is working! ✅

### API Gateway
- [ ] URL: ___________________________
- [ ] Health endpoint returns 200 ✅

### KYC Service
- [ ] URL: ___________________________
- [ ] Health endpoint returns 200 ✅

### Bank Adapter
- [ ] URL: ___________________________
- [ ] Health endpoint returns 200 ✅

### Reporter
- [ ] URL: ___________________________
- [ ] Health endpoint returns 200 ✅

**Status:** ⏳ In Progress / ✅ Done

---

## STEP 8: Save Your URLs and Secrets

**IMPORTANT:** Keep this information safe!

### Service URLs (Bookmark these!)
```
API Gateway:    https://api-gateway.up.railway.app
KYC Service:    https://kyc-service.up.railway.app
Bank Adapter:   https://bank-adapter.up.railway.app
Reporter:       https://reporter.up.railway.app

PostgreSQL URL: [saved in Railway Variables]
```

### Secrets (Write down on paper, keep secure!)
```
AUTH_TOKEN_SECRET:       ________________________________________
SUPABASE_JWT_SECRET:     ________________________________________
PRIVATE_KEY_ENCRYPT:     ________________________________________
```

**⚠️ DO NOT:**
- ❌ Share these with anyone
- ❌ Commit them to GitHub
- ❌ Post them on Slack/Discord
- ❌ Store them in regular notes

---

## ✅ TASK-1 COMPLETE!

If you checked all boxes above, **TASK-1 is done!**

### What You've Accomplished:
- ✅ Railway account created
- ✅ Project with 4 services on internet
- ✅ PostgreSQL database running
- ✅ Security secrets generated
- ✅ All environment variables configured
- ✅ All services responding on public URLs

### Your Services Are Now:
- 🌐 Live on the internet
- 🔄 Auto-deploying on every GitHub push
- 💾 Using a real PostgreSQL database
- 🔐 Protected with security secrets
- ✅ Responding to health checks

---

## 📝 Time Tracker

| Step | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| Step 0: Account | 5 min | ____ | |
| Step 1: Project | 10 min | ____ | |
| Step 2: Services | 10 min | ____ | |
| Step 3: Database | 15 min | ____ | |
| Step 4: Secrets | 10 min | ____ | |
| Step 5: Variables | 20 min | ____ | |
| Step 6-7: Verify | 10 min | ____ | |
| **TOTAL** | **80 min** | ____ | |

---

## 🆘 HELP: Getting Stuck?

### Services showing "Failed"?
→ Go to Step 5, add DATABASE_URL and PORT again

### Can't reach service URL?
→ Check if status is "Running" (wait 30 seconds if "Building...")

### Forgot a secret?
→ Run `openssl rand -hex 32` again, it creates a new one

### Need to edit variables?
→ Click on variable field, type new value, press Enter

### Still stuck?
→ Check Step 5 again, make sure ALL variables are added

---

**Print this checklist and check off each item as you go!**  
**Estimated total time: 80 minutes**

Good luck! 🚀
