// server/src/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Dynamic CORS: Allows your local testing environment AND your live Vercel deployment
const allowedOrigins = [
  'http://localhost:3000',
  'https://thrissur-news-tau.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// MongoDB Atlas Connection
// Note: Changed process.env.MONGO_URI to match whatever key name you use on Render
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/news', require('./routes/news'));
app.use('/api/media', require('./routes/media'));

// Binds dynamically to the port Render gives you, fallback to 5000 locally
app.listen(PORT, () => {
  console.log(`🚀 Backend Engine running on port ${PORT}`);
});