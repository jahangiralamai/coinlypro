# Ads Rewards Backend Server

This is the backend server for the **Ads Rewards** Telegram Mini App. It handles user authentication, balance management, ad rewards, transaction history, and withdrawal processing.

## 📋 What You Need Before Starting

Before you can run this server, you need:

1. **Node.js** installed on your computer (download from https://nodejs.org/ — get the LTS version)
2. **MongoDB** installed and running locally (download from https://www.mongodb.com/try/download/community)
3. **Your Telegram Bot Token** from @BotFather (if you don't have this yet, see Stage 2 of the production-guide.md)

## 🚀 Quick Start (Step by Step)

### Step 1: Install Dependencies
Open a terminal/command prompt and navigate to the `server` folder, then type:
```bash
npm install
```
This will download and install all the packages needed to run the server.

### Step 2: Set Up Environment Variables
1. Open the `.env` file in this folder with a text editor
2. Replace `your_bot_token_here` with your actual Telegram bot token from @BotFather
3. Make sure `MONGODB_URI` is set to `mongodb://localhost:27017/ads-rewards` (this is the default)
4. Save the file

Example `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ads-rewards
TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg
NODE_ENV=development
```

### Step 3: Start MongoDB
Before running the server, make sure MongoDB is running:

**On Windows:**
- MongoDB usually starts automatically if installed via installer
- Or open Command Prompt and type: `mongod`

**On Mac:**
- If installed via Homebrew: `brew services start mongodb-community`

**On Linux:**
- If installed via package manager: `sudo systemctl start mongod`

You'll know it's working when you see: `waiting for connections on port 27017`

### Step 4: Start the Server
In the `server` folder, type:
```bash
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Backend server running on http://localhost:5000
📊 Health check: http://localhost:5000/health
```

That's it! Your backend is now running.

## 🔗 API Endpoints

The server provides these endpoints (all require the frontend to send the correct data):

### 1. **POST /api/auth** — Login/Register a User
- **What it does:** Creates a new user or returns existing user info
- **Required data:** Telegram user data from the Mini App
- **Example response:**
```json
{
  "success": true,
  "user": {
    "telegram_id": "12345678",
    "first_name": "Jahangir",
    "username": "jahangir_dev",
    "coin_balance": 0,
    "today_earned": 0,
    "lifetime_earned": 0
  }
}
```

### 2. **GET /api/balance/:telegram_id** — Get User Balance
- **What it does:** Returns the user's current coin balance and earnings
- **Example:** `http://localhost:5000/api/balance/12345678`
- **Example response:**
```json
{
  "balance": 2480,
  "today_earned": 180,
  "lifetime_earned": 18940,
  "daily_goal_progress": 180
}
```

### 3. **POST /api/watch-ad** — Record Ad Watch & Award Coins
- **What it does:** Records that a user watched an ad and adds coins to their balance
- **Built-in protections:**
  - Max 5 ads per hour (rate limiting)
  - Can't watch the same ad within 5 minutes
- **Required data:** telegram_id, reward amount, ad_id
- **Example response:**
```json
{
  "success": true,
  "new_balance": 2510,
  "reward_amount": 30
}
```

### 4. **GET /api/history/:telegram_id** — Get Transaction History
- **What it does:** Returns all the user's transactions (ads watched, rewards, withdrawals, etc.)
- **Example:** `http://localhost:5000/api/history/12345678`
- **Example response:**
```json
{
  "transactions": [
    {
      "id": "...",
      "type": "ad",
      "amount": 10,
      "status": "success",
      "created_at": "2026-08-02T...",
      "description": "Ad watched - 10 coins earned"
    }
  ]
}
```

### 5. **POST /api/withdraw** — Create Withdrawal Request
- **What it does:** Creates a withdrawal request and immediately deducts coins (prevents cheating)
- **Built-in protections:**
  - Minimum 100 coins to withdraw
  - Max 3 withdrawal requests per day
  - Checks that user has enough balance
- **Required data:** telegram_id, method (bkash/nagad/rocket/binance/perfect_money), amount, account_number
- **Example response:**
```json
{
  "success": true,
  "withdrawal_id": "...",
  "status": "pending",
  "amount": 500,
  "new_balance": 1980
}
```

### 6. **GET /health** — Health Check
- **What it does:** Simple check to see if the server is running
- **Example:** `http://localhost:5000/health`
- **Example response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## 🗄️ Database Collections (MongoDB)

The server automatically creates these collections:

### **users** Collection
Stores user accounts with balances and earnings:
- `telegram_id` — Unique ID from Telegram
- `first_name` — User's first name
- `username` — Telegram username
- `coin_balance` — Current coins
- `today_earned` — Coins earned today
- `lifetime_earned` — Total coins ever earned
- `created_at` — When account was created

### **transactions** Collection
Records every action (ad watch, reward, withdrawal):
- `telegram_id` — Which user
- `type` — What happened (ad/reward/withdraw/referral)
- `amount` — Coins involved
- `status` — success/pending/failed
- `ad_id` — If it was an ad
- `created_at` — When it happened

### **withdrawals** Collection
Records withdrawal requests:
- `telegram_id` — Which user
- `method` — How they're getting money (bkash/nagad/etc.)
- `amount` — Coins being withdrawn
- `account_number` — Their account number
- `status` — pending/approved/rejected
- `created_at` — When requested

## 🛡️ Built-In Protections

This server includes basic security:

1. **Rate Limiting:** Users can't spam requests
   - Max 5 ad watches per hour
   - Max 3 withdrawal requests per day

2. **Ad Cooldown:** Same ad can't be watched twice within 5 minutes

3. **Double-Spend Prevention:** Coins are deducted immediately on withdrawal (can't request multiple withdrawals with same balance)

4. **Minimum Withdrawal:** Must withdraw at least 100 coins

## 🐛 Troubleshooting

### **"MongoDB connection failed"**
- Make sure MongoDB is running (see Step 3 above)
- Check that the MONGODB_URI in .env is correct

### **"Cannot find module 'express'"**
- Run `npm install` again in the server folder

### **Port 5000 already in use**
- Change PORT in .env to a different number (like 5001)
- Or close the app that's using port 5000

### **Telegram data validation fails**
- Make sure your TELEGRAM_BOT_TOKEN in .env is correct
- Copy it again from @BotFather

## 📝 Next Steps

1. Once the backend is running and working locally, you'll connect it to the frontend (index.html)
2. Then deploy it to production (Railway or Render)
3. Update the frontend to use your production backend URL

## 📧 Support

If something isn't working, check:
1. Is MongoDB running?
2. Is the .env file filled in correctly?
3. Are there any error messages in the terminal?

Good luck! 🚀
