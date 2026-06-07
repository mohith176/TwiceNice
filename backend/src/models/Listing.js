const mongoose = require('mongoose');

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const STATUSES = ['active', 'sold'];

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    // Stored as a plain number. When isFree is true the controller forces price to 0.
    price: { type: Number, required: true, min: 0 },
    isFree: { type: Boolean, default: false },
    negotiable: { type: Boolean, default: false },

    // Points at a subcategory (a Category that has a parent). The leaf-vs-top-level
    // rule is enforced in the controller (B8), not the schema.
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    condition: { type: String, enum: CONDITIONS, required: true },
    location: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 1 },

    tags: { type: [String], default: [] },

    // 1 to 5 image URLs (already hosted on Cloudinary). images[0] is the cover.
    images: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1 && arr.length <= 5,
        message: 'A listing must have between 1 and 5 images',
      },
    },

    status: { type: String, enum: STATUSES, default: 'active' },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Full-text search over title, description, and tags. Weights make a title match
// rank higher than a description match when sorting by relevance (B9).
listingSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, description: 1 }, name: 'listing_text' }
);

// Indexes supporting the common browse/filter/sort paths.
listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ category: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ seller: 1 });

listingSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

listingSchema.statics.CONDITIONS = CONDITIONS;
listingSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Listing', listingSchema);
