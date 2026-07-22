const express = require('express');
const router = express.Router();
const CategorySettings = require('../models/CategorySettings');

// GET: Fetch all categories, sorted by their order number
router.get('/', async (req, res) => {
  try {
    const categories = await CategorySettings.find().sort({ order: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: Update a specific category (e.g., toggle visibility from Admin Dashboard)
router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await CategorySettings.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST: Bulk initialize/update categories (useful for initial setup)
router.post('/bulk', async (req, res) => {
  try {
    const { categories } = req.body;
    // Clears existing categories and replaces them with the new array
    await CategorySettings.deleteMany({});
    const inserted = await CategorySettings.insertMany(categories);
    res.status(201).json(inserted);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;