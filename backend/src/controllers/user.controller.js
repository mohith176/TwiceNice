const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// PATCH /api/users/me  (protected) — edit own profile fields.
// Only name, phone, and location are editable. Email (login id), role, and ban
// status are intentionally NOT changeable here.
exports.updateMe = asyncHandler(async (req, res) => {
  const updates = {};
  ['name', 'phone', 'location'].forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // findByIdAndUpdate validates only the fields being updated, so we don't trip
  // required-field validation on untouched paths.
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ user });
});

// PATCH /api/users/me/password  (protected) — verify current password, then set a new one.
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Need the hash to verify the current password.
  const user = await User.findById(req.user._id).select('+passwordHash');

  const ok = await user.comparePassword(currentPassword);
  if (!ok) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();

  res.json({ message: 'Password updated' });
});

// GET /api/users/:id  (public) — a seller's public profile.
// Only public fields are returned; phone and email stay private.
// (Their listings get attached to this response in B10.)
exports.getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name location createdAt');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});
