const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/Article');

// server/src/routes/news.js (Update your GET route)
router.get('/', async (req, res) => {
  try {
    // 1. Grab parameters (Added 'ward' back!)
    const { category, search, page = 1, limit = 10, status, ward } = req.query;
    
    // 2. Build the MongoDB query
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // THE FIX: Add the ward filter back into the database query
    if (ward && ward !== 'All Places') {
      query['location.ward'] = ward; 
    }

    if (search) {
      query.headline = { $regex: search, $options: 'i' }; 
    }
    
    if (status === 'draft') {
      query.status = 'draft';
    } else if (status === 'all') {
      // Admin sees all
    } else {
      // Public Site: Exclude drafts 
      query.status = { $ne: 'draft' }; 
    }

    // 3. Calculate how many articles to skip based on the current page
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 4. Fetch the specific batch of articles
    const articles = await Article.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit));
      
    // 5. Count total documents to know when to hide the "Load More" button
    const total = await Article.countDocuments(query);
    
    // 6. Send the payload back to the dashboard
    res.json({
      articles,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});


// GET /api/news/stats - Get dashboard metrics
router.get('/stats', async (req, res) => {
  try {
    const total = await Article.countDocuments();
    // Count anything that isn't explicitly a draft as published
    const published = await Article.countDocuments({ status: { $ne: 'draft' } }); 
    const drafts = await Article.countDocuments({ status: 'draft' });
    const breaking = await Article.countDocuments({ isBreaking: true, status: { $ne: 'draft' } });

    res.json({ total, published, drafts, breaking });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


// 2. NEW ROUTE: Fetch single article by ID
// Must be placed before the POST route
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // THE BOUNCER: Check if it's a valid 24-character MongoDB ID first
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Article not found (Invalid ID format)' });
    }

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

// UPDATE an existing article
router.put('/:id', async (req, res) => {
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // This tells MongoDB to return the newly updated version
    );
    
    if (!updatedArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update article', error: error.message });
  }
});

// DELETE /api/news/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the article first to check for media attachments
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // 2. Look for any images attached to this article
    if (article.media && article.media.length > 0) {
      for (const item of article.media) {
        if (item.type === 'image' && item.url) {
          try {
            // Extract the Cloudinary public_id using a clean regex
            // Example: https://res.cloudinary.com/demo/image/upload/v12345/folder/sample.jpg -> folder/sample
            const matches = item.url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
            
            if (matches && matches[1]) {
              const publicId = matches[1];
              // Fire and forget deletion to Cloudinary
              await cloudinary.uploader.destroy(publicId);
              console.log(`Successfully deleted Cloudinary asset: ${publicId}`);
            }
          } catch (cloudinaryErr) {
            // Log the error but don't stop the database deletion if this fails
            console.error('Failed to delete image from Cloudinary:', cloudinaryErr);
          }
        }
      }
    }

    // 3. Permanently remove the article from MongoDB
    await Article.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Article and associated media deleted successfully' });
    
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;