const Category = require('../models/Category');
const Listing = require('../models/Listing');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/categories  (public) — returns the 2-level tree:
// [{ _id, name, subcategories: [ {...}, ... ] }, ...]
exports.listTree = asyncHandler(async (req, res) => {
  const all = await Category.find().sort('name').lean();

  const tops = all.filter((c) => c.parent === null);
  const tree = tops.map((top) => ({
    ...top,
    subcategories: all.filter((c) => c.parent && String(c.parent) === String(top._id)),
  }));

  res.json({ categories: tree });
});

// POST /api/categories  (admin) — create a top-level category (no parent) or a
// subcategory (parent = an existing top-level category).
exports.create = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;

  let parentId = null;
  if (parent) {
    const parentCat = await Category.findById(parent);
    if (!parentCat) {
      return res.status(400).json({ error: 'Parent category not found' });
    }
    // Enforce the 2-level limit: a parent must itself be top-level.
    if (parentCat.parent) {
      return res.status(400).json({ error: 'Categories can only be two levels deep' });
    }
    parentId = parentCat._id;
  }

  const category = await Category.create({ name, parent: parentId });
  res.status(201).json({ category });
});

// PATCH /api/categories/:id  (admin) — rename a category.
// Moving a category to a different parent is intentionally not supported.
exports.update = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true, runValidators: true }
  );
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json({ category });
});

// DELETE /api/categories/:id  (admin) — blocked if the category has dependents.
exports.remove = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const childCount = await Category.countDocuments({ parent: category._id });
  if (childCount > 0) {
    return res.status(409).json({
      error: 'Cannot delete: this category has subcategories. Delete them first.',
    });
  }

  const listingCount = await Listing.countDocuments({ category: category._id });
  if (listingCount > 0) {
    return res.status(409).json({
      error: 'Cannot delete: listings still use this category.',
    });
  }

  await category.deleteOne();
  res.json({ message: 'Category deleted' });
});
