const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const passwordRule = require('../utils/passwordRule');
const userController = require('../controllers/user.controller');

const router = express.Router();

const updateValidators = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('phone').optional().trim(),
];

const passwordChangeValidators = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRule('newPassword'),
];

// Specific "me" routes first, then the public-by-id route.
router.patch('/me', protect, updateValidators, validate, userController.updateMe);
router.patch('/me/password', protect, passwordChangeValidators, validate, userController.changePassword);
router.get('/:id', userController.getPublicProfile);

module.exports = router;
