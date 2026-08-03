# 🔍 Comprehensive Debugging Guide — API Connection Issues

**Commit:** `ea7758b` — "Add comprehensive API debugging infrastructure"  
**Date:** August 3, 2026

---

## 📋 OVERVIEW

This guide explains how to debug the connection failure between:
- **Frontend:** https://coinlypro.netlify.app (Netlify)
- **Backend:** https://coinlypro-production.up.railway.app (Railway)

Both URLs work fine individually, but the app shows "Connection error, using demo mode" when trying to connect.

---

## 🎯 WHAT WAS ADDED

### **Frontend (index.html)**

1. **Visible Debug Box** — Shows on your phone, no DevTools needed
   - Location: Bottom of screen, above bottom nav
   - Shows last 20 API requests/responses
   - Color-coded: Green = success, Red = error
   - Displays: Timestamp, URL, HTTP status, error type, error message

2. **All 5 API Endpoints Wrapped with Logging**
   - `POST /api/auth` — User authentication
   - `GET /api/balance/:id` — Fetch balance
   - `POST /api/watch-ad` — Record ad watch
   - `GET /api/history/:id` — Fetch transaction history
   - `POST /api/withdraw` — Submit withdrawal

3. **Error Type Detection**
   - `NETWORK_ERROR` — Browser can't reach backend (CORS, DNS, timeout, network down)
   - `HTTP_ERROR` — Server responded with 4xx/5xx status
   - `CORS_ERROR` — Request blocked by CORS policy
   - `JSON_PARSE_ERROR` — Response isn't valid JSON
   - `TIMEOUT` — Request took too long
   - `UNKNOWN_ERROR` — Other error

### **Backend (server/index.js)**

1. **Request Logging on All Endpoints**
   - `GET /health` — Logs: timestamp, IP, origin
   - `POST /api/auth` — Logs: timestamp, IP, origin, auth data
   - `GET /api/balance/:id` — Logs: timestamp, IP, user ID
   - `POST /api/watch-ad` — Logs: timestamp, IP, user, reward
   - `GET /api/history/:id` — Logs: timestamp, IP, user ID
   - `POST /api/withdraw` — Logs: timestamp, IP, user, method, amount

2. **CORS Configuration** (Lines 49-58)
   ```javascript
   app.use(cors({
     origin: [
       'https://coinlypro.netlify.app',      // Production frontend
       'http://localhost:8080',               // Local dev (Python HTTP server)
       'http://localhost:3000',               // Local dev (Node dev server)
       'http://127.0.0.1:8080',               // Local dev alt
       'http://127.0.0.1:3000'                // Local dev alt
     ],
     credentials: true
   }));
   ```

---

## 📍 API_BASE_URL DEFINITION

**File:** `index.html`  
**Lines:** 813-817

```javascript
const API_BASE_URL = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://coinlypro-production.up.railway.app';
```

**Behavior:**
- Local: `http://localhost:5000`
- Production: `https://coinlypro-production.up.railway.app`

---

## 🔄 ALL FETCH CALLS & THEIR EXACT URLS

### **On Production (https://coinlypro.netlify.app)**

| Function | Method | Endpoint | Full URL |
|----------|--------|----------|----------|
| `initializeApp()` | POST | `/api/auth` | `https://coinlypro-production.up.railway.app/api/auth` |
| `loadBalance()` | GET | `/api/balance/:id` | `https://coinlypro-production.up.railway.app/api/balance/[telegram_id]` |
| `renderHistory()` | GET | `/api/history/:id` | `https://coinlypro-production.up.railway.app/api/history/[telegram_id]` |
| `watchAd()` | POST | `/api/watch-ad` | `https://coinlypro-production.up.railway.app/api/watch-ad` |
| `confirmWithdraw()` | POST | `/api/withdraw` | `https://coinlypro-production.up.railway.app/api/withdraw` |

### **On Local Dev (http://localhost:8080)**

