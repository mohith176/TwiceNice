const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Core middleware ---
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- API routes (mounted here as they are built) ---
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/uploads', require('./routes/upload.routes'));
app.use('/api/listings', require('./routes/listing.routes'));

// --- 404 fallback (no route matched) ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Central error handler (must be registered last) ---
app.use(errorHandler);

module.exports = app;
