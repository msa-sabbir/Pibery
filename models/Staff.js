const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: String, default: 'Staff' },
    permissions: {
      manageProducts: { type: Boolean, default: false },
      manageOrders: { type: Boolean, default: false },
      manageCustomers: { type: Boolean, default: false },
      manageMarketing: { type: Boolean, default: false },
      viewAnalytics: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema);
