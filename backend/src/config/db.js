const mongoose = require('mongoose');

// Connects to MongoDB Atlas using MONGO_URI. We exit the process on failure
// because the API is useless without a database.
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Missing MONGO_URI in environment. Did you create backend/.env?');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
