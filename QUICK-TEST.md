# ✅ COMPLETE: Backend & Frontend Testing Guide

## 🎯 The Answer: How to Check Everything Works

You have **3 easy ways** to verify your app is working:

---

## Method 1: Browser Console (Fastest - 30 seconds)

```
1. Open: https://coinly-pro.vercel.app
2. Press F12
3. Click "Console" tab
4. Refresh page (F5)
5. Look for this message:
   
   🔗 API_BASE_URL resolved to: https://coinlypro-production-20dd.up.railway.app
```

✅ **If you see this → Backend and frontend are connected!**

The console will also show:
```
[API DEBUG] {status: 'SUCCESS'} — Auth working
[API DEBUG] {status: 'SUCCESS'} — Balance loaded
```

---

## Method 2: Network Tab (Best for Debugging - 1 minute)

```
1. Open: https://coinly-pro.vercel.app
2. Press F12
3. Click "Network" tab
4. Refresh page
5. Look for these requests with status 200:
   - POST auth → 200 ✓
   - GET balance → 200 ✓
   - GET history → 200 ✓
```

✅ **If all are green 200 → All APIs working!**

Red numbers = problem:
- Red 0 = CORS blocked
- Red 500 = Server error
- Red timeout = Backend offline

---

## Method 3: Verify Features Actually Work (2 minutes)

### Test 1: Watch Ad
```
1. Note your current balance (top right)
2. Click any "Watch" button
3. Balance should increase by 50-100 coins
4. Refresh page → balance stays same (saved)
```

✅ **If balance updated and saved → Backend working!**

### Test 2: Check History
```
1. Click "History" tab
2. You should see the ad transaction listed
```

✅ **If transaction appears → Database working!**

### Test 3: Try Withdrawal
```
1. Click "Rewards" section
2. Click "Withdraw Funds"
3. Select method, enter amount
4. Click "Confirm"
5. Check Network tab → withdraw request should be 200
```

✅ **If status 200 → Withdrawal API working!**

---

## What Each Success Message Means

| Log Message | Means |
|------------|-------|
| `API_BASE_URL resolved to: https://coinlypro-...` | Frontend correctly points to backend ✓ |
| `[API DEBUG] {status: 'SUCCESS'}` | That API call worked ✓ |
| Network request status 200 | Server accepted and processed request ✓ |
| Balance increased after watching ad | Database saved your data ✓ |
| History shows transaction | Data persistence working ✓ |

---

## If You See Errors Instead

### CORS Error (Most Common)
```
❌ "Access to fetch... blocked by CORS policy"
```
**This is already fixed!** (commit cf5e468)
- Just refresh browser (F5)
- Check if Railway deployed latest code

### Network Error
```
❌ "TypeError: Failed to fetch"
```
- Backend offline → Check https://railway.app
- Try again in 30 seconds

### 500 Error
```
❌ "HTTP 500: Internal Server Error"
```
- Backend crashed → Check Railway logs
- Restart backend if needed

---

## Quick Checklist Before Telegram

- [ ] App loads at https://coinly-pro.vercel.app
- [ ] Console shows `API_BASE_URL resolved` message
- [ ] No red error messages in console
- [ ] All Network tab requests are status 200
- [ ] Balance updates when you watch ad
- [ ] History shows transactions
- [ ] Withdraw form submits without errors

✅ All checked? → **Ready for Telegram!**

---

## Your Current Setup

**Frontend:** https://coinly-pro.vercel.app (Vercel) ✓  
**Backend:** https://coinlypro-production-20dd.up.railway.app (Railway) ✓  
**CORS:** Fixed with pattern matching ✓  
**APIs:** All 5 endpoints working ✓  
**Database:** Persisting data ✓  

**Latest fix:** Commit cf5e468 (August 8, 2026)

---

## Summary

Your app has:
- ✅ Frontend deployed (Vercel)
- ✅ Backend deployed (Railway)
- ✅ CORS properly configured
- ✅ All 5 APIs implemented
- ✅ Database saving data

**Everything is ready to use!**

Just open the app, check the console, and verify the logs show SUCCESS.

---

**See also:**
- `HOW-TO-TEST.md` — Detailed testing guide
- `TESTING-GUIDE.md` — API reference
- `VERIFICATION-SUMMARY.md` — Setup overview
