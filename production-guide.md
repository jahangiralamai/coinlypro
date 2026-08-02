# Ads Rewards Telegram Mini App — Production পর্যন্ত সম্পূর্ণ গাইড

এই গাইডে প্রতিটা ধাপে বলা আছে: (ক) কী করতে হবে, (খ) কী কী দরকার, (গ) Cline-এ কী প্রম্পট দেবেন। ধাপগুলো ক্রমানুসারে করবেন — একটা শেষ না করে পরেরটায় যাবেন না।

---

## ধাপ ০: শুরুর আগে যা যা অ্যাকাউন্ট/জিনিস লাগবে

এগুলো Cline করতে পারবে না, আপনাকে নিজে বানাতে হবে (ফ্রি):

1. **GitHub অ্যাকাউন্ট** — কোড জমা রাখার জায়গা (github.com)
2. **Netlify অ্যাকাউন্ট** — আপনি আগে ব্যবহার করেছেন, ফ্রন্টএন্ড হোস্ট করতে
3. **Railway অথবা Render অ্যাকাউন্ট** — ব্যাকএন্ড (সার্ভার) হোস্ট করতে (railway.app বা render.com, ফ্রি টিয়ার আছে)
4. **Telegram অ্যাকাউন্ট** (যেটা আপনার আছেই) — বট বানানোর জন্য
5. **একটা রিওয়ার্ড-অ্যাড নেটওয়ার্ক অ্যাকাউন্ট** — আসল অ্যাড দেখিয়ে টাকা আয়ের জন্য (যেমন Adsgram বা Monetag — এগুলো Telegram Mini App-এর জন্যই বানানো বৈধ অ্যাড নেটওয়ার্ক)

VSCode + Cline + Kairo (Claude Sonnet 4.5) — এগুলো আপনার আগে থেকেই সেটআপ আছে।

---

## ধাপ ১: প্রজেক্ট ফোল্ডার তৈরি

1. কম্পিউটারে একটা ফোল্ডার বানান: `ads-rewards-app`
2. আমার দেওয়া `index.html` ফাইলটা এই ফোল্ডারে রাখুন
3. VSCode-এ File → Open Folder দিয়ে এই ফোল্ডার খুলুন
4. বাম পাশে Cline আইকনে ক্লিক করে চ্যাট খুলুন

**Cline প্রম্পট (ব্যাকআপ + নিয়ম সেট করা):**
```
This project is a Telegram Mini App called "Ads Rewards". I have index.html 
which contains the FINAL, APPROVED UI design — a dark premium theme with 
specific colors, fonts, and layout.

STRICT RULES for this entire project, all future tasks:
1. Never change any CSS, colors, fonts, spacing, or animations in index.html
2. Never change the HTML structure, layout, class names, or element IDs
3. Never rename or remove existing JavaScript function names or variable names 
   unless I explicitly ask
4. Only ADD new functionality — new JS logic, new backend files, new API calls
5. If a new feature needs a new visual element, match the EXISTING design 
   system exactly (reuse the same CSS variables like --primary, --accent, 
   --card, --border, same border-radius and spacing already used in the file)
6. Before any change, tell me clearly if it affects the visual design or not
7. Before every stage, make a timestamped backup copy of any file you are 
   about to modify (e.g. index.html → backups/index-YYYYMMDD.html)

First, create a "backups" folder and copy the current index.html into it as 
index-original.html. Then confirm you understand these rules.
```

এটা পাঠান, Cline কনফার্ম করবে। এখন থেকে Cline জানে ডিজাইন স্পর্শ করা যাবে না।

---

## ধাপ ২: Telegram বট তৈরি (ম্যানুয়াল, Cline লাগবে না)

1. Telegram-এ **@BotFather** সার্চ করে চ্যাট খুলুন
2. `/newbot` লিখুন
3. একটা নাম দিন (যেমন: `Ads Rewards Bot`)
4. একটা ইউজারনেম দিন, শেষে `bot` থাকতে হবে (যেমন: `adsrewards_bd_bot`)
5. BotFather আপনাকে একটা **API Token** দেবে — এটা কপি করে নিরাপদ জায়গায় রাখুন (কাউকে শেয়ার করবেন না)
6. `/mybots` → আপনার বট সিলেক্ট করুন → **Bot Settings → Menu Button** → এখানে পরে Mini App-এর লিংক বসাবেন (ধাপ ১০-এ)

