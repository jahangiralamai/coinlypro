# ⚡ Quick Debug Reference Card

## 📱 On Your Phone

1. **Open app:** https://coinlypro.netlify.app
2. **Scroll down** → See "🔍 API DEBUG LOG" box above bottom nav
3. **Each entry shows:**
   - Timestamp
   - HTTP method + URL
   - Status (200 = ✓, FAILED = ✗)
   - Error details if failed

---

## 🟢 Success (What You Want to See)

```
[09:15:23 AM]
POST https://coinlypro-production.up.railway.app/api/auth
Status: 200
✓ User authenticated

[09:15:24 AM]
GET https://coinlypro-production.up.railway.app/api/balance/123456789
Status: 200
✓ Balance loaded
```

---

## 🔴 Failure Types

### **NETWORK_ERROR**
- Backend is down
- **Fix:** Check Railway dashboard, restart service

### **CORS_ERROR** 
- Netlify domain not whitelisted
- **Fix:** Add to `server/index.js` line 52, redeploy

### **HTTP_ERROR 500**
- Server bug
- **Fix:** Check backend logs, find error, fix code

### **HTTP_ERROR 400/401**
- Missing/invalid request data
- **Fix:** Check request parameters

---

## 🖥️ Backend Logs

### **Local**
```bash
cd server
node index.js
# Watch terminal for logs
```

### **Railway Production**

**Option A: Dashboard**
1. Go https://railway.app/dashboard
2. Click project → Click service → Click "Logs"

**Option B: CLI**
```bash
railway login
railway link
railway logs --follow
```

---

## 🧪 Quick Test

**Local:**
```bash
# Terminal 1
cd server && node index.js

# Terminal 2
python -m http.server 8080
# Visit http://localhost:8080
```

**Production:**
```bash
# Check backend is alive
curl https://coinlypro-production.up.railway.app/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

---

## 📊 API Endpoints

All 5 endpoints logged:

| Function | URL |
|----------|-----|
| `initializeApp()` | `POST /api/auth` |
| `loadBalance()` | `GET /api/balance/:id` |
| `renderHistory()` | `GET /api/history/:id` |
| `watchAd()` | `POST /api/watch-ad` |
| `confirmWithdraw()` | `POST /api/withdraw` |

---

## 🎯 Debugging Workflow

1. **See error in debug box** → Identify error type
2. **If NETWORK_ERROR** → Check Railway health, restart if down
3. **If CORS_ERROR** → Add domain to CORS whitelist, redeploy
4. **If HTTP_ERROR 500** → Check backend logs, find stack trace
5. **Screenshot debug box** → Send to me if stuck

---

## 📞 When Asking for Help

Tell me:
- **Error type:** (NETWORK_ERROR, CORS_ERROR, HTTP 500, etc.)
- **Exact error message:** (screenshot debug box)
- **What you clicked:** (which button/page)
- **Local or production:** (localhost or netlify.app)
- **Backend logs show:** (paste from terminal/Railway)

---

## ✅ Checklist Before Debugging

- [ ] Frontend deployed to Netlify
- [ ] Backend running on Railway (or localhost)
- [ ] Debug box appears on screen
- [ ] Can see requests in debug box
- [ ] Backend logs are visible

**Once all checked, we can identify the exact issue.** 🔍
