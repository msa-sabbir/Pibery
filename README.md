# Pibery Website Builder 🚀

Pibery হলো একটি মডার্ন ই-কমার্স ওয়েবসাইট বিল্ডার প্ল্যাটফর্ম — Node.js, Express ও MongoDB দিয়ে তৈরি।

## 🛠️ টেকনোলজি স্ট্যাক
- **Frontend:** HTML5, CSS3, Vanilla JS (ES6+), FontAwesome, Google Fonts
- **Template Engine:** EJS
- **Backend:** Node.js, Express.js (REST API)
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (httpOnly cookie বা Bearer token)

## 🚀 ইন্সটলেশন

```bash
git clone <your-repo-url>
cd pibery-website-builder
npm install
cp .env.example .env   # তারপর .env এ আসল মান বসান
npm run dev            # অথবা প্রোডাকশনে: node app.js
```

ব্রাউজারে যান: `http://localhost:3000`

## 📂 API রুট সারসংক্ষেপ

| গ্রুপ | Base Path | বর্ণনা |
|---|---|---|
| Auth | `/api/auth` | register, login, logout, me |
| Shops | `/api/shops` | merchant শপ তৈরি/আপডেট, ক্যানভাস সেকশন, পাবলিক subdomain lookup |
| Products | `/api/products` | ক্যাটালগ CRUD, স্টোরফ্রন্ট ফিল্টার/সার্চ, স্টক আপডেট |
| Business | `/api/business` | merchant ড্যাশবোর্ড, অর্ডার প্রসেসিং, CRM, কুপন |
| Store | `/api/store` | প্ল্যাটফর্ম owner ওভারভিউ, checkout, guest checkout, লাইভ ট্র্যাকিং, লয়্যালটি |

## 👤 ইউজার রোল
- `owner` — প্ল্যাটফর্মের মালিক (আপনি), সব শপ দেখতে/সাসপেন্ড করতে পারবে। নতুন owner ম্যানুয়ালি DB-তে সেট করুন — সাইনআপ ফর্ম দিয়ে কেউ owner হতে পারবে না।
- `merchant` — যারা Pibery দিয়ে নিজের দোকান বানাবে
- `staff` — মার্চেন্টের নিয়োগ করা কর্মী (আলাদা পারমিশনসহ)

## ⚠️ এই ভার্সনে যা বাস্তবায়িত আছে
- সম্পূর্ণ Auth সিস্টেম (JWT + bcrypt)
- Shop CRUD + canvas/sections + theme
- Product CRUD + storefront filter/search + stock control
- Order lifecycle (pending → processing → shipped → completed) + tracking history
- Guest ও registered checkout, কুপন প্রয়োগ, লয়্যালটি পয়েন্ট
- Merchant CRM (customer list + profile + order history)
- Marketing/coupon তৈরি ও ম্যানেজমেন্ট
- বেসিক ড্যাশবোর্ড UI (dashboard.ejs) ও স্টোরফ্রন্ট টেমপ্লেট (shop-template.ejs)

## 🧩 পরবর্তী ধাপে যা যোগ করা দরকার (রোডম্যাপ থেকে)
- Stripe/PayPal প্রকৃত পেমেন্ট ইন্টিগ্রেশন (বর্তমানে placeholder — শুধু `paymentMethod` ফিল্ড সংরক্ষিত হয়)
- ইমেজ আপলোড (multer কনফিগার করা আছে কিন্তু রাউটে যুক্ত করা বাকি)
- Staff পারমিশন-ভিত্তিক রাউট গার্ডিং (মডেল আছে, মিডলওয়্যার এখনো যুক্ত হয়নি)
- মাল্টি-ভেন্ডর মার্কেটপ্লেস, AI রেকমেন্ডেশন, WhatsApp/POS ইন্টিগ্রেশন

## 📄 লাইসেন্স
MIT


## 👑 Owner Admin
- URL: `/owner-admin`
- Owner-only dashboard: platform revenue, users, merchants, shops, products, customers and orders overview
- Shop activation/suspension and deletion
- User activation/deactivation
- Order status + payment status management
- Recent orders and top-shop analytics

### Owner account
Create/update an owner securely from the server:

```bash
npm run create-owner -- "Pibery Owner" owner@example.com "CHANGE_THIS_STRONG_PASSWORD"
```

Then open `/owner-admin` and sign in.
 