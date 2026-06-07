const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const passwordRule = require('../utils/passwordRule');
const authController = require('../controllers/auth.controller');

const router = express.Router();

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('A valid email is required'),
  passwordRule('password'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('phone').optional().trim(),
];

const loginValidators = [
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidators, validate, authController.register);
router.post('/login', loginValidators, validate, authController.login);
router.get('/me', protect, authController.me);

module.exports = router;