| Function | Method | Endpoint | Full URL |
|----------|--------|----------|----------|
| `initializeApp()` | POST | `/api/auth` | `http://localhost:5000/api/auth` |
| `loadBalance()` | GET | `/api/balance/:id` | `http://localhost:5000/api/balance/[telegram_id]` |
| `renderHistory()` | GET | `/api/history/:id` | `http://localhost:5000/api/history/[telegram_id]` |
| `watchAd()` | POST | `/api/watch-ad` | `http://localhost:5000/api/watch-ad` |
| `confirmWithdraw()` | POST | `/api/withdraw` | `http://localhost:5000/api/withdraw` |

---

## 📱 HOW TO READ THE DEBUG BOX ON YOUR PHONE

### **Step 1: Open the App**
```
Visit: https://coinlypro.netlify.app (or http://localhost:8080 locally)
```

### **Step 2: Look at the Bottom of Screen**
Above the blue bottom navigation bar, you'll see a dark box labeled "🔍 API DEBUG LOG"

### **Step 3: Interpret the Log Entries**

Each entry shows:
```
[09:15:23 AM]                          ← Timestamp
POST https://coinlypro.../.../api/auth ← Method + Full URL
Status: 200                             ← HTTP status code
                                        ← If error, shows error type and message
```

### **Step 4: Trigger API Calls**

To populate the debug box, interact with the app:
- **Auth**: Refresh page → triggers `initializeApp()`
- **Balance**: After auth, balance auto-loads
- **Watch Ad**: Click any "Watch" button → triggers `watchAd()`
- **History**: Click "History" tab → triggers `renderHistory()`
- **Withdraw**: Click "Rewards" → Click any method → Click "Confirm"

---

## 🟢 WHAT SUCCESS LOOKS LIKE

**On Local Dev:**
```
09:15:23 AM
POST http://localhost:5000/api/auth
Status: 200
✓ (green border, no error message)

09:15:24 AM
GET http://localhost:5000/api/balance/123456789
Status: 200
✓ Balance loaded
```

**On Production:**
```
09:15:23 AM
POST https://coinlypro-production.up.railway.app/api/auth
Status: 200
✓ User authenticated

09:15:24 AM
GET https://coinlypro-production.up.railway.app/api/balance/123456789
Status: 200
✓ Balance loaded
```

---

## 🔴 WHAT FAILURE LOOKS LIKE

### **NETWORK_ERROR**
```
09:15:23 AM
POST https://coinlypro-production.up.railway.app/api/auth
Status: FAILED
NETWORK_ERROR: Failed to fetch
```
**Means:** Browser can't reach the server at all
- Railway backend is down
- Network connectivity issue
- DNS resolution failed

---

### **CORS Error (blocked)**
```
09:15:23 AM
POST https://coinlypro-production.up.railway.app/api/auth
Status: FAILED
CORS_ERROR: Access to XMLHttpRequest at 'https://coinlypro-...' from 
origin 'https://coinlypro.netlify.app' has been blocked by CORS policy
```
**Means:** Backend received request but rejected it due to CORS
- Netlify domain not in CORS whitelist
- Origin header mismatch
- Backend not allowing credentials

---

### **HTTP 4xx/5xx Error**
```
09:15:23 AM
POST https://coinlypro-production.up.railway.app/api/auth
Status: 500
HTTP_ERROR: Status 500: Internal Server Error
```
**Means:** Backend responded but with an error
- 400 = Bad request (missing params)
- 401 = Unauthorized
- 500 = Server error

---

## 📊 BACKEND REQUEST LOGS

To see backend logs, follow the instructions below for your deployment method.

### **Local Development**

1. **Terminal Running Backend**
   ```
   cd server
   node index.js
   ```

2. **Watch for Log Output**
   ```
   [2026-08-03T18:15:23.456Z] POST /api/auth from 127.0.0.1 | Origin: http://localhost:8080
   [2026-08-03T18:15:24.789Z] GET /api/balance/123456789 from 127.0.0.1
   ```

