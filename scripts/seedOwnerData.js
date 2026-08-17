const mongoose = require('mongoose');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Setting = require('../models/Setting');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // ১. ওনার অ্যাকাউন্ট তৈরি (যদি না থাকে)
    const ownerExists = await User.findOne({ role: 'owner' });
    if (!ownerExists) {
      const owner = new User({
        name: "Pibery Admin",
        email: "admin@pibery.online", // আপনি চাইলে এটি পরিবর্তন করতে পারেন
        password: "AdminPassword123", // এটি আপনার স্থায়ী পাসওয়ার্ড
        role: 'owner',
        isActive: true
      });
      await owner.save();
      console.log('✅ Permanent Owner Account Created');
    }

    // ২. ডিফল্ট প্ল্যান তৈরি
    const plans = [
      { name: 'Basic', price: 0, duration: 30, features: ['50 Products', 'Basic Theme'] },
      { name: 'Pro', price: 1000, duration: 30, features: ['Unlimited Products', 'Custom Domain', 'SSLCommerz'] }
    ];
    for (let p of plans) {
      await Plan.findOneAndUpdate({ name: p.name }, p, { upsert: true });
    }

    console.log('✅ All Data Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
