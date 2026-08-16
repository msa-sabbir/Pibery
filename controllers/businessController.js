const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Marketing = require('../models/Marketing');
const Shop = require('../models/Shop');

const verifyOwnership = async (shopId, userId) => Shop.findOne({ _id: shopId, owner: userId });

/* ---------------------- ড্যাশবোর্ড / সেলস অ্যানালিটিক্স ---------------------- */

// @route  GET /api/business/:shopId/dashboard
exports.getDashboard = async (req, res) => {
  const shop = await verifyOwnership(req.params.shopId, req.user._id);
  if (!shop) return res.status(403).json({ success: false, message: 'অনুমতি নেই' });

  const orders = await Order.find({ shop: shop._id });
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = await Customer.countDocuments({ shop: shop._id });
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  res.status(200).json({
    success: true,
    stats: { totalRevenue, totalOrders, totalCustomers, pendingOrders },
  });
};

/* ------------------------------- অর্ডার প্রসেসিং ------------------------------- */

// @route  GET /api/business/:shopId/orders
exports.getOrders = async (req, res) => {
  const shop = await verifyOwnership(req.params.shopId, req.user._id);
  if (!shop) return res.status(403).json({ success: false, message: 'অনুমতি নেই' });

  const { status } = req.query;
  const filter = { shop: shop._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter).sort('-createdAt');
  res.status(200).json({ success: true, count: orders.length, orders });
};

// @route  PATCH /api/business/orders/:orderId/status
exports.updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });

  const shop = await verifyOwnership(order.shop, req.user._id);
  if (!shop) return res.status(403).json({ success: false, message: 'অনুমতি নেই' });

  order.status = status;
  order.trackingHistory.push({ status, note });
  await order.save();

  res.status(200).json({ success: true, order });
};

/* --------------------------- কাস্টমার রিলেশনশিপ (CRM) --------------------------- */

// @route  GET /api/business/:shopId/customers
exports.getCustomers = async (req, res) => {
  const shop = await verifyOwnership(req.params.shopId, req.user._id);
  if (!shop) return res.status(403).json({ success: false, message: 'অনুমতি নেই' });

  const customers = await Customer.find({ shop: shop._id }).sort('-createdAt');
  res.status(200).json({ success: true, count: customers.length, customers });
};

// @route  GET /api/business/customers/:customerId
exports.getCustomerProfile = async (req, res) => {
  const customer = await Customer.findById(req.params.customerId);
  if (!customer) return res.status(404).json({ success: false, message: 'কাস্টমার পাওয়া যায়নি' });

  const shop = await verifyOwnership(customer.shop, req.user._id);
  if (!shop) return res.status(403).json({ success: false, message: 'অনুমতি নেই' });

  const orders = await Order.find({ customer: customer._id }).sort('-createdAt');
  res.status(200).json({ success: true, customer, orders });
};

/* ----------------------------- মার্কেটিং ও কুপন টুলস ----------------------------- */

// @route  POST /api/business/:shopId/marketing
exports.createCoupon = async (req, res) => {
  const shop = await verifyOwnership(req.params.shopId, req.user._id);
  if (!shop) return res.status(403).json({ success: false, message: 'অনুমতি নেই' });

  try {
    const marketing = await Marketing.create({ ...req.body, shop: shop._id });
    res.status(201).json({ success: true, marketing });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'এই কুপন কোডটি ইতিমধ্যে আছে' });
    }
    res.status(500).json({ success: false, message: 'কুপন তৈরি ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  GET /api/business/:shopId/marketing
exports.getCoupons = async (req, res) => {
  const shop = await verifyOwnership(req.params.shopId, req.user._id);
  if (!shop) return res.status(403).json({ success: false, message: 'অনুমতি নেই' });

  const marketing = await Marketing.find({ shop: shop._id }).sort('-createdAt');
  res.status(200).json({ success: true, marketing });
};

// @route  DELETE /api/business/marketing/:id
exports.deleteCoupon = async (req, res) => {
  const marketing = await Marketing.findById(req.params.id);
  if (!marketing) return res.status(404).json({ success: false, message: 'কুপন পাওয়া যায়নি' });

  const shop = await verifyOwnership(marketing.shop, req.user._id);
  if (!shop) return res.status(403).json({ success: false, message: 'অনুমতি নেই' });

  await marketing.deleteOne();
  res.status(200).json({ success: true, message: 'কুপন ডিলিট হয়েছে' });
};
 