3. **Errors Log Explicitly**
   ```
   [2026-08-03T18:15:25.123Z] AUTH FAILED: Invalid Telegram data
   Auth error: TypeError: Cannot read property 'id' of null
   ```

---

### **Railway Production**

#### **Option 1: Railway Dashboard**

1. **Go to Railway Dashboard**
   ```
   https://railway.app/dashboard
   ```

2. **Click Project: "coinly-pro"** or your Railway project name

3. **Select Service: "server"** or your backend service

4. **Click "Logs" Tab**

5. **Real-time logs appear**
   ```
   [2026-08-03T18:15:23.456Z] POST /api/auth from 12.34.56.78 | Origin: https://coinlypro.netlify.app
   [2026-08-03T18:15:24.789Z] GET /api/balance/123456789 from 12.34.56.78
   ```

#### **Option 2: Railway CLI**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Link to Project**
   ```bash
   cd c:\Users\Jahangir Alam\Desktop\Coinly
   railway link
   ```

4. **View Live Logs**
   ```bash
   railway logs
   ```

5. **Follow logs in real-time**
   ```bash
   railway logs --follow
   ```

#### **Option 3: Railway Web Terminal** (if available)

1. Go to Railway Dashboard
2. Select your service
3. Click "Terminal" or "Shell" tab
4. Run: `tail -f /var/log/app.log` (or similar)

---

## 🧪 TESTING CHECKLIST

### **Test 1: Local Development**

- [ ] Start backend: `cd server && node index.js`
- [ ] Start frontend: `python -m http.server 8080` or `npm start`
- [ ] Open http://localhost:8080
- [ ] Check debug box — should show green "200" responses
- [ ] Watch terminal running backend — should see console.log output
- [ ] Click "Watch" button — debug box should update immediately
- [ ] Check backend terminal — should show POST /api/watch-ad log

**Expected:** All requests succeed with 200 status, zero errors

---

### **Test 2: Production with Local Backend**

- [ ] Deploy frontend to Netlify: `git push`
- [ ] Wait for Netlify build to complete
- [ ] Start local backend: `cd server && node index.js`
- [ ] Open https://coinlypro.netlify.app on your phone
- [ ] Check debug box — might show CORS_ERROR or NETWORK_ERROR
- [ ] This is expected because Netlify frontend talks to localhost:5000
- [ ] (Note: This won't work because browser can't reach localhost from Netlify)

