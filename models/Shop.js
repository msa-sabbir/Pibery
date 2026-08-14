const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true, unique: true },
    subdomain: { type: String, required: true, unique: true },
    themeTemplate: { type: String, default: 'default-shop' },
    customDomain: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
