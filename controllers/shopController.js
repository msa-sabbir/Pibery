const Shop = require('../models/Shop');

// @route  POST /api/shops   (merchant creates their store)
exports.createShop = async (req, res) => {
  try {
    const { name, description, subdomain, contactEmail, contactPhone } = req.body;

    const shop = await Shop.create({
      owner: req.user._id,
      name,
      description,
      subdomain,
      contactEmail,
      contactPhone,
    });

    res.status(201).json({ success: true, shop });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'এই সাবডোমেইনটি ইতিমধ্যে ব্যবহৃত হচ্ছে' });
    }
    res.status(500).json({ success: false, message: 'শপ তৈরি ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  GET /api/shops/mine
exports.getMyShops = async (req, res) => {
  const shops = await Shop.find({ owner: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, count: shops.length, shops });
};

// @route  GET /api/shops/:id
exports.getShop = async (req, res) => {
  const shop = await Shop.findOne({ _id: req.params.id, owner: req.user._id });
  if (!shop) return res.status(404).json({ success: false, message: 'শপ খুঁজে পাওয়া যায়নি' });
  res.status(200).json({ success: true, shop });
};

// @route  PUT /api/shops/:id   (update info, theme, sections/canvas builder)
exports.updateShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'শপ খুঁজে পাওয়া যায়নি' });

    const allowedFields = [
      'name', 'description', 'logo', 'theme', 'contactEmail',
      'contactPhone', 'address', 'isPublished', 'sections',
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) shop[field] = req.body[field];
    });

    await shop.save();
    res.status(200).json({ success: true, shop });
  } catch (err) {
    res.status(500).json({ success: false, message: 'আপডেট ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  DELETE /api/shops/:id
exports.deleteShop = async (req, res) => {
  const shop = await Shop.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!shop) return res.status(404).json({ success: false, message: 'শপ খুঁজে পাওয়া যায়নি' });
  res.status(200).json({ success: true, message: 'শপ ডিলিট হয়েছে' });
};

// @route  GET /api/shops/subdomain/:subdomain  (public - storefront lookup)
exports.getShopBySubdomain = async (req, res) => {
  const shop = await Shop.findOne({ subdomain: req.params.subdomain, isPublished: true, isActive: true });
  if (!shop) return res.status(404).json({ success: false, message: 'দোকানটি খুঁজে পাওয়া যায়নি' });
  res.status(200).json({ success: true, shop });
};