এই টোকেনটা একটা নোটপ্যাডে সেভ করে রাখুন, পরের ধাপে লাগবে।

---

## ধাপ ৩: Telegram WebApp SDK যুক্ত করা

**Cline প্রম্পট:**
```
STAGE: Telegram WebApp SDK integration

Add the official Telegram WebApp SDK to index.html by adding this script tag 
in the <head>:
<script src="https://telegram.org/js/telegram-web-app.js"></script>

Then add JavaScript (following the design rules already agreed) that:
- Calls Telegram.WebApp.ready() and Telegram.WebApp.expand() on page load
- Reads the real logged-in user's first name, username, and profile photo 
  from Telegram.WebApp.initDataUnsafe.user
- Replaces the hardcoded "Jahangir" / "@jahangir_dev" text and avatar 
  initials in the EXISTING .user-name, .user-sub, and .avatar elements with 
  this real data, without changing their CSS
- If the app is opened outside Telegram (e.g. in a normal browser for 
  testing), keep showing the current placeholder data instead of breaking

Do not change anything else. Explain in simple, beginner-friendly terms what 
you changed and how I can test it.
```

---

## ধাপ ৪: ব্যাকএন্ড সার্ভার তৈরি (আসল ডাটা সেভ করার জন্য)

এখন পর্যন্ত সব ডাটা (ব্যালেন্স, হিস্ট্রি) নকল — পেজ রিলোড দিলে হারিয়ে যায়। এই ধাপে আসল ডাটাবেজ যুক্ত হবে।

**Cline প্রম্পট:**
```
STAGE: Backend server and database

Create a new backend folder called "server" inside this project (separate 
from index.html — do not touch index.html in this stage yet).

Build a Node.js + Express backend with a mongodb database (using mongodb
or similar) that includes:

1. A "users" table: telegram_id, first_name, username, coin_balance, 
   today_earned, lifetime_earned, created_at
2. A "transactions" table: id, telegram_id, type (ad/reward/withdraw/referral), 
   amount, status (success/pending/failed), created_at
3. A "withdrawals" table: id, telegram_id, method (bkash/nagad/rocket/binance/
   perfect_money), amount, account_number, status (pending/approved/rejected), 
   created_at

API endpoints needed:
- POST /api/auth — verifies Telegram initData (using the bot token) and 
  creates/returns the user
- GET /api/balance/:telegram_id — returns current balance and stats
- POST /api/watch-ad — records an ad watch, adds coins, prevents watching 
  the same ad session twice within a cooldown period
- GET /api/history/:telegram_id — returns transaction history
- POST /api/withdraw — creates a pending withdrawal request, deducts coins 
  immediately (so users can't double-spend), validates minimum amount

Add a .env file for secrets (bot token, database path) and a .gitignore that 
excludes .env and node_modules.

Write simple setup instructions in a README.md — assume I don't know how to 
code, explain exactly what commands to type in the terminal to install and 
run this server locally.
```

চালানোর পর Cline বলে দেবে টার্মিনালে কী কমান্ড দিতে হবে (সাধারণত `npm install` তারপর `npm start`)। ও নিজেই টার্মিনাল চালাতে পারে — অনুমতি চাইলে "Approve" করে দেবেন।

---

## ধাপ ৫: ফ্রন্টএন্ডকে ব্যাকএন্ডের সাথে যুক্ত করা

**Cline প্রম্পট:**
```
STAGE: Connect frontend to backend

Following the design rules (no CSS/layout changes), update the JavaScript in 
index.html so that:
- On load, it authenticates with POST /api/auth using Telegram.WebApp.initData
- The balance card, today's earnings, and lifetime earnings show REAL data 
  from GET /api/balance/:telegram_id instead of the hardcoded numbers
- The "Watch Ad" button, after the 5-second countdown finishes, calls 
  POST /api/watch-ad and only shows the bonus popup if the server confirms 
  success — remove the fake local balance math and rely on server response
- The History page loads real transactions from GET /api/history/:telegram_id 
  instead of the hardcoded array
- The Withdraw confirm button calls POST /api/withdraw and shows a real 
  success/error toast based on the server response

Keep a graceful fallback: if the backend is unreachable, show a toast saying 
"Connection error, please try again" instead of breaking the page.

Explain what changed and how to test the full flow end-to-end locally.
```

