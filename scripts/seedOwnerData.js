const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Setting = require('../models/Setting');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pibery');
    
    // Seed Plans
    const plans = [
      { name: 'Basic', price: 0, features: { productLimit: 20, orderLimit: 50, customDomain: false } },
      { name: 'Pro', price: 1500, features: { productLimit: 200, orderLimit: 500, customDomain: true } },
      { name: 'Enterprise', price: 5000, features: { productLimit: 9999, orderLimit: 9999, customDomain: true } }
    ];
    
    for (const p of plans) {
      await Plan.findOneAndUpdate({ name: p.name }, p, { upsert: true });
    }
    
    // Seed Settings
    await Setting.findOneAndUpdate({}, { platformName: 'Pibery', commissionRate: 2.5 }, { upsert: true });
    
    console.log('✅ Owner data seeded successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
