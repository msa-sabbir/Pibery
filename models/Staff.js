const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['Manager', 'Inventory Staff', 'Order Processor'], default: 'Order Processor' },
    permissions: {
        canManageOrders: { type: Boolean, default: true },
        canManageProducts: { type: Boolean, default: false },
        canViewAnalytics: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
