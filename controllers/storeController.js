const jwt = require('jsonwebtoken');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Marketing = require('../models/Marketing');
const User = require('../models/User');

/* ===================================================================== */
/*                 প্ল্যাটফর্ম ওনার — সেন্ট্রাল অ্যাডমিন প্যানেল                */
/* ===================================================================== */

// @route  GET /api/store/platform/overview   (শুধু owner রোল)
exports.getPlatformOverview = async (req, res) => {
  const totalShops = await Shop.countDocuments();
  const publishedShops = await Shop.countDocuments({ isPublished: true });
  const totalMerchants = await User.countDocuments({ role: 'merchant' });
  const totalOrders = await Order.countDocuments();
  const orders = await Order.find({ paymentStatus: 'paid' });
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  res.status(200).json({
    success: true,
    stats: { totalShops, publishedShops, totalMerchants, totalOrders, totalRevenue },
  });
};

// @route  GET /api/store/platform/shops   (সব শপ লিস্ট - owner)
exports.listAllShops = async (req, res) => {
  const shops = await Shop.find().populate('owner', 'name email').sort('-createdAt');
  res.status(200).json({ success: true, count: shops.length, shops });
};

// @route  PATCH /api/store/platform/shops/:id/toggle-active   (owner শপ সাসপেন্ড/অ্যাক্টিভেট করতে পারবে)
exports.toggleShopActive = async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return res.status(404).json({ success: false, message: 'শপ পাওয়া যায়নি' });

  shop.isActive = !shop.isActive;
  await shop.save();
  res.status(200).json({ success: true, shop });
};

/* ===================================================================== */
/*                    শপফ্রন্ট — ক্রেতাদের জন্য ফিচার                        */
/* ===================================================================== */

// @route  POST /api/store/customers/register   (নির্দিষ্ট শপের কাস্টমার সাইনআপ)
exports.registerCustomer = async (req, res) => {
  try {
    const { shopId, name, email, password, phone } = req.body;
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ success: false, message: 'দোকান পাওয়া যায়নি' });

    const customer = await Customer.create({ shop: shopId, name, email, password, phone });
    const token = jwt.sign({ id: customer._id, type: 'customer' }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      success: true,
      token,
      customer: { id: customer._id, name: customer.name, email: customer.email },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'এই ইমেইলে ইতিমধ্যে অ্যাকাউন্ট আছে' });
    }
    res.status(500).json({ success: false, message: 'রেজিস্ট্রেশন ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  POST /api/store/checkout   (কার্ট চেকআউট — গেস্ট বা লগইনকৃত কাস্টমার)
exports.checkout = async (req, res) => {
  try {
    const { shopId, items, customerId, guestInfo, shippingAddress, couponCode, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'কার্ট খালি রয়েছে' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, shop: shopId, isPublished: true });
      if (!product) {
        return res.status(404).json({ success: false, message: `প্রোডাক্ট পাওয়া যায়নি: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `${product.name} এর পর্যাপ্ত স্টক নেই` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      subtotal += product.price * item.quantity;

      product.stock -= item.quantity;
      await product.save();
    }

    // কুপন প্রয়োগ
    let discount = 0;
    if (couponCode) {
      const coupon = await Marketing.findOne({
        shop: shopId,
        code: couponCode.toUpperCase(),
        isActive: true,
      });
      if (coupon && subtotal >= coupon.minPurchase) {
        discount =
          coupon.discountType === 'percentage'
            ? (subtotal * coupon.discountValue) / 100
            : coupon.discountValue;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const total = Math.max(subtotal - discount, 0);

    const order = await Order.create({
      shop: shopId,
      customer: customerId || undefined,
      guestInfo: customerId ? undefined : guestInfo,
      items: orderItems,
      subtotal,
      discount,
      total,
      shippingAddress,
      paymentMethod,
      trackingHistory: [{ status: 'pending', note: 'অর্ডারটি গ্রহণ করা হয়েছে' }],
    });

    // লয়্যালটি ও কাস্টমার হিসাব আপডেট
    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { totalOrders: 1, totalSpent: total, loyaltyPoints: Math.floor(total / 10) },
      });
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'চেকআউট ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  GET /api/store/orders/track/:orderId   (লাইভ অর্ডার ট্র্যাকিং - পাবলিক)
exports.trackOrder = async (req, res) => {
  const { email } = req.query;
  const order = await Order.findById(req.params.orderId).populate('customer', 'email');
  if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });

  const orderEmail = order.customer?.email || order.guestInfo?.email;
  if (email && orderEmail && email.toLowerCase() !== orderEmail.toLowerCase()) {
    return res.status(403).json({ success: false, message: 'ইমেইল মিলছে না' });
  }

  res.status(200).json({
    success: true,
    status: order.status,
    trackingHistory: order.trackingHistory,
    items: order.items,
    total: order.total,
  });
};

// @route  GET /api/store/customers/:id/loyalty
exports.getLoyalty = async (req, res) => {
  const customer = await Customer.findById(req.params.id).select('loyaltyPoints totalOrders totalSpent name');
  if (!customer) return res.status(404).json({ success: false, message: 'কাস্টমার পাওয়া যায়নি' });
  res.status(200).json({ success: true, customer });
};
 