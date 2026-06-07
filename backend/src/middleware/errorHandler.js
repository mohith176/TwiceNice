// Central error handler. Express recognizes it as an error middleware because
// it takes four arguments (err, req, res, next). Every thrown/forwarded error
// ends up here, so responses stay consistent: always { error: "..." }.
function errorHandler(err, req, res, next) {
  // Log the full error server-side for debugging.
  console.error(err);

  // Mongoose: malformed ObjectId (e.g. GET /listings/not-an-id)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  // Mongoose: schema validation failed
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ error: message });
  }

  // multer: upload limits exceeded (file too large, too many files, etc.)
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }

  // MongoDB: duplicate key (e.g. an email that already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ error: `That ${field} is already in use` });
  }

  // Anything else: use an explicit statusCode if one was set, else 500.
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = errorHandler;
