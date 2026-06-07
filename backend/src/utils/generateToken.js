const jwt = require('jsonwebtoken');

// Signs a JWT carrying just the user's id. The frontend stores this and sends
// it as `Authorization: Bearer <token>` on protected requests.
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;
