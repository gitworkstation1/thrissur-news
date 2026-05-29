// server/src/routes/news.js
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// GET: Fetch all articles for the public feed
router.get('/', async (req, res) => {
  try {
    // .lean() makes the query insanely fast by returning pure JSON
    const articles = await Article.find().sort({ createdAt: -1 }).lean();
    res.json({ articles });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// POST: Create a new article (We will use this soon from the Admin UI)
router.post('/', async (req, res) => {
  try {
    const newArticle = new Article(req.body);
    const savedArticle = await newArticle.save();
    res.status(201).json({ success: true, article: savedArticle });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;