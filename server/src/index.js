require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit');

// Import routes
const regionRoutes = require('./routes/regions');

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. THE REVERSE PROXY FIX ---
app.set('trust proxy', 1);

// --- 2. GLOBAL SECURITY SHIELDS ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } 
}));

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(globalLimiter);

// --- 3. MIDDLEWARE (MUST BE BEFORE ROUTES) ---
const allowedOrigins = [
  'http://localhost:3000',
  'https://thrissur-news-tau.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
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

// --- 4. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- 5. ROUTES (MUST BE AFTER MIDDLEWARE) ---
app.use('/api/news', require('./routes/news'));
app.use('/api/media', require('./routes/media'));
app.use('/api/regions', regionRoutes); // ⚡ MOVED HERE!

app.listen(PORT, () => {
  console.log(`🚀 Backend Engine running on port ${PORT}`);
});