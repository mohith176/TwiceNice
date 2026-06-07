const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

// Streams one in-memory file buffer to Cloudinary and resolves its hosted URL.
function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'twicenice' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// POST /api/uploads  (protected)
// Accepts up to 5 files under the "images" field; returns their Cloudinary URLs.
// The frontend uploads here first, then sends the returned URLs when creating a listing.
exports.uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No image files provided' });
  }

  const urls = await Promise.all(req.files.map((file) => uploadBuffer(file.buffer)));
  res.status(201).json({ urls });
});