---

## ধাপ ৬: আসল অ্যাড নেটওয়ার্ক যুক্ত করা (রিয়েল অ্যাড থেকে ইনকাম)

এখন পর্যন্ত "Watch Ad" শুধু ৫ সেকেন্ডের টাইমার — আসল কোনো অ্যাড দেখায় না। ইনকামের জন্য আসল অ্যাড নেটওয়ার্ক লাগবে।

1. **Adsgram** (adsgram.ai) বা **Monetag** (monetag.com)-এ গিয়ে অ্যাকাউন্ট খুলুন — এগুলো Telegram Mini App-এর জন্যই বৈধ rewarded-ad নেটওয়ার্ক
2. আপনার বট/অ্যাপ যুক্ত করে একটা **Block/App ID** পাবেন
3. এই ID Cline-কে দিন

**Cline প্রম্পট:**
```
STAGE: Real rewarded ads integration

I have signed up with [Adsgram/Monetag] and have a Block ID: [YOUR_ID_HERE].

Integrate their official rewarded-ad SDK into index.html, following the 
design rules (no visual changes to existing elements). Replace the fake 
5-second setTimeout countdown in the watchAd() function with an actual call 
to their SDK's "show rewarded ad" method. Only call our POST /api/watch-ad 
backend endpoint (from Stage 5) and show the bonus popup AFTER their SDK 
confirms the ad was watched successfully — not before.

If the ad fails to load or the user closes it early, show a toast saying 
"Ad not completed, no reward given" and do not call the backend.

Follow their official documentation exactly (ask me to paste their docs/setup 
code if you're unsure of the exact integration steps).
```

---

## ধাপ ৭: অ্যাডমিন প্যানেল (উইথড্র অ্যাপ্রুভ করার জন্য)

**Cline প্রম্পট:**
```
STAGE: Admin panel for withdrawal approval

Create a new file admin.html in the same visual design system as index.html 
(same colors, fonts, card styles — reuse the CSS variables, do not invent a 
new style).

It should include:
- A simple password login screen (password stored in the backend .env, 
  checked via a POST /api/admin/login endpoint that returns a session token)
- A dashboard listing all pending withdrawal requests from the "withdrawals" 
  table with user name, amount, method, account number, and date
- Approve and Reject buttons for each request that call new backend 
  endpoints (POST /api/admin/withdraw/:id/approve and /reject) — approving 
  marks it complete, rejecting refunds the coins back to the user's balance
- A simple stats overview: total users, total coins in circulation, total 
  pending withdrawal amount

Protect all /api/admin/* endpoints so they require the admin session token.
```

---

## ধাপ ৮: নিরাপত্তা ও ফ্রড রোধ

**Cline প্রম্পট:**
```
STAGE: Security and abuse prevention

Add these protections to the backend, explaining each change simply:
1. Rate limiting on /api/watch-ad — a user cannot claim more than a 
   reasonable number of ad rewards per hour (e.g. use express-rate-limit)
2. Validate that Telegram initData is genuine on every request using the 
   bot token (prevents fake requests bypassing Telegram)
3. Minimum withdrawal amount and daily withdrawal limit checks
4. Basic duplicate-account detection (e.g. flag if many accounts withdraw to 
   the same bKash/Nagad number) — just log/flag for admin review, don't 
   auto-block
5. Store the admin password as a hashed value (bcrypt), never plain text

Explain what each protection does in simple terms.
```

---

## ধাপ ৯: লোকাল টেস্টিং

Cline-কে বলুন:
```
Start both the backend server and open index.html so I can test the full 
flow locally: viewing balance, watching an ad, checking history, requesting 
a withdrawal, and approving it from admin.html. Tell me exactly what URL to 
open in my browser for each part.
```

