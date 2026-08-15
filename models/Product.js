const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    description: { type: String, default: '' },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: String, trim: true, default: 'General' },
    sku: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: true },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', category: 'text' });

productSchema.pre('validate', function (next) {
  if (this.name) {
    this.slug = slugify(`${this.name}-${Date.now()}`, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
