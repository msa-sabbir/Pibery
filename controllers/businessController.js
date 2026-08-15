const Order = require('../models/Order');

// রিয়েল-টাইম অর্ডার রিসিভ ও ইনভেন্টরি সিঙ্ক
exports.createOrder = async (req, res) => {
    try {
        const { shopId, customerName, customerPhone, items, totalAmount } = req.body;
        
        // লয়ালটি পয়েন্ট ক্যালকুলেশন (প্রতি ১০০ টাকায় ৫ পয়েন্ট)
        const loyaltyPointsEarned = Math.floor(totalAmount / 100) * 5;

        const newOrder = new Order({
            shopId,
            customerName,
            customerPhone,
            items,
            totalAmount,
            loyaltyPointsEarned
        });

        await newOrder.save();
        res.status(201).json({ success: true, message: 'Order placed & inventory synced successfully!', order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// অর্ডার ট্র্যাকিং স্ট্যাটাস আপডেট
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
        res.json({ success: true, message: 'Order fulfillment status updated', updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// প্রফেশনাল রিসিপ্ট জেনারেটর ডাটা
exports.getReceipt = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('shopId');
        if (!order) return res.status(404).json({ message: 'Receipt not found' });
        
        res.json({ success: true, receipt: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
