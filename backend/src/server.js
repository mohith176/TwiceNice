require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start accepting requests.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`TwiceNice API running on http://localhost:${PORT}`);
  });
});
