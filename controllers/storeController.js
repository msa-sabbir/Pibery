const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Coupon = require('../models/Marketing');

// ১. ড্যাশবোর্ড ওভারভিউ ও অ্যানালিটিক্স (অ্যাডমিন)
exports.getDashboardStats = async (req, res) => {
    try {
        const { shopId } = req.params;
        const totalOrders = await Order.countDocuments({ shopId });
        const totalProducts = await Product.countDocuments({ shopId });
        const totalCustomers = await Customer.countDocuments({ shopId });
        
        const orders = await Order.find({ shopId });
        const totalSales = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

        res.json({
            success: true,
            stats: { totalOrders, totalProducts, totalCustomers, totalSales }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ২. প্রোডাক্ট ফিল্টার, সার্চ ও ব্রাউজিং (ইউজার সাইট)
exports.browseProducts = async (req, res) => {
    try {
        const { shopId, keyword, category, minPrice, maxPrice } = req.query;
        let query = { shopId };

        if (keyword) {
            query.title = { $regex: keyword, $options: 'i' };
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(query);
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ৩. ডিসকাউন্ট কুপন ভ্যালিডেশন (মার্কেটিং)
exports.applyCoupon = async (req, res) => {
    try {
        const { code, shopId } = req.body;
        const coupon = await Coupon.findOne({ shopId, code, isActive: true });
        
        if (!coupon || coupon.expiryDate < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
        }

        res.json({ success: true, discountPercentage: coupon.discountPercentage, message: 'Coupon applied successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ৪. স্বয়ংক্রিয় রিটার্ন বা রিফান্ড রিকুয়েস্ট হ্যান্ডেলিং
exports.requestReturn = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: 'Return Requested' }, { new: true });
        res.json({ success: true, message: 'Return request submitted successfully. Our team will review it.', updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
