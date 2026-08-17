const mongoose = require('mongoose');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Marketing = require('../models/Marketing');
const Announcement = require('../models/Announcement');
const Plan = require('../models/Plan');
const Payout = require('../models/Payout');
const Setting = require('../models/Setting');

const validObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.overview = async (req, res) => {
  const [totalUsers, merchants, totalShops, activeShops, totalOrders, paidOrders, totalRevenue, pendingPayouts, activePlans] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'merchant' }),
    Shop.countDocuments(),
    Shop.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ paymentStatus: 'paid' }),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Payout.countDocuments({ status: 'pending' }),
    Plan.countDocuments({ isActive: true })
  ]);

  const revenue = totalRevenue[0]?.total || 0;
  const recentOrders = await Order.find().populate('shop', 'name subdomain').populate('customer', 'name email').sort('-createdAt').limit(8).lean();
  
  const topShops = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: '$shop', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    { $sort: { revenue: -1 } }, { $limit: 5 },
    { $lookup: { from: 'shops', localField: '_id', foreignField: '_id', as: 'shop' } }, { $unwind: '$shop' },
    { $project: { _id: 1, revenue: 1, orders: 1, name: '$shop.name', subdomain: '$shop.subdomain' } },
  ]);

  res.json({ 
    success: true, 
    stats: { totalUsers, merchants, totalShops, activeShops, totalOrders, paidOrders, revenue, pendingPayouts, activePlans }, 
    recentOrders, 
    topShops 
  });
};

// --- User & Shop Management (Existing with slight improvements) ---
exports.listUsers = async (req, res) => {
  const { role, active, search, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (active) filter.isActive = active === 'true';
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(filter)
  ]);
  res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
};

exports.toggleUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role === 'owner') return res.status(400).json({ success: false, message: 'অপারেশন সম্ভব নয়' });
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, isActive: user.isActive });
};

exports.listShops = async (req, res) => {
  const { search, active, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (active) filter.isActive = active === 'true';
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { subdomain: { $regex: search, $options: 'i' } }];
  const skip = (page - 1) * limit;
  const [shops, total] = await Promise.all([
    Shop.find(filter).populate('owner', 'name email').populate('plan', 'name').sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
    Shop.countDocuments(filter)
  ]);
  res.json({ success: true, shops, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// --- New Professional Features ---

// 1. Plan Management
exports.listPlans = async (req, res) => {
  const plans = await Plan.find().sort('price');
  res.json({ success: true, plans });
};

exports.createPlan = async (req, res) => {
  const plan = new Plan(req.body);
  await plan.save();
  res.json({ success: true, plan });
};

exports.updatePlan = async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, plan });
};

// 2. Announcement Management
exports.listAnnouncements = async (req, res) => {
  const announcements = await Announcement.find().sort('-createdAt');
  res.json({ success: true, announcements });
};

exports.createAnnouncement = async (req, res) => {
  const announcement = new Announcement({ ...req.body, createdBy: req.user._id });
  await announcement.save();
  res.json({ success: true, announcement });
};

exports.deleteAnnouncement = async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// 3. Payout Management
exports.listPayouts = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const payouts = await Payout.find(filter).populate('shop', 'name').populate('merchant', 'name email').sort('-createdAt');
  res.json({ success: true, payouts });
};

exports.updatePayout = async (req, res) => {
  const { status, note } = req.body;
  const payout = await Payout.findById(req.params.id);
  if (!payout) return res.status(404).json({ success: false, message: 'পে-আউট পাওয়া যায়নি' });
  payout.status = status;
  payout.note = note;
  if (status === 'completed') payout.processedAt = new Date();
  await payout.save();
  res.json({ success: true, payout });
};

// 4. Platform Settings
exports.getSettings = async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});
  res.json({ success: true, settings });
};

exports.updateSettings = async (req, res) => {
  const settings = await Setting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
  res.json({ success: true, settings });
};
