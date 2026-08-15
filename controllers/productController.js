const Product = require('../models/Product');
const Shop = require('../models/Shop');

const verifyOwnership = async (shopId, userId) => {
  const shop = await Shop.findOne({ _id: shopId, owner: userId });
  return shop;
};

// @route  POST /api/products   (merchant adds new product)
exports.createProduct = async (req, res) => {
  try {
    const { shop: shopId } = req.body;
    const shop = await verifyOwnership(shopId, req.user._id);
    if (!shop) return res.status(403).json({ success: false, message: 'এই শপে পণ্য যোগ করার অনুমতি নেই' });

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'প্রোডাক্ট তৈরি ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  GET /api/products/shop/:shopId  (admin - all products incl. unpublished)
exports.getShopProducts = async (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;
  const filter = { shop: req.params.shopId };
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const products = await Product.find(filter)
    .sort('-createdAt')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Product.countDocuments(filter);
  res.status(200).json({ success: true, count: products.length, total, products });
};

// @route  GET /api/products/storefront/:shopId  (public - published only, with filters)
exports.getStorefrontProducts = async (req, res) => {
  const { page = 1, limit = 20, category, minPrice, maxPrice, search } = req.query;
  const filter = { shop: req.params.shopId, isPublished: true };
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(filter)
    .sort('-createdAt')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Product.countDocuments(filter);
  res.status(200).json({ success: true, count: products.length, total, products });
};

// @route  GET /api/products/:id
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি' });
  res.status(200).json({ success: true, product });
};

// @route  PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি' });

    const shop = await verifyOwnership(product.shop, req.user._id);
    if (!shop) return res.status(403).json({ success: false, message: 'অনুমতি নেই' });

    const allowedFields = [
      'name', 'description', 'images', 'price', 'compareAtPrice',
      'category', 'sku', 'stock', 'isPublished',
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    await product.save();
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'আপডেট ব্যর্থ হয়েছে', error: err.message });
  }
};

// @route  DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি' });

  const shop = await verifyOwnership(product.shop, req.user._id);
  if (!shop) return res.status(403).json({ success: false, message: 'অনুমতি নেই' });

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'প্রোডাক্ট ডিলিট হয়েছে' });
};

// @route  PATCH /api/products/:id/stock  (quick stock update)
exports.updateStock = async (req, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি' });
  res.status(200).json({ success: true, product });
};
