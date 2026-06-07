const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, location } = req.body;
  const normalizedEmail = email.toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ error: 'That email is already in use' });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    phone: phone || '',
    location,
  });

  const token = generateToken(user._id);
  res.status(201).json({ user, token }); // toJSON strips passwordHash
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // passwordHash is select:false, so ask for it explicitly to verify the login.
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  // Same generic message whether the email or the password is wrong, so we don't
  // leak which emails are registered.
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (user.isBanned) {
    return res.status(403).json({ error: 'Your account has been banned' });
  }

  const token = generateToken(user._id);
  res.json({ user, token });
});

// GET /api/auth/me  (protected)
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
