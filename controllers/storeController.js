const jwt = require('jsonwebtoken');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Marketing = require('../models/Marketing');
const User = require('../models/User');
const Announcement = require('../models/Announcement');

/* ===================================================================== */
/*                 প্ল্যাটফর্ম ওনার — সেন্ট্রাল অ্যাডমিন প্যানেল                */
/* ===================================================================== */

// @route  GET /api/store/platform/overview   (শুধু owner রোল)
exports.getPlatformOverview = async (req, res) => {
  try {
    const totalShops = await Shop.countDocuments();
    const publishedShops = await Shop.countDocuments({ isPublished: true });
    const totalMerchants = await User.countDocuments({ role: 'merchant' });
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const recentShops = await Shop.find().populate('owner', 'name email').sort('-createdAt').limit(5);
    const recentOrders = await Order.find().populate('shop', 'name subdomain').sort('-createdAt').limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalShops,
        publishedShops,
        totalMerchants,
        totalOrders,
        totalRevenue,
      },
      recentShops,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'ওভারভিউ ডেটা লোড ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  GET /api/store/platform/shops   (সব শপ লিস্ট - owner)
exports.listAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate('owner', 'name email plan').sort('-createdAt');
    res.status(200).json({ success: true, count: shops.length, shops });
  } catch (err) {
    res.status(500).json({ success: false, message: 'শপ লিস্ট লোড ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  PATCH /api/store/platform/shops/:id/toggle-active   (owner শপ সাসপেন্ড/অ্যাক্টিভেট করতে পারবে)
exports.toggleShopActive = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'শপ পাওয়া যায়নি' });

    shop.isActive = !shop.isActive;
    await shop.save();
    res.status(200).json({ success: true, message: 'শপ স্ট্যাটাস আপডেট হয়েছে', shop });
  } catch (err) {
    res.status(500).json({ success: false, message: 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  DELETE /api/store/platform/shops/:id   (owner শপ ডিলিট করতে পারবে)
exports.deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'শপ পাওয়া যায়নি' });

    // সম্পর্কিত প্রোডাক্ট ও অর্ডার ডিলিট করা যেতে পারে
    await Product.deleteMany({ shop: req.params.id });
    await Order.deleteMany({ shop: req.params.id });

    res.status(200).json({ success: true, message: 'শপ সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'শপ মুছে ফেলা ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  GET /api/store/platform/merchants   (সব মার্চেন্ট ইউজার লিস্ট)
exports.listAllMerchants = async (req, res) => {
  try {
    const merchants = await User.find({ role: 'merchant' }).select('-password').sort('-createdAt');
    // প্রতিটি মার্চেন্টের শপ সংখ্যা বের করা
    const merchantsWithShops = await Promise.all(
      merchants.map(async (m) => {
        const shopsCount = await Shop.countDocuments({ owner: m._id });
        return {
          ...m.toObject(),
          shopsCount,
        };
      })
    );
    res.status(200).json({ success: true, count: merchantsWithShops.length, merchants: merchantsWithShops });
  } catch (err) {
    res.status(500).json({ success: false, message: 'মার্চেন্ট লিস্ট লোড ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  PATCH /api/store/platform/merchants/:id/status   (মার্চেন্ট ব্যান/অ্যাক্টিভেট)
exports.toggleMerchantStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'owner') {
      return res.status(404).json({ success: false, message: 'মার্চেন্ট ইউজার পাওয়া যায়নি' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ success: true, message: 'মার্চেন্ট স্ট্যাটাস আপডেট হয়েছে', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'মার্চেন্ট স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  PATCH /api/store/platform/merchants/:id/plan   (মার্চেন্ট সাবস্ক্রিপশন প্ল্যান আপডেট: free/pro/enterprise)
exports.updateMerchantPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'সঠিক প্ল্যান নির্বাচন করুন (free, pro, enterprise)' });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.role === 'owner') {
      return res.status(404).json({ success: false, message: 'মার্চেন্ট পাওয়া যায়নি' });
    }

    user.plan = plan;
    await user.save();
    res.status(200).json({ success: true, message: `মার্চেন্ট প্ল্যান ${plan} এ আপডেট করা হয়েছে`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'প্ল্যান আপডেট ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  POST /api/store/platform/broadcast   (গ্লোবাল অ্যানাউন্সমেন্ট ব্রডকাস্ট)
exports.broadcastAnnouncement = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'শিরোনাম ও বার্তা আবশ্যক' });
    }

    const announcement = await Announcement.create({
      title,
      message,
      type: type || 'info',
      createdBy: req.user?._id,
    });

    res.status(201).json({ success: true, message: 'সফলভাবে অ্যানাউন্সমেন্ট ব্রডকাস্ট করা হয়েছে', announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: 'অ্যানাউন্সমেন্ট তৈরি ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  GET /owner/dashboard   (রেন্ডার ওনার অ্যাডমিন ড্যাশবোর্ড ভিউ)
exports.renderOwnerDashboard = async (req, res) => {
  try {
    res.render('owner-dashboard', {
      title: 'Pibery Platform — Super Admin Dashboard',
    });
  } catch (err) {
    res.status(500).send('ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে');
  }
};

/* ===================================================================== */
/*                    শপফ্রন্ট — ক্রেতাদের জন্য ফিচার                        */
/* ===================================================================== */

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

exports.getLoyalty = async (req, res) => {
  const customer = await Customer.findById(req.params.id).select('loyaltyPoints totalOrders totalSpent name');
  if (!customer) return res.status(404).json({ success: false, message: 'কাস্টমার পাওয়া যায়নি' });
  res.status(200).json({ success: true, customer });
};
 