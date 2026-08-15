const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

// ১. এডমিন ড্যাশবোর্ড পেজ (ডাইরেক্ট এইচটিএমএল রেসপন্স, কোনো ফাইলের ঝামেলা নেই)
router.get('/admin/dashboard', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments({ shopId: 'pibery-shop-01' });
        const totalProducts = await Product.countDocuments({ shopId: 'pibery-shop-01' });
        const products = await Product.find({ shopId: 'pibery-shop-01' });

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Merchant Admin Panel - Pibery</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            </head>
            <body style="background: #0b0f19; color: #f1f5f9; font-family: sans-serif; margin: 0; padding: 20px;">
                <div style="max-width: 1100px; margin: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; padding-bottom: 15px; margin-bottom: 25px;">
                        <div>
                            <h1 style="color: #38bdf8; margin: 0;"><i class="fa-solid fa-user-shield"></i> Merchant Admin Panel</h1>
                            <p style="color: #94a3b8; margin: 5px 0 0 0;">Manage your store products, live orders, and business analytics.</p>
                        </div>
                        <div>
                            <a href="/" style="background: #1e293b; color: #38bdf8; padding: 8px 15px; border-radius: 8px; text-decoration: none; border: 1px solid #374151;">Home / Studio</a>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
                        <div style="background: #111827; padding: 20px; border-radius: 12px; border: 1px solid #1f2937;">
                            <p style="color: #94a3b8; margin: 0;">Total Products</p>
                            <h3 style="color: #38bdf8; margin: 8px 0 0 0; font-size: 1.8rem;">${totalProducts} টি</h3>
                        </div>
                        <div style="background: #111827; padding: 20px; border-radius: 12px; border: 1px solid #1f2937;">
                            <p style="color: #94a3b8; margin: 0;">Total Orders</p>
                            <h3 style="color: #10b981; margin: 8px 0 0 0; font-size: 1.8rem;">${totalOrders} টি</h3>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                        <div style="background: #111827; padding: 25px; border-radius: 12px; border: 1px solid #1f2937;">
                            <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 20px;"><i class="fa-solid fa-circle-plus"></i> Add New Product</h3>
                            <form action="/admin/product/add" method="POST" style="display: flex; flex-direction: column; gap: 15px;">
                                <div>
                                    <label style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 5px;">Product Title</label>
                                    <input type="text" name="title" placeholder="e.g. Smart Watch" required style="width: 100%; background: #1e293b; border: 1px solid #374151; padding: 10px; border-radius: 6px; color: #fff;">
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 5px;">Price (BDT)</label>
                                    <input type="number" name="price" placeholder="e.g. 1500" required style="width: 100%; background: #1e293b; border: 1px solid #374151; padding: 10px; border-radius: 6px; color: #fff;">
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 5px;">Description</label>
                                    <textarea name="description" placeholder="Product details..." rows="3" style="width: 100%; background: #1e293b; border: 1px solid #374151; padding: 10px; border-radius: 6px; color: #fff;"></textarea>
                                </div>
                                <button type="submit" style="background: #38bdf8; color: #0b0f19; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">Publish Product</button>
                            </form>
                        </div>

                        <div style="background: #111827; padding: 25px; border-radius: 12px; border: 1px solid #1f2937;">
                            <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 20px;"><i class="fa-solid fa-boxes-stacked"></i> Store Inventory</h3>
                            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto;">
                                ${products.length > 0 ? products.map(p => `
                                    <div style="background: #1e293b; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <strong style="color: #fff;">${p.title}</strong>
                                            <p style="color: #94a3b8; margin: 2px 0 0 0; font-size: 0.8rem;">Price: ৳ ${p.price}</p>
                                        </div>
                                    </div>
                                `).join('') : '<p style="color: #94a3b8; text-align: center;">No products added yet.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send("Error loading admin dashboard: " + error.message);
    }
});

// ২. নতুন প্রোডাক্ট যোগ করার হ্যান্ডলার
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

// ৩. ইউজার সাইট API
router.get('/store/products', async (req, res) => {
    try {
        const products = await Product.find({ shopId: 'pibery-shop-01' });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
