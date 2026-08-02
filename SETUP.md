# 🚀 Ads Rewards (Coinly Pro) - Setup & Launch Guide

## ⚡ Quick Start (1 Minute)

### Option 1: Automatic Startup (Recommended)
**Double-click this file:**
```
START-APP.bat
```

This will:
- ✅ Kill any old processes
- ✅ Start Backend on http://localhost:5000
- ✅ Start Frontend on http://localhost:8080
- ✅ Display success message with URLs

Then **open your browser to:** `http://localhost:8080`

---

### Option 2: Manual Startup

**Terminal 1 - Backend:**
```bash
cd c:\Users\Jahangir Alam\Desktop\Coinly
node server/index.js
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\Jahangir Alam\Desktop\Coinly
python -m http.server 8080
```

Then **open browser to:** `http://localhost:8080`

---

## 🔍 Verify Everything is Working

### Check Backend API
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-08-02T..."}
```

### Check Frontend
Open browser: `http://localhost:8080`

Should show:
- ✅ "Connection error" toast **disappears** after 2 seconds
- ✅ Real balance loads from backend
- ✅ Real ads appear
- ✅ "Watch" buttons are clickable

---

## 🧪 Test Full Flow

### 1. Watch an Ad
1. Click "Watch" button on any ad
2. Wait 5 seconds for countdown
3. See bonus popup (+10, +25, or +50 coins)
4. Balance updates immediately
5. Ad marked as "Watched"

### 2. Check History
1. Go to "History" tab
2. Click "Ads Watched" filter
3. See your watched ads listed with timestamps

### 3. Withdraw Coins
1. Go to "Rewards" tab
2. Click any method (bKash, Nagad, Rocket, etc.)
3. Enter amount (minimum 100 coins)
4. Click "Confirm"
5. Success toast appears
6. Balance deducted
7. Withdrawal appears in History with "pending" status

### 4. Test Error Handling
- Try watching >5 ads in 1 hour → Rate limit message
- Try watching same ad twice in 5 minutes → Cooldown message
- Try withdrawing <100 coins → Minimum validation error
- Close backend → "Connection error, using demo mode"

---

## 📂 Project Structure

```
Coinly/
├── index.html              # Frontend UI (no changes needed)
├── START-APP.bat          # Quick startup script ⭐
├── SETUP.md               # This file
├── server/
│   ├── index.js           # Backend server (file-based DB)
│   ├── package.json       # Dependencies
│   ├── .env              # Environment variables
│   ├── db.json           # Database (auto-created)
│   └── node_modules/     # Packages
└── backups/
    └── index-*.html      # HTML backups
```

---

## 🗄️ Database

**Location:** `server/db.json`

The database automatically saves:
- User balances
- All transactions (ads, withdrawals)
- Ad cooldowns
- Withdrawal history

**Inspect data:**
```bash
type server\db.json
```

**Reset database:**
```bash
del server\db.json
REM Server will create fresh db.json on next startup
```

---

## 🛠️ Troubleshooting

### Problem: "Connection error, using demo mode"

**Solution:** Ensure backend is running
```bash
# Check if port 5000 is listening
netstat -ano | findstr :5000

# If not, start backend from PROJECT ROOT (not server folder):
cd c:\Users\Jahangir Alam\Desktop\Coinly
node server/index.js
```

### Problem: "Cannot find module" error

**Solution:** Make sure you're in the correct directory
```bash
# ❌ Wrong:
cd server
node index.js

# ✅ Correct:
cd c:\Users\Jahangir Alam\Desktop\Coinly
node server/index.js
```

### Problem: "Address already in use"

**Solution:** Port 5000 or 8080 is already occupied
```bash
# Kill all Node and Python processes:
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# Then restart using START-APP.bat
```

### Problem: Python HTTP server not starting

**Solution:** Install Python if needed
```bash
python --version
# If not found, download from python.org or use Node alternative

# Alternative: Use Node for frontend too
cd c:\Users\Jahangir Alam\Desktop\Coinly
npx serve -l 8080
```

---

## 📋 API Endpoints

All running on `http://localhost:5000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth` | Authenticate user |
| GET | `/api/balance/:id` | Get user balance |
| POST | `/api/watch-ad` | Record ad watch & reward |
| GET | `/api/history/:id` | Get transaction history |
| POST | `/api/withdraw` | Request withdrawal |
| GET | `/api/user/:id` | Get full user data |
| GET | `/health` | Health check |

---

## 🔐 Security Features

✅ **Rate Limiting**
- Max 5 ads per hour
- Max 3 withdrawals per day

✅ **Ad Cooldown**
- Can't watch same ad within 5 minutes

✅ **Double-Spend Prevention**
- Coins deducted immediately on withdrawal

✅ **Validation**
- Minimum 100 coins for withdrawal
- Sufficient balance check

✅ **Error Handling**
- Graceful fallback to demo mode
- User-friendly error messages

---

## 🚀 Next Steps

**When you want production MongoDB:**
1. Install MongoDB locally or use MongoDB Atlas
2. I can revert server to MongoDB version
3. Deploy to cloud (Heroku, Railway, Render, etc.)

**Current Setup is Perfect for:**
- ✅ Local development
- ✅ Testing all features
- ✅ Debugging
- ✅ Demo/POC
- ✅ Learning

---

## 📚 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript, Telegram WebApp SDK |
| **Backend** | Node.js, Express.js |
| **Database** | JSON file (development), MongoDB (production) |
| **Server** | Python HTTP Server (frontend), Express (backend) |
| **Deployment** | GitHub, local development |

---

## 💡 Quick Commands

```bash
# Start everything
START-APP.bat

# Check if running
curl http://localhost:5000/health

# View database
type server\db.json

# Reset database
del server\db.json

# View backend logs
# (Check terminal running backend)

# Kill all processes
taskkill /F /IM node.exe
taskkill /F /IM python.exe
```

---

## ✅ Checklist Before Testing

- [ ] Both terminal windows open (backend + frontend)
- [ ] Backend shows "🚀 Backend server running on http://localhost:5000"
- [ ] Frontend shows "Serving HTTP on 0.0.0.0 port 8080"
- [ ] Browser opened to http://localhost:8080
- [ ] "Connection error" message disappears after 2 seconds
- [ ] Real balance (2,480) shows instead of just demo data
- [ ] Ready to test!

---

**Everything is working! You're all set.** 🎉

Need help? Check the error message in the browser console (F12) or the backend terminal.
