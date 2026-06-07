const { body } = require('express-validator');

// The single source of truth for our strict password policy:
// min 8 chars, with an uppercase letter, a lowercase letter, a number, and a symbol.
// Reused by registration and change-password so the rule can never drift apart.
function passwordRule(field = 'password') {
  return body(field)
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a symbol');
}

module.exports = passwordRule;
