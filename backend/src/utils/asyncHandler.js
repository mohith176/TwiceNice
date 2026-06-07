// Wraps an async route handler so any rejected promise is forwarded to the
// central error-handling middleware (via next), instead of crashing the process.
// Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
