# Complete Testing Guide — Frontend & Backend

## Quick Status Check

**Frontend:** `https://coinly-pro.vercel.app`  
**Backend:** `https://coinlypro-production-20dd.up.railway.app`  
**CORS:** ✅ Pattern-based (accepts vercel.app, telegram, netlify.app origins)

---

## 1️⃣ TEST BACKEND LOCALLY (Optional - For Development)

### Start Backend Locally
```bash
cd server
npm install
node index.js
```

Expected output:
```
🚀 Backend server running on http://localhost:5000
📊 Health check: http://localhost:5000/health
💾 Database: In-memory (persisted to db.json)
```

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-08-08T09:20:00.000Z"}
```

---

## 2️⃣ TEST FRONTEND + BACKEND TOGETHER

### Option A: Test Production URLs (Recommended)

1. **Open Frontend**
   - Go to: `https://coinly-pro.vercel.app`
   - Opens in regular browser or Telegram WebView

2. **Open Browser Developer Console** (F12 or Cmd+Opt+I)
   - Watch for these logs on page load:
     ```
     🔗 API_BASE_URL resolved to: https://coinlypro-production-20dd.up.railway.app
     🌐 Current hostname: coinly-pro.vercel.app
     ```

3. **Watch Console for API Calls**
   - Page should load and auto-authenticate
   - Look for logs like:
     ```
     [API DEBUG] {timestamp: '9:20:25 AM', url: '...api/auth', method: 'POST', status: 'SUCCESS'}
     [API DEBUG] {timestamp: '9:20:26 AM', url: '...api/balance/123456789', method: 'GET', status: 'SUCCESS'}
     ```

### Option B: Test Locally (Frontend + Local Backend)

1. **Start Backend Locally**
   ```bash
   cd server && node index.js
   ```

2. **Open Frontend at localhost**
   - If serving locally: `http://localhost:8080` (or your dev server port)
   - Frontend detects localhost and uses `http://localhost:5000` automatically

3. **Check Console**
   ```
   🔗 API_BASE_URL resolved to: http://localhost:5000
   🌐 Current hostname: localhost
   ```

---

## 3️⃣ MANUAL API TESTING

### Test Health Endpoint (Is backend alive?)
```bash
curl https://coinlypro-production-20dd.up.railway.app/health
```

### Test with Origin Header
All production requests need `Origin` header:

```bash
curl https://coinlypro-production-20dd.up.railway.app/api/balance/123456789 \
  -H "Origin: https://coinly-pro.vercel.app"
```

### All Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check backend is running |
| `/api/auth` | POST | Authenticate user |
| `/api/balance/:id` | GET | Get user balance |
| `/api/watch-ad` | POST | Record ad watched |
| `/api/history/:id` | GET | Get transactions |
| `/api/withdraw` | POST | Request withdrawal |

---

## 4️⃣ EXPECTED BEHAVIORS

### ✅ SUCCESS Scenarios

| Action | Expected Result |
|--------|-----------------|
| Page Load | Auth logs appear, balance loads |
| Watch Ad | Balance increases, transaction appears |
| Withdraw | Balance decreases, pending status |
| History Tab | Transactions display correctly |

### ❌ FAILURE Scenarios

| Error | Cause | Fix |
|-------|-------|-----|
| `CORS_ERROR` | Origin not whitelisted | Check backend `allowedOrigins` |
| `NETWORK_ERROR` | Backend offline | Restart backend or check Railway |
| `HTTP 500` | Server error | Check backend logs |
| `HTTP 429` | Rate limit | Wait or change user ID |

---

## 5️⃣ CHECK LOGS

### Local Backend (Terminal)
```
[2026-08-08T09:20:25.123Z] POST /api/auth from 127.0.0.1 | Origin: http://localhost:5000
[CORS] Request origin: http://localhost:5000
[CORS] ✓ Origin allowed: http://localhost:5000
```

### Production Backend (Railway Dashboard)
1. Go to Railway Dashboard → Project → Logs
2. Look for similar timestamps and origins

### Browser Console (F12)
```
🔗 API_BASE_URL resolved to: https://coinlypro-production-20dd.up.railway.app
[API DEBUG] {status: 'SUCCESS', url: '...api/auth', ...}
```

---

## 6️⃣ TELEGRAM TESTING CHECKLIST

Before opening in Telegram:
- [ ] Frontend loads at `https://coinly-pro.vercel.app` without errors
- [ ] Backend is running on Railway
- [ ] Browser console shows no CORS errors
- [ ] Local testing works (if tested locally)

In Telegram:
- [ ] Open mini app
- [ ] F12 for DevTools
- [ ] Check console for `API_BASE_URL resolved` message
- [ ] Try watching an ad
- [ ] Check balance updates

---

## 7️⃣ DATABASE CHECK

### Local Database File
```bash
cat server/db.json
```

Shows users, transactions, and withdrawals.

### Production Database
- In-memory on Railway (ephemeral)
- Resets on redeploy
- Use PostgreSQL for persistence if needed

---

## Quick Start: One Command Test

### Test Everything Locally
```bash
cd server && npm install && node index.js
```

Then open `http://localhost:8080` (or your dev port) in browser.

### Test Production Only
Open `https://coinly-pro.vercel.app` → F12 → Console → watch logs

---
