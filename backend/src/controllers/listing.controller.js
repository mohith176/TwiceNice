const Listing = require('../models/Listing');
const Category = require('../models/Category');
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
