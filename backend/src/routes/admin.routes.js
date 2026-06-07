const express = require('express');
const { param } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Every admin route requires a logged-in admin.
router.use(protect, admin);

router.get('/users', adminController.listUsers);
router.get('/listings', adminController.listListings);

router.delete(
  '/listings/:id',
  [param('id').isMongoId().withMessage('Invalid listing id')],
  validate,
  adminController.removeListing
);

router.patch(
  '/users/:id/ban',
  [param('id').isMongoId().withMessage('Invalid user id')],
  validate,
  adminController.toggleBan
);

module.exports = router;
