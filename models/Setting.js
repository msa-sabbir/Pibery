const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    platformName: { type: String, default: 'Pibery' },
    platformEmail: { type: String, default: 'support@pibery.online' },
    platformLogo: { type: String },
    maintenanceMode: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 2.5 }, // Percentage
    currency: { type: String, default: 'BDT' },
    globalNotice: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
