const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// 1. GET: Fetch all articles (Existing code)
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.category && req.query.category !== 'News') {
      query.category = new RegExp(`^${req.query.category}$`, 'i');
    }
    if (req.query.ward && req.query.ward !== 'All Places') {
      query['location.ward'] = req.query.ward;
    }
    const articles = await Article.find(query).sort({ createdAt: -1 }).lean();
    res.json({ articles });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// 2. NEW ROUTE: Fetch single article by ID
// Must be placed before the POST route
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id).lean();
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Fetch by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. POST: Create a new article
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