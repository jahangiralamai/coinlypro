# How to Check Backend & Frontend Work Properly

## 🚀 QUICK START (5 minutes)

### Step 1: Open Your App
```
https://coinly-pro.vercel.app
```

### Step 2: Open Browser DevTools
Press **F12** (or Cmd+Opt+I on Mac)

### Step 3: Check Console Tab
You should see these logs immediately:

```
🔗 API_BASE_URL resolved to: https://coinlypro-production-20dd.up.railway.app
🌐 Current hostname: coinly-pro.vercel.app
```

If you see these → **Frontend is working correctly** ✅

### Step 4: Watch the Console
As the page loads, you'll see:

```
[API DEBUG] {timestamp: '9:20:25 AM', url: '...api/auth', method: 'POST', status: 'SUCCESS'}
[API DEBUG] {timestamp: '9:20:26 AM', url: '...api/balance/123456789', method: 'GET', status: 'SUCCESS'}
```

If all say `status: 'SUCCESS'` → **Backend is working correctly** ✅

---

## ✅ What "Working Properly" Looks Like

### Frontend Console (No Errors)
```
✓ API_BASE_URL resolved correctly
✓ No red errors in console
✓ All API calls show status: SUCCESS
✓ Balance displays (e.g., 2,480 coins)
✓ History loads transactions
```

### App UI (All Sections Visible)
```
✓ Top: User name + balance displayed
✓ Home: "Watch Ads" section with buttons
✓ Rewards: Withdraw button visible
✓ History: Transaction list shown
```

### Test Each Feature
| Feature | How to Test | Expected Result |
|---------|------------|-----------------|
| **Auth** | Page loads | User authenticated in console |
| **Balance** | Page loads | Shows your coins balance |
| **Watch Ad** | Click "Watch" button | Balance increases, console shows success |
| **Withdraw** | Click Rewards → Withdraw method | Form opens, submission works |
| **History** | Click History tab | Transactions list appears |

---

## ❌ What "NOT Working" Looks Like

### CORS Error (Most Common)
```
Access to fetch at 'https://coinlypro-production.../api/auth' from origin 'https://coinly-pro.vercel.app' 
has been blocked by CORS policy
```

**This means:** Backend is not accepting requests from your frontend  
**Status:** ✅ Already fixed! (Commit cf5e468)

### Network Error
```
TypeError: Failed to fetch
```

**This means:** Backend might be down or unreachable  
**Fix:** Check Railway status at https://railway.app

### 500 Error
```
HTTP 500: Internal Server Error
```

**This means:** Backend crashed  
**Fix:** Check Railway logs, restart if needed

---

## 🔍 Testing Method 1: Browser Console (Easiest)

1. Open app: `https://coinly-pro.vercel.app`
2. Press **F12**
3. Click **Console** tab
4. Refresh page (F5)
5. Watch for logs

**Look for:**
- `API_BASE_URL resolved to:` message ✓
- `[API DEBUG]` lines with `SUCCESS` status ✓
- No red error messages ✓

---

## 🔍 Testing Method 2: Network Tab (Best for Debugging)

1. Open app: `https://coinly-pro.vercel.app`
2. Press **F12**
3. Click **Network** tab
4. Refresh page
5. Watch requests appear

## 🔍 Testing Method 4: Local Testing (Development)

If you want to test locally before production:

```bash
# Terminal 1: Start backend
cd server
npm install
node index.js
```

Expected output:
```
🚀 Backend server running on http://localhost:5000
📊 Health check: http://localhost:5000/health
```

Then open frontend locally (your dev server port, typically 8080)

**In console you should see:**
```
🔗 API_BASE_URL resolved to: http://localhost:5000
🌐 Current hostname: localhost
```

---

## ✨ Complete Testing Checklist

### Before Opening in Telegram

- [ ] **Backend Status** → Railway app is "Running"
- [ ] **Frontend Status** → Vercel deployment "Ready"
- [ ] **CORS Fixed** → Latest commit cf5e468 deployed
- [ ] **No Console Errors** → F12 shows no red messages
- [ ] **API Calls Success** → All show status 200 in Network tab
- [ ] **Balance Displays** → Shows correct coin amount
- [ ] **Data Persists** → After refresh, balance unchanged

### In Telegram

- [ ] Mini app opens
- [ ] Balance displays
- [ ] Can watch ads (balance increases)
- [ ] Can submit withdraw form
- [ ] No red errors in DevTools

---

## 📊 Performance Expectations

| Operation | Expected Time |
|-----------|--------------|
| Page load | < 2 seconds |
| Auth call | < 200ms |
| Get balance | < 100ms |
| Watch ad | < 300ms |
| Withdraw | < 300ms |

---

## 🚨 Quick Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| CORS Error | Backend blocking origin | ✅ Already fixed (cf5e468) - just refresh |
| Network Error | Backend offline | Check Railway dashboard |
| 500 Error | Server crash | Check Railway logs |
| Balance not updating | Rate limit or error | Check console for error message |
| UI not loading | Frontend issue | Check browser console for JS errors |

---

## 📝 Files to Know About

| File | Purpose |
|------|---------|
| `index.html` | Frontend (lines 813-818: API_BASE_URL config) |
| `server/index.js` | Backend (lines 48-68: CORS allowedOrigins) |
| `server/db.json` | Local database (your test data) |
| `HOW-TO-TEST.md` | This testing guide |
| `TESTING-GUIDE.md` | Detailed testing reference |

---

## ✅ Current Status (August 8, 2026)

**Frontend:** https://coinly-pro.vercel.app ✅  
**Backend:** https://coinlypro-production-20dd.up.railway.app ✅  
**CORS:** Fixed with pattern matching (cf5e468) ✅  
**All endpoints:** Working (auth, balance, watch-ad, history, withdraw) ✅  

---

## 🎯 One-Line Test

Open browser console and paste:
```javascript
fetch('https://coinlypro-production-20dd.up.railway.app/health').then(r=>r.json()).then(d=>console.log('✓ Backend OK:', d))
```

If you see `✓ Backend OK: {status: "ok"...}` → Backend is alive ✅

---

**Everything is set up and ready to go!**  
Just open the app, check console, and verify the logs appear correctly.

**Look for these requests with Status 200:**
- auth
- balance
- watch-ad
- history
- withdraw

All should be **green 200 (OK)**

If you see red numbers:
- **0** = CORS error (blocked by backend)
- **500** = Server error
- **timeout** = Backend offline

---

## 🔍 Testing Method 3: Backend Logs (Production)

1. Go to: https://railway.app
2. Login
3. Select your Coinly project
4. Click **Logs** tab
5. Refresh frontend app
6. Watch logs appear in real-time

**You should see:**
```
[2026-08-08T09:20:25] POST /api/auth from IP | Origin: https://coinly-pro.vercel.app
[CORS] ✓ Origin allowed: https://coinly-pro.vercel.app
[2026-08-08T09:20:26] GET /api/balance/123456789 from IP
```

If it says `✓ Origin allowed` → **CORS working** ✅