**Expected:** CORS or NETWORK errors (this setup doesn't work in production)

---

### **Test 3: Production with Production Backend**

- [ ] Railway backend running (check at: https://coinlypro-production.up.railway.app/health)
- [ ] Frontend deployed to Netlify
- [ ] Open https://coinlypro.netlify.app on your phone
- [ ] Check debug box
  - If green "200": Connection works ✓
  - If NETWORK_ERROR: Backend down or unreachable
  - If CORS_ERROR: CORS configuration issue
  - If HTTP error: Backend error
- [ ] Click "Watch" button and check debug box for response

**Expected:** All requests show status 200

---

## 🔧 WHAT TO CHECK IF IT'S FAILING

### **If You See NETWORK_ERROR**

1. **Check if Railway backend is running:**
   ```bash
   curl https://coinlypro-production.up.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **If that fails:**
   - Go to Railway Dashboard
   - Check if service is running (green status)
   - Check logs for startup errors
   - Restart the service

3. **Check network connectivity:**
   - Try pinging another API: `curl https://api.github.com/user` (should fail without auth, but not NETWORK_ERROR)

---

### **If You See CORS_ERROR**

1. **Verify Netlify domain in CORS whitelist:**
   ```bash
   # Check server/index.js lines 49-58
   # Should include: 'https://coinlypro.netlify.app'
   ```

2. **If not there, add it:**
   ```javascript
   app.use(cors({
     origin: [
       'https://coinlypro.netlify.app',    // ← Add this
       'http://localhost:8080',
       'http://localhost:3000',
       'http://127.0.0.1:8080',
       'http://127.0.0.1:3000'
     ],
     credentials: true
   }));
   ```

3. **Commit and push:**
   ```bash
   git add server/index.js
   git commit -m "Fix: Add Netlify domain to CORS whitelist"
   git push origin main
   ```

4. **Restart Railway:**
   - Go to Railway Dashboard
   - Restart the service
   - Wait for redeployment

---

### **If You See HTTP_ERROR (500)**

1. **Check backend logs:**
   - Local: Watch terminal running `node index.js`
   - Railway: Go to Logs tab in Railway Dashboard

2. **Look for errors like:**
   ```
   Auth error: ReferenceError: Cannot find variable 'db'
   Watch ad error: TypeError: telegram_id is undefined
   ```

3. **Fix in server/index.js and redeploy**

---

### **If Debug Box Is Empty**

1. **Refresh the page**
2. **Open DevTools (F12) → Console**
3. **Look for any JavaScript errors**
4. **Check if page loaded properly**
5. **Click a button to trigger an API call**

---

## 📝 DEBUG LOG REFERENCE

### **Frontend Debug Log Entry Format**

```javascript
{
  timestamp: "09:15:23 AM",           // When request was sent
  url: "https://coinlypro-production.up.railway.app/api/auth",  // Full URL
  method: "POST",                     // HTTP method
  status: "200",                      // HTTP status or "SENDING"/"FAILED"
  errorType: "NONE",                  // "NONE", "NETWORK_ERROR", "HTTP_ERROR", "CORS", etc.
  errorMsg: "User authenticated"      // Success message or error details
}
```

### **Backend Console Log Format**

```
[2026-08-03T18:15:23.456Z] POST /api/auth from 12.34.56.78 | Origin: https://coinlypro.netlify.app
[2026-08-03T18:15:25.123Z] AUTH FAILED: Invalid Telegram data
Auth error: TypeError: Cannot read property 'id' of null
```

---

## 🎯 KEY DIFFERENCES TO LOOK FOR

| Scenario | Frontend Debug Box | Backend Logs | Interpretation |
|----------|-------------------|--------------|-----------------|
| ✓ Works | Status: 200, no error | Request received, no errors | Everything OK |
| ✗ Backend down | NETWORK_ERROR | (no log) | Railway service not running |
| ✗ CORS issue | CORS_ERROR | Request received (logged) | Netlify domain not whitelisted |
| ✗ Bad request | HTTP_ERROR 400 | AUTH FAILED: ... | Missing required fields |
| ✗ Server error | HTTP_ERROR 500 | Error: ... stack trace | Bug in backend code |

---

## 📞 NEXT STEPS

### **After You See the Logs**

1. **Screenshot or copy the debug log** from the visible debug box
2. **Copy the backend logs** from terminal or Railway Dashboard
3. **Compare timestamps** to see if requests line up
4. **Identify error type** from the reference above
5. **Tell me the error type and message** — I can help fix it

### **To Share Debug Info with Me**

Tell me:
1. **Frontend debug box shows:** (copy exactly)
2. **Backend logs show:** (copy exactly)
3. **When did it happen:** (timestamp)
4. **What were you clicking:** (which button, which page)
5. **Local or production:** (localhost or netlify.app)

---

## 🚀 PRODUCTION CHECKLIST

Before we fix bugs, verify:

- [ ] Railway backend running and healthy
- [ ] `/health` endpoint responds with 200
- [ ] Frontend deployed to Netlify
- [ ] Debug box appears on screen
- [ ] API requests are being logged (in debug box and backend logs)
- [ ] Timestamps match between frontend and backend logs
- [ ] Clear error messages visible in debug box

**Once all checked, we have visibility and can diagnose the exact issue together.**

---

**Debugging infrastructure is now in place. No fixes yet — just visibility.** 🔍
