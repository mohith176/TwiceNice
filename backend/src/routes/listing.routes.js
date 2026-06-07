const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const Listing = require('../models/Listing');
const listingController = require('../controllers/listing.controller');

const router = express.Router();

const createValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('isFree').optional().isBoolean().withMessage('isFree must be true or false'),
  body('negotiable').optional().isBoolean().withMessage('negotiable must be true or false'),
  body('category').notEmpty().isMongoId().withMessage('A valid category is required'),
  body('condition').isIn(Listing.CONDITIONS).withMessage('Invalid condition'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('images').isArray({ min: 1, max: 5 }).withMessage('Provide between 1 and 5 images'),
  body('images.*').isString().trim().notEmpty().withMessage('Each image must be a URL string'),
];

// All fields optional on edit; same rules otherwise.
const updateValidators = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('isFree').optional().isBoolean(),
  body('negotiable').optional().isBoolean(),
  body('category').optional().isMongoId().withMessage('A valid category is required'),
  body('condition').optional().isIn(Listing.CONDITIONS).withMessage('Invalid condition'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('images').optional().isArray({ min: 1, max: 5 }).withMessage('Provide between 1 and 5 images'),
  body('images.*').optional().isString().trim().notEmpty(),
];

router.post('/', protect, createValidators, validate, listingController.create);
router.get('/:id', listingController.getOne);
router.patch('/:id', protect, updateValidators, validate, listingController.update);
router.delete('/:id', protect, listingController.remove);
router.patch('/:id/sold', protect, listingController.toggleSold);

module.exports = router;
