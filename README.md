# Pibery Website Builder 🚀

Pibery হলো একটি মডার্ন ই-কমার্স ওয়েবসাইট বিল্ডার প্ল্যাটফর্ম — Node.js, Express ও MongoDB দিয়ে তৈরি। এটি Shopify এবং Zatiq Easy-এর একটি প্রফেশনাল অলটারনেটিভ, যা বিশেষভাবে বাংলাদেশের বাজারের জন্য তৈরি।

## 🛠️ টেকনোলজি স্ট্যাক
- **Frontend:** HTML5, CSS3, Vanilla JS (ES6+), FontAwesome, Google Fonts
- **Template Engine:** EJS
- **Backend:** Node.js, Express.js (REST API)
- **Database:** MongoDB + Mongoose
- **Integrations:** SSLCommerz (Payment), Pathao & Steadfast (Courier)

## 🚀 ইন্সটলেশন ও রান (Termux / Desktop)

### Termux (Android)
১. Termux ওপেন করে নিচের কমান্ড দিন:
```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
```
২. প্রজেক্ট ক্লোন করুন:
```bash
git clone https://github.com/msa-sabbir/Pibery.git
cd Pibery
```
৩. ডিপেন্ডেন্সি ইন্সটল করুন:
```bash
npm install
```
৪. ডাটাবেজ সেটআপ: `.env` ফাইল তৈরি করে আপনার MongoDB Atlas URI দিন।
৫. সার্ভার চালু করুন: `node app.js`

### Desktop
১. `npm install`
২. `cp .env.example .env` (তারপর DB URI দিন)
৩. `node app.js`

## 👑 প্ল্যাটফর্ম ওনার (Super Admin)
ওনার অ্যাডমিন প্যানেলটি প্ল্যাটফর্মের মালিকের জন্য, যেখান থেকে পুরো সিস্টেম নিয়ন্ত্রণ করা যায়।
- **URL:** `http://localhost:3000/owner/dashboard`
- **ওনার অ্যাকাউন্ট তৈরি:** `node scripts/createOwner.js "Name" email@pibery.online "password"`
- **প্রফেশনাল ফিচারসমূহ:**
  - **Shops Management:** সকল মার্চেন্ট শপ দেখা, সাসপেন্ড বা ডিলিট করা।
  - **Subscription Plans:** মার্চেন্টদের জন্য আলাদা প্যাকেজ (Basic, Pro, Enterprise) তৈরি।
  - **Announcements:** সকল মার্চেন্টের জন্য নোটিশ পাঠানো।
  - **Payouts:** মার্চেন্টদের উইথড্র রিকোয়েস্ট প্রসেস করা।
  - **Platform Settings:** সাইটের নাম, লোগো ও কমিশন রেট পরিবর্তন।

## 📦 প্রফেশনাল সার্ভিসসমূহ
- **SSLCommerz:** `/services/sslcommerz.js` (অনলাইন পেমেন্ট)
- **Courier Integration:** `/services/shipping.js` (Pathao ও Steadfast কুরিয়ার)
- **Globalize:** `/services/globalize.js` (মাল্টি-কারেন্সি ও মাল্টি-ল্যাঙ্গুয়েজ)

## 📄 লাইসেন্স
MIT
