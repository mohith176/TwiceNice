const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const conversationController = require('../controllers/conversation.controller');

const router = express.Router();

// Specific routes before parameterized ones.
router.get('/unread-count', protect, conversationController.unreadCount);
router.get('/', protect, conversationController.inbox);

router.post(
  '/',
  protect,
  [
    body('listingId').isMongoId().withMessage('A valid listing id is required'),
    body('body').trim().notEmpty().withMessage('Message cannot be empty'),
  ],
  validate,
  conversationController.start
);

router.get(
  '/:id/messages',
  protect,
  [param('id').isMongoId().withMessage('Invalid conversation id')],
  validate,
  conversationController.messages
);

router.post(
  '/:id/messages',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid conversation id'),
    body('body').trim().notEmpty().withMessage('Message cannot be empty'),
  ],
  validate,
  conversationController.sendMessage
);

module.exports = router;
