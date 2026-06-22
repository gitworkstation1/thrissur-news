// server/src/routes/news.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import all our new specialized models
const Article = require('../models/Article');
const Obituary = require('../models/Obituary');
const Advertisement = require('../models/Advertisement');
const Short = require('../models/Short');

// Note: If you have cloudinary required elsewhere, ensure it's at the top of the file!
// const cloudinary = require('cloudinary').v2;

// 1. GET STATS (Admin Dashboard - Tracks real news)
// Must stay at the top before /:id
router.get('/stats', async (req, res) => {
  try {
    const total = await Article.countDocuments();
    const published = await Article.countDocuments({ status: { $ne: 'draft' } }); 
    const drafts = await Article.countDocuments({ status: 'draft' });
    const breaking = await Article.countDocuments({ isBreaking: true, status: { $ne: 'draft' } });

    res.json({ total, published, drafts, breaking });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 2. GET ALL (Smart Routing based on category, date, and breaking status)
router.get('/', async (req, res) => {
  try {
    // ADDED isBreaking and date to the destructured query
    const { category, search, page = 1, limit = 10, status, ward, isBreaking, date } = req.query;
    
    let ModelToQuery = Article;
    if (category === 'Obituary') ModelToQuery = Obituary;
    else if (category === 'Advertisement') ModelToQuery = Advertisement;
    else if (category === 'Shorts') ModelToQuery = Short;

    let query = {};
    if (category && category !== 'All' && ModelToQuery === Article) {
      query.category = category;
    }
    
    if (ward && ward !== 'All Places') query['location.ward'] = ward; 
    if (search) query.headline = { $regex: search, $options: 'i' }; 
    
    // --- NEW: Filter by Breaking News ---
    if (isBreaking === 'true') {
      query.isBreaking = true;
    }

    // --- NEW: Filter by Date ---
    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0); // Start of the selected day
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999); // End of the selected day
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    if (status === 'draft') query.status = 'draft';
    else if (status !== 'all') query.status = { $ne: 'draft' }; 

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const articles = await ModelToQuery.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
      
    const total = await ModelToQuery.countDocuments(query);
    
    const formattedArticles = articles.map(item => {
        if (category === 'Obituary') item.category = 'Obituary';
        if (category === 'Advertisement') item.category = 'Advertisement';
        if (category === 'Shorts') item.category = 'Shorts';
        return item;
    });

    res.json({
      articles: formattedArticles,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// 3. GET BY ID (Searches all collections)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // THE BOUNCER: Check if it's a valid 24-character MongoDB ID first
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Document not found (Invalid ID format)' });
    }

    // Check each collection until found
    let doc = await Article.findById(id).lean();
    if (doc) return res.json(doc);

    doc = await Obituary.findById(id).lean();
    if (doc) { doc.category = 'Obituary'; return res.json(doc); }

    doc = await Advertisement.findById(id).lean();
    if (doc) { doc.category = 'Advertisement'; return res.json(doc); }

    doc = await Short.findById(id).lean();
    if (doc) { doc.category = 'Shorts'; return res.json(doc); }

    return res.status(404).json({ error: 'Document not found' });
  } catch (error) {
    console.error('Fetch by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. POST: Create a new document (Routes to correct collection)
router.post('/', async (req, res) => {
  try {
    const { category } = req.body;
    let newDoc;

    if (category === 'Obituary') {
        newDoc = new Obituary(req.body);
    } else if (category === 'Advertisement') {
        newDoc = new Advertisement(req.body);
    } else if (category === 'Shorts') {
        newDoc = new Short(req.body);
    } else {
        newDoc = new Article(req.body);
    }

    const savedDoc = await newDoc.save();
    res.status(201).json({ success: true, article: savedDoc });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Document not found (Invalid ID format)' });
    }

    let ModelToUse = null;
    if (await Article.findById(id)) ModelToUse = Article;
    else if (await Obituary.findById(id)) ModelToUse = Obituary;
    else if (await Advertisement.findById(id)) ModelToUse = Advertisement;
    else if (await Short.findById(id)) ModelToUse = Short;

    if (!ModelToUse) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const updatedDoc = await ModelToUse.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update document', error: error.message });
  }
});

// 6. DELETE (Includes your Cloudinary Cleanup)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Document not found (Invalid ID format)' });
    }

    // 1. Find the document and determine its collection
    let ModelToUse = null;
    let document = null;

    document = await Article.findById(id);
    if (document) ModelToUse = Article;
    else {
        document = await Obituary.findById(id);
        if (document) ModelToUse = Obituary;
        else {
            document = await Advertisement.findById(id);
            if (document) ModelToUse = Advertisement;
            else {
                document = await Short.findById(id);
                if (document) ModelToUse = Short;
            }
        }
    }

    if (!document || !ModelToUse) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // 2. Look for any images attached to this document (Works for Ads/Obits too!)
    if (document.media && document.media.length > 0) {
      for (const item of document.media) {
        if (item.type === 'image' && item.url) {
          try {
            const matches = item.url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
            if (matches && matches[1]) {
              const publicId = matches[1];
              // Assuming cloudinary is required globally or in this file
              if (typeof cloudinary !== 'undefined') {
                 await cloudinary.uploader.destroy(publicId);
                 console.log(`Successfully deleted Cloudinary asset: ${publicId}`);
              }
            }
          } catch (cloudinaryErr) {
            console.error('Failed to delete image from Cloudinary:', cloudinaryErr);
          }
        }
      }
    }

    // 3. Permanently remove the document from the correct MongoDB Collection
    await ModelToUse.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Document and associated media deleted successfully' });
    
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;