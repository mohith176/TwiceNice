const Listing = require('../models/Listing');
const Category = require('../models/Category');
const Favorite = require('../models/Favorite');
const asyncHandler = require('../utils/asyncHandler');

// Loads a listing and verifies the current user owns it. On failure it writes the
// response (404 or 403) and returns null, so callers just `if (!listing) return`.
async function loadOwnedListing(req, res) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' });
    return null;
  }
  if (String(listing.seller) !== String(req.user._id)) {
    res.status(403).json({ error: 'You can only modify your own listings' });
    return null;
  }
  return listing;
}

// Ensures the category exists and is a subcategory (leaf). Returns the category,
// or writes a 400 and returns null.
async function resolveSubcategory(categoryId, res) {
  const cat = await Category.findById(categoryId);
  if (!cat) {
    res.status(400).json({ error: 'Category not found' });
    return null;
  }
  if (!cat.parent) {
    res.status(400).json({ error: 'Listings must be placed in a subcategory' });
    return null;
  }
  return cat;
}

// POST /api/listings  (protected)
exports.create = asyncHandler(async (req, res) => {
  const {
    title, description, price, isFree, negotiable,
    category, condition, location, quantity, tags, images,
  } = req.body;

  // Price is required unless the item is free.
  if (!isFree && (price === undefined || price === null)) {
    return res.status(400).json({ error: 'Price is required (or mark the item as Free)' });
  }

  const cat = await resolveSubcategory(category, res);
  if (!cat) return;

  const listing = await Listing.create({
    title,
    description,
    price: isFree ? 0 : price,
    isFree: !!isFree,
    negotiable: !!negotiable,
    category: cat._id,
    condition,
    location,
    quantity: quantity == null ? 1 : quantity,
    tags: tags || [],
    images,
    seller: req.user._id,
  });

  res.status(201).json({ listing });
});

// GET /api/listings  (public) — browse with keyword search, filters, sort, pagination.
// Query params: q, category (top-level id, expands to its subcategories),
// subcategory (leaf id), minPrice, maxPrice, condition (comma-separated), location,
// hideSold, sort (new|price_asc|price_desc|relevance), page, limit.
exports.list = asyncHandler(async (req, res) => {
  const { q, category, subcategory, minPrice, maxPrice, condition, location, hideSold } = req.query;

  const filter = {};
  if (q) filter.$text = { $search: q };

  // Category: a subcategory matches directly; a top-level category expands to all
  // of its subcategory ids (since listings always live in a subcategory).
  if (subcategory) {
    filter.category = subcategory;
  } else if (category) {
    const subs = await Category.find({ parent: category }).select('_id');
    filter.category = { $in: subs.map((s) => s._id) };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  if (condition) filter.condition = { $in: String(condition).split(',') };
  if (location) filter.location = { $regex: String(location).trim(), $options: 'i' };

  // Sold items are shown by default; hideSold=true restricts to active only.
  if (hideSold === 'true') filter.status = 'active';

  // Sort: relevance only makes sense with a keyword; otherwise newest-first.
  const hasText = Boolean(q);
  const sortParam = req.query.sort || (hasText ? 'relevance' : 'new');
  let sortSpec;
  switch (sortParam) {
    case 'price_asc': sortSpec = { price: 1 }; break;
    case 'price_desc': sortSpec = { price: -1 }; break;
    case 'relevance': sortSpec = hasText ? { score: { $meta: 'textScore' } } : { createdAt: -1 }; break;
    default: sortSpec = { createdAt: -1 };
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  // textScore can only be projected when a $text search is active.
  const projection = hasText && sortParam === 'relevance' ? { score: { $meta: 'textScore' } } : undefined;

  const [items, total] = await Promise.all([
    Listing.find(filter, projection)
      .sort(sortSpec)
      .skip(skip)
      .limit(limit)
      .populate('seller', 'name location')
      .populate('category', 'name'),
    Listing.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit), limit });
});

// GET /api/listings/mine  (protected) — the current user's listings (all statuses),
// newest first. Powers the dashboard's Active/Sold tabs.
exports.mine = asyncHandler(async (req, res) => {
  const items = await Listing.find({ seller: req.user._id })
    .sort({ createdAt: -1 })
    .populate('category', 'name');
  res.json({ items });
});

// GET /api/listings/:id  (public) — full detail with seller + category breadcrumb.
exports.getOne = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('seller', 'name location createdAt')
    .populate({
      path: 'category',
      select: 'name parent',
      populate: { path: 'parent', select: 'name' },
    });

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  res.json({ listing });
});

// PATCH /api/listings/:id  (protected, owner) — edit fields. Status is changed
// only via the dedicated /sold endpoint.
exports.update = asyncHandler(async (req, res) => {
  const listing = await loadOwnedListing(req, res);
  if (!listing) return;

  if (req.body.category !== undefined) {
    const cat = await resolveSubcategory(req.body.category, res);
    if (!cat) return;
    listing.category = cat._id;
  }

  ['title', 'description', 'negotiable', 'condition', 'location', 'quantity', 'tags', 'images'].forEach((f) => {
    if (req.body[f] !== undefined) listing[f] = req.body[f];
  });

  if (req.body.isFree !== undefined) listing.isFree = !!req.body.isFree;
  if (req.body.price !== undefined) listing.price = req.body.price;
  if (listing.isFree) listing.price = 0; // keep free + price in sync

  await listing.save();
  res.json({ listing });
});

// DELETE /api/listings/:id  (protected, owner)
exports.remove = asyncHandler(async (req, res) => {
  const listing = await loadOwnedListing(req, res);
  if (!listing) return;
  await listing.deleteOne();
  // Remove any favorites pointing at this listing so wishlists stay clean.
  await Favorite.deleteMany({ listing: listing._id });
  res.json({ message: 'Listing deleted' });
});

// PATCH /api/listings/:id/sold  (protected, owner) — toggles active <-> sold,
// so the same control both marks sold and relists.
exports.toggleSold = asyncHandler(async (req, res) => {
  const listing = await loadOwnedListing(req, res);
  if (!listing) return;
  listing.status = listing.status === 'sold' ? 'active' : 'sold';
  await listing.save();
  res.json({ listing });
});
