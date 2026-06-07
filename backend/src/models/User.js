const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // creates a unique index; duplicates surface as error code 11000
      lowercase: true,
      trim: true,
    },
    // Hidden by default (select: false) so it never leaks via normal queries.
    // Load it explicitly with .select('+passwordHash') when you need to verify a login.
    passwordHash: { type: String, required: true, select: false },
    // phone is optional: it is private and contact happens via in-app messaging.
    phone: { type: String, trim: true, default: '' },
    // location is required: it powers the browse/search location filter.
    location: { type: String, required: true, trim: true },
    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash a plaintext password. Used at registration and password-change time.
userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

// Compare a plaintext password against this user's stored hash.
// The document must have been loaded with the passwordHash field present.
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Defense in depth: even if passwordHash is somehow loaded, never serialize it
// (or the internal __v) into an API response.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
