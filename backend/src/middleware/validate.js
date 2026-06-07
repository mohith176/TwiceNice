const { validationResult } = require('express-validator');

// Runs after express-validator validation chains. If any rule failed, it
// short-circuits with a 400 and the first error message, keeping our
// responses in the consistent { error: "..." } shape.
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ error: result.array()[0].msg });
  }
  next();
}

module.exports = validate;
