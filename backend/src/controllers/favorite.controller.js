const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/favorites/:listingId  (protected) — idempotent add.
exports.add = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  // Upsert so favoriting the same listing twice is harmless (no duplicate error).
  const favorite = await Favorite.findOneAndUpdate(
    { user: req.user._id, listing: listing._id },
    { $setOnInsert: { user: req.user._id, listing: listing._id } },
    { new: true, upsert: true }
  );

  res.status(201).json({ favorite });
});

// DELETE /api/favorites/:listingId  (protected) — idempotent remove.
exports.remove = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ user: req.user._id, listing: req.params.listingId });
  res.json({ message: 'Removed from favorites' });
});

// GET /api/favorites  (protected) — the listings the current user has saved.
exports.list = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'listing',
      populate: [
        { path: 'seller', select: 'name location' },
        { path: 'category', select: 'name' },
      ],
    });

  // Drop favorites whose listing has since been deleted.
  const items = favorites.map((f) => f.listing).filter(Boolean);
  res.json({ items });
});
