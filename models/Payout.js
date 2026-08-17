const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['bkash', 'nagad', 'bank'], required: true },
    details: { type: String, required: true }, // e.g., bKash number or Bank details
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    note: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payout', payoutSchema);
