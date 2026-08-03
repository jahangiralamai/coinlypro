require('dotenv').config();
const express = require('express');
const crypto = require('crypto-js');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// In-memory database (for development, persisted to JSON file)
const DB_FILE = path.join(__dirname, 'db.json');

let db = {
  users: {},
  transactions: [],
  withdrawals: [],
  adCooldowns: {} // Track ad watch cooldowns
};

// Load database from file
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
    }
  } catch (err) {
    console.warn('Could not load database file, using fresh data');
    db = { users: {}, transactions: [], withdrawals: [], adCooldowns: {} };
  }
}

// Save database to file
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Could not save database:', err.message);
  }
}

// Load database on startup
loadDB();

// Middleware
app.use(cors({
  origin: [
    'https://coinlypro.netlify.app',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Explicitly handle preflight requests
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.ip} | Origin: ${req.get('origin') || 'none'} | Host: ${req.get('host')}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /health from ${req.ip} | Origin: ${req.get('origin') || 'none'}`);
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper: Validate Telegram initData (simple validation)
function validateTelegramData(initData) {
  if (!initData) return null;
  try {
    const params = new URLSearchParams(initData);
    const user = params.get('user');
    return user ? JSON.parse(user) : null;
  } catch (err) {
    return null;
  }
}

// Helper: Rate limiting (in-memory)
const rateLimitMap = {};
function checkRateLimit(key, maxRequests = 5, windowMs = 3600000) {
  const now = Date.now();
  if (!rateLimitMap[key]) {
    rateLimitMap[key] = [];
  }
  rateLimitMap[key] = rateLimitMap[key].filter(t => now - t < windowMs);
  if (rateLimitMap[key].length >= maxRequests) {
    return false;
  }
  rateLimitMap[key].push(now);
  return true;
}

// Helper: Get or create user
function getOrCreateUser(telegramId, user = {}) {
  if (!db.users[telegramId]) {
    db.users[telegramId] = {
      telegram_id: telegramId,
      name: user.first_name || 'User',
      username: user.username || '',
      balance: 2480,
      today_earned: 180,
      lifetime_earned: 18940,
      referral_code: `USER${telegramId}`,
      created_at: new Date().toISOString()
    };
    saveDB();
  }
  return db.users[telegramId];
}

// ============ API ENDPOINTS ============

// POST /api/auth - Authenticate user via Telegram
app.post('/api/auth', (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/auth from ${req.ip} | Origin: ${req.get('origin') || 'none'}`);
  try {
    const { initData } = req.body;
    const user = validateTelegramData(initData);
    
    if (!user || !user.id) {
      console.log(`[${new Date().toISOString()}] AUTH FAILED: Invalid Telegram data`);
      return res.status(400).json({ error: 'Invalid Telegram data' });
    }
    
    const telegramId = user.id.toString();
    const userData = getOrCreateUser(telegramId, user);
    
    res.json({
      success: true,
      user: {
        telegram_id: telegramId,
        name: user.first_name,
        username: user.username,
        balance: userData.balance,
        today_earned: userData.today_earned,
        lifetime_earned: userData.lifetime_earned
      }
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET /api/balance/:telegram_id - Get user balance
app.get('/api/balance/:telegram_id', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/balance/${req.params.telegram_id} from ${req.ip}`);
  try {
    const telegramId = req.params.telegram_id;
    const user = getOrCreateUser(telegramId);
    
    res.json({
      balance: user.balance,
      today_earned: user.today_earned,
      lifetime_earned: user.lifetime_earned,
      daily_goal: 260,
      daily_goal_max: 400
    });
  } catch (err) {
    console.error('Balance error:', err);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// POST /api/watch-ad - Record ad watch and reward user
app.post('/api/watch-ad', (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/watch-ad from ${req.ip} | User: ${req.body.telegram_id} | Reward: ${req.body.reward}`);
  try {
    const { telegram_id, reward, ad_id } = req.body;
    
    if (!telegram_id || !reward || !ad_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check rate limit (max 5 ads per hour)
    if (!checkRateLimit(`ad_${telegram_id}`, 5, 3600000)) {
      return res.status(429).json({ error: 'Too many ads watched. Try again later.' });
    }
    
    // Check ad cooldown (can't watch same ad within 5 minutes)
    const cooldownKey = `ad_${telegram_id}_${ad_id}`;
    if (db.adCooldowns[cooldownKey]) {
      const timeSinceLastWatch = Date.now() - db.adCooldowns[cooldownKey];
      if (timeSinceLastWatch < 5 * 60 * 1000) { // 5 minutes
        return res.status(429).json({ error: 'This ad was recently watched. Try another ad.' });
      }
    }
    
    const user = getOrCreateUser(telegram_id);
    user.balance += reward;
    user.today_earned += reward;
    user.lifetime_earned += reward;
    
    // Record transaction
    db.transactions.push({
      telegram_id,
      type: 'ad',
      description: `Ad watched — Reward earned`,
      amount: reward,
      status: 'success',
      ad_id,
      created_at: new Date().toISOString()
    });
    
    // Record ad cooldown
    db.adCooldowns[cooldownKey] = Date.now();
    
    saveDB();
    
    res.json({
      success: true,
      new_balance: user.balance,
      reward_amount: reward,
      message: `Earned ${reward} coins!`
    });
  } catch (err) {
    console.error('Watch ad error:', err);
    res.status(500).json({ error: 'Failed to process ad reward' });
  }
});

// GET /api/history/:telegram_id - Get user transaction history
app.get('/api/history/:telegram_id', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/history/${req.params.telegram_id} from ${req.ip}`);
  try {
    const telegramId = req.params.telegram_id;
    
    // Get all transactions for this user, sorted by date (newest first)
    const userTransactions = db.transactions
      .filter(t => t.telegram_id === telegramId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50); // Last 50 transactions
    
    res.json({
      transactions: userTransactions
    });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/withdraw - Request withdrawal
app.post('/api/withdraw', (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/withdraw from ${req.ip} | User: ${req.body.telegram_id} | Method: ${req.body.method} | Amount: ${req.body.amount}`);
  try {
    const { telegram_id, method, amount, account_number } = req.body;
    
    if (!telegram_id || !method || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate minimum withdrawal
    if (amount < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal is 100 coins' });
    }
    
    const user = getOrCreateUser(telegram_id);
    
    // Check balance
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Check rate limit (max 3 withdrawals per day)
    const today = new Date().toDateString();
    const withdrawalTodayKey = `withdraw_${telegram_id}_${today}`;
    if (!checkRateLimit(withdrawalTodayKey, 3, 24 * 3600000)) {
      return res.status(429).json({ error: 'Maximum 3 withdrawals per day. Try tomorrow.' });
    }
    
    // Deduct balance immediately (prevent double-spend)
    user.balance -= amount;
    
    // Create withdrawal record
    const withdrawalId = `w_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    db.withdrawals.push({
      id: withdrawalId,
      telegram_id,
      method,
      amount,
      account_number: account_number || 'pending',
      status: 'pending',
      created_at: new Date().toISOString()
    });
    
    // Record transaction
    db.transactions.push({
      telegram_id,
      type: 'withdraw',
      description: `Withdrawal request — ${method}`,
      amount: -amount,
      status: 'pending',
      withdrawal_id: withdrawalId,
      created_at: new Date().toISOString()
    });
    
    saveDB();
    
    res.json({
      success: true,
      withdrawal_id: withdrawalId,
      new_balance: user.balance,
      amount,
      method,
      status: 'pending',
      message: `Withdrawal request submitted for review`
    });
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// GET /api/user/:telegram_id - Get full user data
app.get('/api/user/:telegram_id', (req, res) => {
  try {
    const telegramId = req.params.telegram_id;
    const user = getOrCreateUser(telegramId);
    
    res.json({
      user
    });
  } catch (err) {
    console.error('User error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Database: In-memory (persisted to db.json)\n`);
});
