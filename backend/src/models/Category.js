const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // null  => top-level category
    // set   => a subcategory whose parent is a top-level category (2 levels max)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  { timestamps: true }
);

// Business rule: no two categories may share the same name under the same parent
// (e.g. you can't have two "Phones" subcategories under "Electronics").
// A duplicate trips MongoDB error code 11000 -> handled as 409 by the error middleware.
categorySchema.index({ name: 1, parent: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
