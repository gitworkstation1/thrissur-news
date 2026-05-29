// server/src/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

//console.log("THE APP IS READING THIS LINK:", process.env.MONGO_URI);

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/news', require('./routes/news'));
app.use('/api/media', require('./routes/media'));

app.listen(PORT, () => {
  console.log(`🚀 Backend Engine running on http://localhost:${PORT}`);
});