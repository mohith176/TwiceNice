const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Protects a route: requires a valid Bearer token, loads the user onto req.user,
// and blocks banned accounts from acting.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = header.slice(7);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = await User.findById(payload.id);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }
  if (user.isBanned) {
    return res.status(403).json({ error: 'Your account has been banned' });
  }

  req.user = user;
  next();
});

module.exports = protect;
