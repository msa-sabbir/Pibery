const mongoose = require('mongoose');

const marketingSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    type: { type: String, enum: ['coupon', 'campaign'], default: 'coupon' },
    code: { type: String, trim: true, uppercase: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true, min: 0 },
    minPurchase: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

marketingSchema.index({ shop: 1, code: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Marketing', marketingSchema);
 