const express = require('express');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();

// multer parses the multipart body and populates req.files (max 5, field "images").
router.post('/', protect, upload.array('images', 5), uploadController.uploadImages);

module.exports = router;
