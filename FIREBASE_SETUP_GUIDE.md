# Firebase সেটআপ গাইড (Firebase Setup Guide)

এই অ্যাপটি সফলভাবে চালানোর জন্য Firebase Firestore এবং Authentication সঠিকভাবে সেটআপ করা প্রয়োজন। নিচে ধাপে ধাপে নির্দেশনা দেওয়া হলো।

---

## ১. এই প্রোজেক্টে Firebase যেভাবে কাজ করে
- **Client Config:** অ্যাপের ক্লায়েন্ট-সাইড কনফিগারেশন `/firebase-applet-config.json` ফাইল থেকে আসে। তবে `NEXT_PUBLIC_FIREBASE_*` এনভায়রনমেন্ট ভেরিয়েবল সেট করা থাকলে সেগুলো অগ্রাধিকার পায়।
- **Server SDK:** সার্ভার-সাইড (API Routes) কাজের জন্য `/lib/firebaseAdmin.ts` ব্যবহৃত হয়। এটি চালানোর জন্য `FIREBASE_SERVICE_ACCOUNT_KEY` নামক সিক্রেট এনভায়রনমেন্ট ভেরিয়েবল প্রয়োজন। এটি একটি সম্পূর্ণ JSON ফাইল যা `{` দিয়ে শুরু এবং `}` দিয়ে শেষ হয়।
- **সমস্যা (Permission Denied):** যদি `FIREBASE_SERVICE_ACCOUNT_KEY` সেট করা না থাকে, তবে AI Studio প্রিভিউতে সার্ভার `PERMISSION_DENIED` এরর পাবে। এর ফলে `/app/api/orders/create/route.ts` অর্ডার সেভ করতে পারবে না, কিন্তু কাস্টমারকে "Order Placed Successfully" মেসেজ দেখাবে। কিন্তু অ্যাডমিন প্যানেলে কোনো অর্ডার দেখা যাবে না।
- **Firestore Rules:** সুরক্ষা বজায় রাখতে `/firestore.rules` এমনভাবে সেট করা হয়েছে যাতে ক্লায়েন্ট সরাসরি কোনো অর্ডার তৈরি করতে না পারে। অর্ডারগুলো শুধুমাত্র সার্ভার-সাইড API-এর মাধ্যমে তৈরি হয়।
- **Admin Access:** অ্যাডমিন হিসেবে লগইন করতে আপনার `ADMIN_EMAILS` এনভায়রনমেন্ট ভেরিয়েবলে থাকা ইমেইল ব্যবহার করুন। অথবা Firestore-এর `users/{email}` ডকুমেন্টে `role == 'admin'` সেট করুন।
- **Admin Panel Env Variables:** অ্যাডমিন প্যানেলের "Env Variables" সেকশনে Firebase ফিল্ডগুলো শুধুমাত্র Firestore-এর `site_settings/env_credentials` ডকুমেন্টে সেভ হয়। এগুলো অ্যাপের বর্তমান লাইভ কানেকশন পরিবর্তন করে না। লাইভ কানেকশন শুধুমাত্র `firebase-applet-config.json` বা এনভায়রনমেন্ট ভেরিয়েবল দ্বারা নির্ধারিত হয়।

---

## ২. Firebase Console সেটআপ (এককালীন)
প্রোজেক্টের নাম হবে: `magmati-ecom`

