const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    addresses: [{ street: String, city: String, postalCode: String, country: String }],
    totalSpent: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
