const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Basic, Pro, Enterprise
    price: { type: Number, required: true, default: 0 },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    features: {
      productLimit: { type: Number, default: 50 },
      orderLimit: { type: Number, default: 100 },
      customDomain: { type: Boolean, default: false },
      staffAccounts: { type: Number, default: 1 },
      premiumThemes: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