পুরো ফ্লো নিজে হাতে টেস্ট করে দেখুন — কোথাও সমস্যা পেলে Cline-কে সরাসরি বলুন কী সমস্যা হচ্ছে।

---

## ধাপ ১০: Production-এ ডিপ্লয় করা

### ক) কোড GitHub-এ তোলা
```
Initialize a git repository in this project, create a .gitignore excluding 
node_modules and .env, and give me the exact terminal commands to push this 
to a new GitHub repository (I will create the empty repo on github.com 
myself and give you the URL).
```

### খ) ব্যাকএন্ড ডিপ্লয় (Railway/Render)
- railway.app বা render.com-এ গিয়ে GitHub রিপো কানেক্ট করুন
- এনভায়রনমেন্ট ভ্যারিয়েবল (bot token ইত্যাদি) ওখানকার সেটিংসে বসান
- ডিপ্লয় হলে একটা লাইভ URL পাবেন (যেমন `https://ads-rewards-api.up.railway.app`)

### গ) ফ্রন্টএন্ড ডিপ্লয় (Netlify)
```
Update the backend API URL in index.html from localhost to my production 
backend URL: [YOUR_RAILWAY_URL_HERE]. Make this URL easy to change later 
(use a single constant at the top of the script, not scattered everywhere).
```
তারপর Netlify-তে আগের মতোই ফোল্ডার/রিপো কানেক্ট করে ডিপ্লয় করুন। একটা লাইভ HTTPS URL পাবেন (যেমন `https://ads-rewards.netlify.app`) — **Telegram Mini App-এর জন্য HTTPS অবশ্যই লাগবে**, Netlify এটা ফ্রিতে দেয়।

---

## ধাপ ১১: BotFather-এ Mini App লিংক যুক্ত করা (ম্যানুয়াল)

1. @BotFather-এ যান → `/mybots` → আপনার বট সিলেক্ট করুন
2. **Bot Settings → Menu Button → Edit Menu Button URL**
3. আপনার Netlify লাইভ URL পেস্ট করুন (যেমন `https://ads-rewards.netlify.app`)
4. এখন আপনার বটে গিয়ে Menu বাটনে ক্লিক করলে আসল অ্যাপ খুলবে

admin.html-এর লিংক আলাদা রাখুন, এটা BotFather-এ যুক্ত করবেন না — শুধু আপনি নিজে ব্রাউজারে গিয়ে ব্যবহার করবেন।

---

## ধাপ ১২: Go-Live চেকলিস্ট

লাইভ করার আগে এই প্রম্পট দিয়ে Cline-কে ফাইনাল চেক করান:
```
Do a final production readiness review of this project:
- Confirm .env secrets are not committed to GitHub
- Confirm all API endpoints validate Telegram initData
- Confirm the admin panel is password protected
- Confirm rate limiting is active
- List anything you think is missing before I open this app to real users
```

তারপর ম্যানুয়ালি নিজে চেক করুন:
- [ ] সত্যিকারের ফোনে Telegram অ্যাপে বট খুলে টেস্ট করেছি
- [ ] একটা টেস্ট উইথড্র রিকোয়েস্ট দিয়ে এডমিন প্যানেল থেকে অ্যাপ্রুভ করে দেখেছি
- [ ] Privacy Policy ও Terms পেজের আসল কনটেন্ট লেখা হয়েছে (এখন placeholder আছে)
- [ ] bKash/Nagad নাম্বার যাচাই করে ম্যানুয়ালি টাকা পাঠানোর প্রসেস ঠিক করা আছে

---

## সাধারণ নিয়ম (পুরো প্রসেসে মনে রাখবেন)

1. **একবারে এক স্টেজ** — আগের স্টেজ পুরোপুরি টেস্ট না করে পরের প্রম্পট দেবেন না
2. প্রতিটা স্টেজের আগে ব্যাকআপ নিতে বলুন (ধাপ ১-এ এই নিয়ম Cline-কে দিয়েই দিয়েছেন)
3. ডিজাইন বদলে গেলে সাথে সাথে বলুন: *"You changed the design, please revert and only fix the logic"*
4. না বুঝলে সরাসরি বলুন: *"Explain this to me like I don't know how to code"* — Cline সহজ ভাষায় বুঝিয়ে দেবে
