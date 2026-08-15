const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

// ১. এডমিন ড্যাশবোর্ড পেজ রেন্ডার করার রাউট
router.get('/admin/dashboard', (req, res) => {
    res.render('admin-dashboard');
});

// ২. এডমিন সাইট: ড্যাশবোর্ড ওভারভিউ ও লাইভ স্ট্যাটিস্টিক্স API
router.get('/admin/stats/:shopId', async (req, res) => {
    try {
        const { shopId } = req.params;
        const totalOrders = await Order.countDocuments({ shopId });
        const totalProducts = await Product.countDocuments({ shopId });
        const totalCustomers = await Customer.countDocuments({ shopId });
        
        const orders = await Order.find({ shopId });
        const totalSales = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

        res.json({
            success: true,
            stats: { totalOrders, totalProducts, totalCustomers, totalSales }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ৩. নতুন প্রোডাক্ট যোগ করার হ্যান্ডলার (Admin Action)
router.post('/admin/product/add', async (req, res) => {
    try {
        const { title, price, description } = req.body;
        
        const newProduct = new Product({
            shopId: 'pibery-shop-01',
            title,
            price,
            description
        });

        await newProduct.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send("Error adding product: " + error.message);
    }
});

// ৪. ইউজার সাইট: প্রোডাক্ট ব্রাউজিং, সার্চ ও ফিল্টারিং
router.get('/store/products', async (req, res) => {
    try {
        const { shopId, keyword, minPrice, maxPrice } = req.query;
        let query = {};
        if (shopId) query.shopId = shopId;

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
});

// ৫. ইউজার সাইট: গেস্ট চেকআউট ও অর্ডার প্লেসমেন্ট
router.post('/store/order/create', async (req, res) => {
    try {
        const { shopId, customerName, items, totalAmount, shippingAddress } = req.body;
        
        const newOrder = new Order({
            shopId,
            customerName,
            items,
            totalAmount,
            shippingAddress,
            orderStatus: 'Pending'
        });

        await newOrder.save();
        res.status(201).json({ success: true, message: 'Order placed successfully!', order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
