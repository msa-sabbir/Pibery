const mongoose = require('mongoose');
const slugify = require('slugify');

const shopSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    subdomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    customDomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    planExpiry: { type: Date },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    theme: {
      mode: { type: String, enum: ['light', 'dark'], default: 'light' },
      primaryColor: { type: String, default: '#4f46e5' },
    },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    isPublished: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sections: [
      {
        type: { type: String }, // hero, feature-grid, pricing-table, testimonial, etc.
        order: { type: Number, default: 0 },
        content: { type: mongoose.Schema.Types.Mixed, default: {} },
      },
    ],
  },
  { timestamps: true }
);

shopSchema.pre('validate', function (next) {
  if (this.name && !this.subdomain) {
    this.subdomain = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Shop', shopSchema);
