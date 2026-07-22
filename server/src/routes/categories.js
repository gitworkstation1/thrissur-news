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

// ⚡ POST: Add a single new category
router.post('/', async (req, res) => {
  try {
    const { name, isVisible, order } = req.body;
    
    // Prevent duplicates (case-sensitive check based on your schema)
    const existingCategory = await CategorySettings.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new CategorySettings({ 
      name, 
      isVisible: isVisible !== undefined ? isVisible : true, 
      order: order || 0 
    });
    
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

// ⚡ PUT: Bulk update category orders (for drag and drop)
// PLACED ABOVE `/:id` SO IT DOES NOT GET INTERCEPTED
router.put('/reorder/bulk', async (req, res) => {
  try {
    const { categories } = req.body; // Expects array of { _id, order }
    
    // Create an array of update operations for MongoDB
    const bulkOps = categories.map((cat) => ({
      updateOne: {
        filter: { _id: cat._id },
        update: { order: cat.order }
      }
    }));

    await CategorySettings.bulkWrite(bulkOps);
    res.json({ message: "Categories reordered successfully" });
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

// ⚡ DELETE: Remove a category
router.delete('/:id', async (req, res) => {
  try {
    await CategorySettings.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ⚡ EXPORT MUST ALWAYS BE AT THE VERY BOTTOM
module.exports = router;