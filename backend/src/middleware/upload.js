const multer = require('multer');

// We keep uploaded files in memory (not on disk) because we immediately stream
// them on to Cloudinary and never need a local copy.
const storage = multer.memoryStorage();

// Reject anything that isn't an image, before it ever reaches Cloudinary.
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const err = new Error('Only image files are allowed');
    err.statusCode = 400;
    cb(err);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 5, // matches our "up to 5 images per listing" rule
  },
});

module.exports = upload;
