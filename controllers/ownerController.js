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

exports.overview = async (req, res) => {
  try {
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
    const recentOrders = await Order.find().populate('shop', 'name').sort('-createdAt').limit(8).lean();
    res.json({ success: true, stats: { totalUsers, merchants, totalShops, activeShops, totalOrders, paidOrders, revenue, pendingPayouts, activePlans }, recentOrders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.listUsers = async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt').lean();
  res.json({ success: true, users });
};

exports.toggleUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role === 'owner') return res.status(400).json({ success: false });
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, isActive: user.isActive });
};

exports.listShops = async (req, res) => {
  const shops = await Shop.find().populate('owner', 'name email').populate('plan', 'name').sort('-createdAt').lean();
  res.json({ success: true, shops });
};

exports.toggleShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return res.status(404).json({ success: false });
  shop.isActive = !shop.isActive;
  await shop.save();
  res.json({ success: true, isActive: shop.isActive });
};

exports.deleteShop = async (req, res) => {
  await Shop.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

exports.listOrders = async (req, res) => {
  const orders = await Order.find().populate('shop', 'name').sort('-createdAt').lean();
  res.json({ success: true, orders });
};

exports.updateOrder = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, order });
};

exports.listPlans = async (req, res) => { res.json({ success: true, plans: await Plan.find().sort('price') }); };
exports.createPlan = async (req, res) => { const plan = new Plan(req.body); await plan.save(); res.json({ success: true, plan }); };
exports.updatePlan = async (req, res) => { const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, plan }); };
exports.listAnnouncements = async (req, res) => { res.json({ success: true, announcements: await Announcement.find().sort('-createdAt') }); };
exports.createAnnouncement = async (req, res) => { const ann = new Announcement({ ...req.body, createdBy: req.user._id }); await ann.save(); res.json({ success: true, announcement: ann }); };
exports.deleteAnnouncement = async (req, res) => { await Announcement.findByIdAndDelete(req.params.id); res.json({ success: true }); };
exports.listPayouts = async (req, res) => { res.json({ success: true, payouts: await Payout.find().populate('shop', 'name').sort('-createdAt') }); };
exports.updatePayout = async (req, res) => { const payout = await Payout.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, payout }); };
exports.getSettings = async (req, res) => { let s = await Setting.findOne(); if (!s) s = await Setting.create({}); res.json({ success: true, settings: s }); };
exports.updateSettings = async (req, res) => { const s = await Setting.findOneAndUpdate({}, req.body, { new: true, upsert: true }); res.json({ success: true, settings: s }); };
