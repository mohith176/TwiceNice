const cloudinary = require('cloudinary').v2;

// Configured once from environment. Used by the upload controller to stream
// image buffers to Cloudinary and get back hosted, CDN-delivered URLs.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