১. [Firebase Console](https://console.firebase.google.com/) এ যান এবং একটি প্রোজেক্ট তৈরি করুন।
২. **Firestore Database:** বামদিকের মেনু থেকে Firestore Database সিলেক্ট করুন এবং "Create database" এ ক্লিক করুন (Default সেটিংস রাখুন)।
৩. **Authentication:** বামদিকের মেনু থেকে Authentication সিলেক্ট করুন। "Get Started" এ ক্লিক করে "Email/Password" এবং "Google" সাইন-ইন মেথড ইনাবল (Enable) করুন।
৪. **Security Rules:** Firestore মেনু থেকে "Rules" ট্যাবে যান। আপনার প্রোজেক্টের `/firestore.rules` ফাইলের লেখাগুলো কপি করে এখানে পেস্ট করুন এবং "Publish" এ ক্লিক করুন।
৫. **Service Account Key:** 
   - প্রোজেক্ট সেটিংস (গিয়ার আইকন) > Project settings এ যান।
   - "Service accounts" ট্যাবে ক্লিক করুন।
   - "Generate new private key" বাটনে ক্লিক করুন। একটি JSON ফাইল ডাউনলোড হবে।
   - **সতর্কতা:** এই কী (Key) কখনো GitHub, ZIP ফাইল বা চ্যাটে শেয়ার করবেন না। এটি লিক হয়ে গেলে Google Cloud Console > IAM > Service Accounts > Keys থেকে ডিলিট করে নতুন কী জেনারেট করুন।

---

## ৩. Google AI Studio (Preview) সেটআপ

১. AI Studio-এর বামদিকের মেনু থেকে **Settings > Secrets** এ যান।
২. "Add secret" এ ক্লিক করুন।
৩. **Name:** ঘরে লিখুন `FIREBASE_SERVICE_ACCOUNT_KEY`
৪. **Value:** ঘরে আপনার ডাউনলোড করা JSON ফাইলের সম্পূর্ণ টেক্সটটি পেস্ট করুন।
৫. **সমস্যা (Saving Error):** যদি "Failed to save secrets" মেসেজ আসে, তবে `GEMINI_API_KEY` রো-এর ড্রপডাউন থেকে একটি কী সিলেক্ট করে নিন (খালি রো থাকলে সেভ হতে বাধা দেয়), তারপর "Apply changes" এ ক্লিক করুন।
৬. **পরীক্ষা:** কাস্টমার হিসেবে একটি অর্ডার প্লেস করুন। এরপর অ্যাডমিন প্যানেলে গিয়ে দেখুন অর্ডারটি লিস্টে দেখা যাচ্ছে কি না।

---

## ৪. লোকাল হোস্টে চালানো (npm)
এই প্রোজেক্টে **npm** ব্যবহার করা বাধ্যতামূলক, **bun** ব্যবহার করবেন না।

১. আপনার পিসিতে Node.js ইনস্টল করুন।
২. টার্মিনালে লিখুন: `npm install`
৩. প্রোজেক্টের রুটে একটি `.env.local` ফাইল তৈরি করুন।
৪. ফাইলে নিচের মতো করে আপনার সার্ভিস অ্যাকাউন্ট কী দিন:
   `FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'` (সম্পূর্ণ JSON-টি এক লাইনে সিঙ্গেল কোটেশনের ভেতরে দিন)।
৫. অ্যাপটি চালু করতে লিখুন: `npm run dev`
৬. ব্রাউজারে `http://localhost:3000` ওপেন করুন।
৭. **সতর্কতা:** `/bun.lock` ফাইলটি ডিলিট করে দিন। মিক্সড প্যাকেজ ম্যানেজার (npm এবং bun একসাথে) ব্যবহার করলে ইনস্টলেশন বা বিল্ড এরর হতে পারে।

---

## ৫. প্রোডাকশন হোস্টিং এবং কাস্টম ডোমেইন

হোস্টিং সার্ভারে নিচের এনভায়রনমেন্ট ভেরিয়েবলগুলো সেট করুন:
- `FIREBASE_SERVICE_ACCOUNT_KEY` (সম্পূর্ণ JSON)
- `APP_URL` (যেমন: `https://yourdomain.com`)
- `/.env.example` ফাইলে থাকা অন্যান্য সব ভেরিয়েবল।

### অপশন এ: Vercel (সহজ)
১. GitHub রিপোজিটরি ইমপোর্ট করুন।
২. "Environment Variables" সেকশনে উপরের ভেরিয়েবলগুলো যোগ করুন।
৩. "Deploy" বাটনে ক্লিক করুন।
৪. কাস্টম ডোমেইন যোগ করে DNS রেকর্ড আপডেট করুন।

### অপশন বি: VPS (Node.js সার্ভার)
১. Node.js 20+ এবং npm ইনস্টল করুন।
২. `npm install` এবং `npm run build` কমান্ড দিন।
৩. `pm2` ব্যবহার করে অ্যাপটি চালু রাখুন: `pm2 start npm --name "magmati" -- start`
৪. Nginx ব্যবহার করে পোর্ট ৩০০০-এ রিভার্স প্রক্সি সেটআপ করুন।
৫. Certbot দিয়ে SSL সার্টিফিকেট ইনস্টল করুন।

### গুরুত্বপূর্ণ ধাপসমূহ:
- **Authorized Domains:** Firebase Console > Authentication > Settings > Authorized domains এ আপনার কাস্টম ডোমেইন (যেমন: `yourdomain.com` এবং `www.yourdomain.com`) যোগ করুন। না হলে লগইন করার সময় `auth/unauthorized-domain` এরর আসবে।
- **Google Sign-in:** Google Cloud Console > APIs & Services > Credentials এ গিয়ে আপনার ডোমেইনটি "Authorized JavaScript origins" এ যোগ করুন।
- **Payment (SSLCommerz):** লাইভ পেমেন্টের জন্য `SSLCOMMERZ_IS_SANDBOX=false` সেট করুন। পেমেন্ট গেটওয়ের কলব্যাক ইউআরএল-এর জন্য `APP_URL` সঠিক ডোমেইন নামসহ সেট করা থাকতে হবে।
- **Cloudinary:** আপনার ইমেজ স্টোরেজের জন্য Cloudinary-এর API কী এবং সিক্রেটগুলো হোস্টিং-এর এনভায়রনমেন্ট ভেরিয়েবলে সেট করুন।

---

## ৬. ফাইনাল চেকলিস্ট এবং ট্রাবলশুটিং

### চেকলিস্ট:
- [ ] Firestore Rules পাবলিশ করা হয়েছে?
- [ ] Service Account Key সঠিকভাবে সিক্রেটস-এ যোগ করা হয়েছে?
- [ ] Authorized Domains লিস্টে আপনার ডোমেইন যোগ করা হয়েছে?
- [ ] `APP_URL` এর শেষে কোনো স্ল্যাশ (/) ছাড়াই সেট করা হয়েছে?

### ট্রাবলশুটিং (Troubleshooting):

| সমস্যা (Problem) | সমাধান (Solution) |
| :--- | :--- |
| `PERMISSION_DENIED` | Firestore Rules চেক করুন অথবা Service Account Key সঠিক কি না নিশ্চিত করুন। |
| অর্ডার অ্যাডমিন প্যানেলে আসে না | `FIREBASE_SERVICE_ACCOUNT_KEY` সিক্রেটস-এ সঠিকভাবে সেভ করা হয়নি। |
| `auth/unauthorized-domain` | Firebase Console-এ আপনার ডোমেইনটি Authorized Domain হিসেবে যোগ করুন। |
| `Failed to save secrets` | GEMINI_API_KEY ড্রপডাউন থেকে কী সিলেক্ট করে আবার ট্রাই করুন। |
| Bun এরর | `/bun.lock` ডিলিট করে শুধুমাত্র `npm` ব্যবহার করুন। |
| PDF/Print প্রিন্ট হচ্ছে না | পপ-আপ ব্লকার অফ করুন এবং ব্রাউজার সেটিংস চেক করুন। |

---

## ৭. ছোটদের মতো সহজ ভাষায় ধাপে ধাপে গাইড (Beginner Guide)

এই অংশটা একদম নতুনদের জন্য। কোনো জটিল শব্দ বুঝতে না পারলে এখান থেকে শুরু করুন।

### ৭.১ বড় ছবি: পুরো ব্যাপারটা একটা অফিসের মতো 🏢

| অফিসের জিনিস | আমাদের প্রজেক্টে এটা কী |
|---|---|
| গ্রাহক | ব্রাউজার (ফোন বা কম্পিউটারে সাইট খোলা মানুষ) |
| গেটের দারোয়ান | **Firebase Authentication** (লগইন সিস্টেম) |
| গুদাম / খাতা | **Firestore Database** (পণ্য, অর্ডার, ইউজারের তথ্য) |
| গুদামের নিয়ম | **firestore.rules** (কে কী পড়তে বা লিখতে পারবে) |
| ম্যানেজার | **সার্ভার** (আমাদের `app/api/...` ফাইলগুলো) |
| ম্যানেজারের বিশেষ চাবি | **Service Account Key** |
| ম্যানেজারদের তালিকা | **ADMIN_EMAILS** |

মনে রাখুন: **গ্রাহকের ব্রাউজার** আর **সার্ভার** আলাদা। ব্রাউজার নিজের লগইন টোকেন দিয়ে গুদামে ঢোকে। সার্ভার ঢোকে নিজের বিশেষ চাবি দিয়ে। দুটোর অনুমতি আলাদা।

---

### ৭.২ Firebase API Key কী? কোথায় থাকে? 🪪

- **কী:** একটা লম্বা কোড, যা `AIza...` দিয়ে শুরু হয়। এটা শুধু বলে "এই অ্যাপ `magmati-ecom` প্রজেক্টের।" এটা পাসওয়ার্ড না।
- **কোথায়:** আপনার প্রজেক্টের `firebase-applet-config.json` ফাইলে `"apiKey"` নামে।
- **প্রকাশ্য থাকা কি ঠিক?** হ্যাঁ। সাইট খুললে এই কোড ব্রাউজারে চলে যায়, যে কেউ F12 চেপে দেখতে পারে। এটা স্বাভাবিক।
- **তাহলে নিরাপত্তা কোথায়?** আসল নিরাপত্তা দেয় (১) **Firestore Rules** আর (২) **লগইন**। API key না।
- **গোপন কী কী?** `ADMIN_EMAILS`, `FIREBASE_SERVICE_ACCOUNT_KEY`, পেমেন্ট ও SMS-এর চাবি। এগুলো শুধু সার্ভারের Secrets বা Environment Variables-এ থাকবে, কখনো কোডে বা GitHub-এ না।

---

### ৭.৩ Authorized domains 🌐

**কাজ:** Firebase জিজ্ঞেস করে "এই ওয়েবসাইট থেকে কি আমার লগইন ব্যবহার করা যাবে?" তালিকায় ডোমেইন না থাকলে **Google দিয়ে লগইন** এবং কিছু লিংক (যেমন পাসওয়ার্ড রিসেট) এরর দেয়।

**কখন দেবেন:**
- প্রিভিউ লিংক থেকে Google লগইন পরীক্ষা করতে চাইলে
- আসল সাইট ডিপ্লয় করার সময় (খুবই জরুরি)

**কীভাবে দেবেন:**
1. [Firebase Console](https://console.firebase.google.com/) খুলুন → প্রজেক্ট `magmati-ecom` বাছুন।
2. বামে **Authentication** চাপুন।
3. উপরে **Settings** ট্যাব চাপুন।
4. **Authorized domains** চাপুন।
5. **Add domain** চাপুন।
6. ডোমেইন লিখুন, **শুধু নাম, `https://` বা `/` ছাড়া।** যেমন: `magmati.com` আর `www.magmati.com`।
7. **Add** চাপুন।

**না দিলে কী হয়:** ইমেইল-পাসওয়ার্ড লগইন সাধারণত চলে, কিন্তু Google লগইন ভাঙে।

---

### ৭.৪ Google Cloud-এ API key-র restriction (শুধু চেক করুন) 🔒

**কাজ:** কেউ আপনার API key চুরি করে নিজের সাইটে না চালাতে পারে, তাই বলা যায় "শুধু এই ডোমেইনগুলো key ব্যবহার করতে পারবে।"

**আছে কিনা কীভাবে দেখবেন:**
1. [console.cloud.google.com](https://console.cloud.google.com/) খুলুন (Firebase-এর একই Google অ্যাকাউন্টে)।
2. উপরে প্রজেক্ট বাছাই থেকে **magmati-ecom** নির্বাচন করুন।
3. বামে **APIs & Services** → **Credentials**।
4. "API Keys" তালিকায় **Browser key (auto created by Firebase)** চাপুন।
5. **Application restrictions** দেখুন:

| যা দেখলেন | কী করবেন |
|---|---|
| **None** | কিছুই করতে হবে না |
| **Websites (HTTP referrers)** | আপনার প্রতিটা ডোমেইন যোগ করুন, যেমন `magmati.com/*` আর `www.magmati.com/*` |
| প্রজেক্টই দেখতে পাচ্ছেন না | ছেড়ে দিন, সাইট কাজ করলে সমস্যা নেই |

**কখন আবার দেখবেন:** ডিপ্লয়ের পর আসল ডোমেইনে লগইন বা ডাটা আসা বন্ধ হলে।

---

### ৭.৫ OAuth "Authorized JavaScript origins" (সাধারণত লাগে না)

"Google দিয়ে সাইন ইন" বাটনের পেছনের Google অ্যাপের অনুমোদিত ঠিকানা। সাধারণত Firebase নিজেই ঠিক রাখে। শুধু **কাস্টম ডোমেইনে Google লগইন ভাঙলে** Google Cloud → Credentials → **OAuth 2.0 Client IDs (Web)** → **Authorized JavaScript origins**-এ ডোমেইন (`https://magmati.com`) যোগ করুন।

---

### ৭.৬ Service Account Key (ম্যানেজারের বিশেষ চাবি) 🔑

**কাজ:** সার্ভার Firestore-এ ঢোকে নিজের পরিচয়ে। সেই পরিচয়পত্রই এই `.json` ফাইল। ভেরিয়েবলের নাম: `FIREBASE_SERVICE_ACCOUNT_KEY`।

**না থাকলে কী হয়:** সার্ভারের লগে `PERMISSION_DENIED` আসে। অর্ডার সেভ হয় না, অর্ডার ইতিহাস খালি দেখায়, Firestore-এর `role: admin` সার্ভার পড়তে পারে না।

**কখন দেবেন:**
- AI Studio প্রিভিউ: জরুরি না
- **আসল সাইটে (ডিপ্লয়): অবশ্যই**

**কীভাবে বানাবেন ও দেবেন:**
1. Firebase Console → বামে উপরে ⚙️ → **Project settings**।
2. **Service accounts** ট্যাব।
3. **Generate new private key** চাপুন → নিশ্চিত করুন। একটা `.json` ফাইল ডাউনলোড হবে।
4. ফাইল খুলে `{` থেকে `}` পর্যন্ত **পুরো লেখা** কপি করুন।
5. হোস্টিং প্ল্যাটফর্মের **Environment Variables**-এ (যেমন Vercel → Settings → Environment Variables) নতুন ভেরিয়েবল যোগ করুন:
   - নাম: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - মান: কপি করা পুরো JSON
6. Save করুন, তারপর নতুন করে **Redeploy** করুন।

**⚠️ সতর্কতা:**
- এই ফাইল ডাটাবেসের পূর্ণ নিয়ন্ত্রণ দেয়, পাসওয়ার্ডের চেয়েও গোপন।
- চ্যাটে, কোডে, GitHub-এ বা স্ক্রিনশটে **কখনো দেবেন না**।
- ফাঁস হলে Firebase Console → Service accounts থেকে ওই key মুছে নতুন বানান।

---

### ৭.৭ অ্যাডমিন রোল কীভাবে ঠিক হয়? 👑

**ধাপ ১ (ব্রাউজার):** লগইন করলে ব্রাউজার নিজে Firebase-এ ঢোকে, নাম ও প্রোফাইল পড়ে। এটা সার্ভারের অনুমতি ছাড়াই কাজ করে।

**ধাপ ২ (সার্ভার):** এরপর ব্রাউজার সার্ভারকে জিজ্ঞেস করে "এ কি অ্যাডমিন?" (`/api/auth/sync-role`)। **সার্ভারের উত্তরই চূড়ান্ত।** ব্রাউজার Firestore-এ `admin` দেখলেও সার্ভার `customer` বললে `customer`ই থাকে।

**সার্ভার কীভাবে ঠিক করে:**
1. শুরুতেই ধরে নেয় সবাই **`customer`**। এটা কোডের ডিফল্ট, কোনো ডাটাবেস থেকে আসে না।
2. ইমেইল **verified** না হলে (বা Google দিয়ে লগইন না হলে) এখানেই থামে।
3. ইমেইল `ADMIN_EMAILS`-এ থাকলে → `admin`।
4. না থাকলে Firestore-এ `users/{email}` ডকুমেন্টে `role: admin` খোঁজে (এর জন্য Service Account Key লাগে)।
5. কিছুই না পেলে `customer` থেকে যায়।

**`ADMIN_EMAILS` কীভাবে দেবেন:**
- নাম: `ADMIN_EMAILS`, মান: `admin@yourdomain.com` (একাধিক হলে কমা দিয়ে)
- AI Studio-তে: Settings → **Secrets** → Add secret → **নিচের "Apply changes" বাটন অবশ্যই চাপুন**, নইলে সার্ভার নতুন মান পায় না।
- তারপর লগআউট করে আবার লগইন করুন।

**অ্যাডমিন হয়েও `customer` দেখালে কারণ খুঁজবেন কীভাবে:**
1. ব্রাউজারের কনসোল খুলুন (F12 → Console)।
2. `[RoleSync]` লেখা লাইনটা খুঁজুন। তার পাশের `reason` দেখুন (এটা শুধু ডেভেলপমেন্টে দেখা যায়):

| reason | মানে | কী করবেন |
|---|---|---|
| `env_missing` | `ADMIN_EMAILS` সার্ভার পাচ্ছে না | Secret যোগ করুন, **Apply changes** চাপুন |
| `not_verified` | ইমেইল verified না | ইমেইল verify করুন বা Google দিয়ে লগইন করুন |
| `not_in_env_and_db_unavailable` | ইমেইল তালিকায় নেই, আর সার্ভার ডাটাবেস পড়তে পারছে না | `ADMIN_EMAILS`-এ ইমেইল দিন বা Service Account Key দিন |
| `not_in_env_and_not_admin_in_db` | ডাটাবেসে `role: admin` নেই | `users/{email}` ডকুমেন্টে `role` = `admin` করুন |
| `admin_env_match` / `admin_firestore_role` | ঠিক আছে, অ্যাডমিন | — |

---

### ৭.৮ ডিপ্লয়ের আগে চেকলিস্ট ✅

- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` দেওয়া হয়েছে (৭.৬)
- [ ] `ADMIN_EMAILS` দেওয়া হয়েছে (৭.৭)
- [ ] আসল ডোমেইন **Authorized domains**-এ আছে (৭.৩)
- [ ] API key-তে restriction থাকলে ডোমেইন যোগ করা হয়েছে (৭.৪)
- [ ] `firestore.rules` Firebase Console-এ **Publish** করা হয়েছে
- [ ] অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করে অ্যাডমিন প্যানেল খোলা হয়েছে
- [ ] নতুন ইউজার দিয়ে রেজিস্ট্রেশন ও অর্ডার পরীক্ষা করা হয়েছে
- [ ] অ্যাডমিন প্যানেলে **Sync catalog to database** চালানো হয়েছে এবং Firestore-এ `products` কালেকশনে পণ্য এসেছে

### ৭.৯ কখন কোনটা লাগে — এক নজরে

| জিনিস | প্রিভিউতে | আসল সাইটে |
|---|---|---|
| Authorized domains | Google লগইন পরীক্ষা করলে | অবশ্যই |
| API key restriction | restriction চালু থাকলে | restriction চালু থাকলে |
| OAuth origins | প্রায় কখনো না | কাস্টম ডোমেইনে Google লগইন ভাঙলে |
| Service Account Key | না দিলেও চলে | অবশ্যই |
| ADMIN_EMAILS | অ্যাডমিনের জন্য লাগে | অবশ্যই |

