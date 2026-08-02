require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto-js');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ads-rewards';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

let db = null;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('ads-rewards');
    
    // Create collections if they don't exist
    await db.createCollection('users').catch(() => {});
    await db.createCollection('transactions').catch(() => {});
    await db.createCollection('withdrawals').catch(() => {});
    
    // Create indexes
    await db.collection('users').createIndex({ telegram_id: 1 }, { unique: true }).catch(() => {});
    await db.collection('transactions').createIndex({ telegram_id: 1 }).catch(() => {});
    await db.collection('withdrawals').createIndex({ telegram_id: 1 }).catch(() => {});
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

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

// Helper: Rate limiting (in-memory, simple)
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

// ============ API ENDPOINTS ============

// POST /api/auth - Authenticate user via Telegram
app.post('/api/auth', async (req, res) => {
  try {
    const { initData } = req.body;
    const user = validateTelegramData(initData);
    
    if (!user || !user.id) {
      return res.status(400).json({ error: 'Invalid Telegram data' });
    }
    
    const telegramId = user.id.toString();
    const usersCol = db.collection('users');
    
    // Find or create user
    let dbUser = await usersCol.findOne({ telegram_id: telegramId });
    
    if (!dbUser) {
      dbUser = {
        telegram_id: telegramId,
        first_name: user.first_name || 'User',
        username: user.username || null,
        coin_balance: 0,
        today_earned: 0,
        lifetime_earned: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };
      await usersCol.insertOne(dbUser);
    }
    
    res.json({
      success: true,
      user: {
        telegram_id: dbUser.telegram_id,
        first_name: dbUser.first_name,
        username: dbUser.username,
        coin_balance: dbUser.coin_balance,
        today_earned: dbUser.today_earned,
        lifetime_earned: dbUser.lifetime_earned,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET /api/balance/:telegram_id - Get user balance and stats
app.get('/api/balance/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const user = await db.collection('users').findOne({ telegram_id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      balance: user.coin_balance,
      today_earned: user.today_earned,
      lifetime_earned: user.lifetime_earned,
      daily_goal_progress: Math.min(user.today_earned, 400),
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// POST /api/watch-ad - Record ad watch and award coins
app.post('/api/watch-ad', async (req, res) => {
  try {
    const { telegram_id, reward, ad_id } = req.body;
    
    if (!telegram_id || !reward || !ad_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Rate limiting: max 5 ads per hour
    if (!checkRateLimit(`ad-${telegram_id}`, 5, 3600000)) {
      return res.status(429).json({ error: 'Too many ad requests. Try again later.' });
    }
    
    // Check if ad was already watched recently (cooldown: 5 minutes)
    const recentAd = await db.collection('transactions').findOne({
      telegram_id,
      type: 'ad',
      ad_id,
      created_at: { $gt: new Date(Date.now() - 5 * 60000) },
    });
    
    if (recentAd) {
      return res.status(400).json({ error: 'This ad was recently watched. Try another ad.' });
    }
    
    const usersCol = db.collection('users');
    const transactionsCol = db.collection('transactions');
    
    // Update user balance
    const updateResult = await usersCol.findOneAndUpdate(
      { telegram_id },
      {
        $inc: {
          coin_balance: reward,
          today_earned: reward,
          lifetime_earned: reward,
        },
        $set: { updated_at: new Date() },
      },
      { returnDocument: 'after' }
    );
    
    if (!updateResult.value) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Record transaction
    await transactionsCol.insertOne({
      telegram_id,
      type: 'ad',
      ad_id,
      amount: reward,
      status: 'success',
      created_at: new Date(),
    });
    
    res.json({
      success: true,
      new_balance: updateResult.value.coin_balance,
      reward_amount: reward,
    });
  } catch (error) {
    console.error('Watch ad error:', error);
    res.status(500).json({ error: 'Failed to process ad reward' });
  }
});

// GET /api/history/:telegram_id - Get transaction history
app.get('/api/history/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const { limit = 20, skip = 0 } = req.query;
    
    const transactions = await db.collection('transactions')
      .find({ telegram_id })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();
    
    res.json({
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        created_at: t.created_at,
        description: getTransactionDescription(t),
      })),
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/withdraw - Create withdrawal request
app.post('/api/withdraw', async (req, res) => {
  try {
    const { telegram_id, method, amount, account_number } = req.body;
    
    if (!telegram_id || !method || !amount || !account_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const amountNum = parseInt(amount);
    
    // Validate minimum withdrawal
    if (amountNum < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal is 100 coins' });
    }
    
    // Rate limiting: max 3 withdrawal requests per day
    if (!checkRateLimit(`withdraw-${telegram_id}`, 3, 86400000)) {
      return res.status(429).json({ error: 'Too many withdrawal requests. Try again tomorrow.' });
    }
    
    const usersCol = db.collection('users');
    const withdrawalsCol = db.collection('withdrawals');
    
    // Check balance
    const user = await usersCol.findOne({ telegram_id });
    if (!user || user.coin_balance < amountNum) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Deduct coins immediately (prevent double-spend)
    const updateResult = await usersCol.findOneAndUpdate(
      { telegram_id },
      {
        $inc: { coin_balance: -amountNum },
        $set: { updated_at: new Date() },
      },
      { returnDocument: 'after' }
    );
    
    if (!updateResult.value) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create withdrawal record
    const withdrawal = {
      telegram_id,
      method,
      amount: amountNum,
      account_number,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    const insertResult = await withdrawalsCol.insertOne(withdrawal);
    
    res.json({
      success: true,
      withdrawal_id: insertResult.insertedId,
      status: 'pending',
      amount: amountNum,
      new_balance: updateResult.value.coin_balance,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Helper function to get transaction description
function getTransactionDescription(transaction) {
  switch (transaction.type) {
    case 'ad':
      return `Ad watched - ${transaction.amount} coins earned`;
    case 'reward':
      return `Daily reward - ${transaction.amount} coins`;
    case 'withdraw':
      return `Withdrawal - ${transaction.amount} coins`;
    case 'referral':
      return `Referral bonus - ${transaction.amount} coins`;
    default:
      return `Transaction - ${transaction.amount} coins`;
  }
}

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  process.exit(0);
});
