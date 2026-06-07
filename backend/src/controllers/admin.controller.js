const User = require('../models/User');
const Listing = require('../models/Listing');
const Favorite = require('../models/Favorite');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/users  (admin) — all users, newest first.
exports.listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
});

// GET /api/admin/listings  (admin) — all listings for moderation.
exports.listListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find()
    .sort({ createdAt: -1 })
    .populate('seller', 'name email')
    .populate('category', 'name');
  res.json({ listings });
});

// DELETE /api/admin/listings/:id  (admin) — remove any listing.
exports.removeListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  await listing.deleteOne();
  await Favorite.deleteMany({ listing: listing._id });
  res.json({ message: 'Listing removed' });
});

// PATCH /api/admin/users/:id/ban  (admin) — toggle a user's banned status.
exports.toggleBan = asyncHandler(async (req, res) => {
  // Guard against an admin locking themselves out.
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ error: 'You cannot ban yourself' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned: !user.isBanned },
    { new: true }
  );
  res.json({ user: updated });
});
