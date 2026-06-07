const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

const nameValidator = [body('name').trim().notEmpty().withMessage('Category name is required')];
const createValidators = [
  ...nameValidator,
  // parent is optional; when present it must look like a Mongo id. checkFalsy lets
  // '' or null mean "top-level".
  body('parent').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid parent category id'),
];

// Public read of the category tree.
router.get('/', categoryController.listTree);

// Admin-only writes.
router.post('/', protect, admin, createValidators, validate, categoryController.create);
router.patch('/:id', protect, admin, nameValidator, validate, categoryController.update);
router.delete('/:id', protect, admin, categoryController.remove);

module.exports = router;
