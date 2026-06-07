const express = require('express');
const { param } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const favoriteController = require('../controllers/favorite.controller');

const router = express.Router();

const listingIdParam = [param('listingId').isMongoId().withMessage('Invalid listing id')];

router.get('/', protect, favoriteController.list);
router.post('/:listingId', protect, listingIdParam, validate, favoriteController.add);
router.delete('/:listingId', protect, listingIdParam, validate, favoriteController.remove);

module.exports = router;
