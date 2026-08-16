const mongoose = require('mongoose');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Marketing = require('../models/Marketing');

const validObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.overview = async (req, res) => {
  const [totalUsers, activeUsers, merchants, staff, totalShops, activeShops, publishedShops, totalProducts, totalCustomers, totalOrders, paidOrders, pendingOrders] = await Promise.all([
    User.countDocuments(), User.countDocuments({ isActive: true }), User.countDocuments({ role: 'merchant' }), User.countDocuments({ role: 'staff' }),
    Shop.countDocuments(), Shop.countDocuments({ isActive: true }), Shop.countDocuments({ isPublished: true }), Product.countDocuments(), Customer.countDocuments(), Order.countDocuments(),
    Order.countDocuments({ paymentStatus: 'paid' }), Order.countDocuments({ status: 'pending' }),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const revenue = revenueAgg[0]?.total || 0;

  const recentOrders = await Order.find().populate('shop', 'name subdomain').populate('customer', 'name email').sort('-createdAt').limit(8).lean();
  const topShops = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: '$shop', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    { $sort: { revenue: -1 } }, { $limit: 5 },
    { $lookup: { from: 'shops', localField: '_id', foreignField: '_id', as: 'shop' } }, { $unwind: '$shop' },
    { $project: { _id: 1, revenue: 1, orders: 1, name: '$shop.name', subdomain: '$shop.subdomain' } },
  ]);

  res.json({ success: true, stats: { totalUsers, activeUsers, merchants, staff, totalShops, activeShops, publishedShops, totalProducts, totalCustomers, totalOrders, paidOrders, pendingOrders, revenue }, recentOrders, topShops });
};

exports.listUsers = async (req, res) => {
  const { role, active, search, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (role && ['owner', 'merchant', 'staff'].includes(role)) filter.role = role;
  if (active === 'true' || active === 'false') filter.isActive = active === 'true';
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

exports.toggleUser = async (req, res) => {
  if (!validObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'অবৈধ ইউজার আইডি' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
  if (String(user._id) === String(req.user._id)) return res.status(400).json({ success: false, message: 'নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না' });
  if (user.role === 'owner') return res.status(400).json({ success: false, message: 'Owner অ্যাকাউন্ট এই প্যানেল থেকে নিষ্ক্রিয় করা যাবে না' });
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, user: { id: user._id, isActive: user.isActive } });
};

exports.listShops = async (req, res) => {
  const { search, active, published, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (active === 'true' || active === 'false') filter.isActive = active === 'true';
  if (published === 'true' || published === 'false') filter.isPublished = published === 'true';
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { subdomain: { $regex: search, $options: 'i' } }];
  const skip = (Number(page) - 1) * Number(limit);
  const [shops, total] = await Promise.all([
    Shop.find(filter).populate('owner', 'name email isActive').sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
    Shop.countDocuments(filter),
  ]);
  res.json({ success: true, shops, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

exports.toggleShop = async (req, res) => {
  if (!validObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'অবৈধ শপ আইডি' });
  const shop = await Shop.findById(req.params.id);
  if (!shop) return res.status(404).json({ success: false, message: 'শপ পাওয়া যায়নি' });
  shop.isActive = !shop.isActive;
  await shop.save();
  res.json({ success: true, shop: { id: shop._id, isActive: shop.isActive } });
};

exports.listOrders = async (req, res) => {
  const { status, paymentStatus, search, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (['pending','processing','shipped','completed','cancelled'].includes(status)) filter.status = status;
  if (['unpaid','paid','refunded'].includes(paymentStatus)) filter.paymentStatus = paymentStatus;
  const skip = (Number(page) - 1) * Number(limit);
  let orders = await Order.find(filter).populate('shop', 'name subdomain').populate('customer', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)).lean();
  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(o => String(o._id).toLowerCase().includes(q) || o.shop?.name?.toLowerCase().includes(q) || o.customer?.email?.toLowerCase().includes(q) || o.guestInfo?.email?.toLowerCase().includes(q));
  }
  const total = await Order.countDocuments(filter);
  res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

exports.updateOrder = async (req, res) => {
  const { status, paymentStatus, note } = req.body;
  if (!validObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'অবৈধ অর্ডার আইডি' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });
  if (status && ['pending','processing','shipped','completed','cancelled'].includes(status) && status !== order.status) {
    order.status = status;
    order.trackingHistory.push({ status, note: note || `Owner admin থেকে স্ট্যাটাস পরিবর্তন: ${status}` });
  }
  if (paymentStatus && ['unpaid','paid','refunded'].includes(paymentStatus)) order.paymentStatus = paymentStatus;
  await order.save();
  res.json({ success: true, order });
};

exports.deleteShop = async (req, res) => {
  if (!validObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'অবৈধ শপ আইডি' });
  const shop = await Shop.findById(req.params.id);
  if (!shop) return res.status(404).json({ success: false, message: 'শপ পাওয়া যায়নি' });
  await Promise.all([
    Product.deleteMany({ shop: shop._id }), Customer.deleteMany({ shop: shop._id }), Marketing.deleteMany({ shop: shop._id }), Order.deleteMany({ shop: shop._id }), shop.deleteOne(),
  ]);
  res.json({ success: true, message: 'শপ ও সংশ্লিষ্ট ডেটা মুছে ফেলা হয়েছে' });
};
 