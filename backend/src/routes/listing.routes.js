const express = require('express');
const { body, query } = require('express-validator');
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

const listValidators = [
  query('sort').optional().isIn(['new', 'price_asc', 'price_desc', 'relevance']).withMessage('Invalid sort'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 48 }).withMessage('limit must be between 1 and 48'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a non-negative number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a non-negative number'),
  query('category').optional().isMongoId().withMessage('Invalid category id'),
  query('subcategory').optional().isMongoId().withMessage('Invalid subcategory id'),
  query('hideSold').optional().isBoolean().withMessage('hideSold must be true or false'),
];

router.get('/', listValidators, validate, listingController.list);
router.post('/', protect, createValidators, validate, listingController.create);
// "/mine" must be declared before "/:id" so it isn't captured as an id param.
router.get('/mine', protect, listingController.mine);
router.get('/:id', listingController.getOne);
router.patch('/:id', protect, updateValidators, validate, listingController.update);
router.delete('/:id', protect, listingController.remove);
router.patch('/:id/sold', protect, listingController.toggleSold);

module.exports = router;
