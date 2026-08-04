const express = require('express');
const router = express.Router();
const AppSettings = require('../models/AppSettings');

// GET: Fetch the universal app settings
router.get('/', async (req, res) => {
  try {
    // Look for the first settings document
    let settings = await AppSettings.findOne();

    // If no document exists yet (e.g., first time running the app), create a default one
    if (!settings) {
      settings = new AppSettings({ tickerSpeed: 30 });
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// PUT: Update the universal app settings
router.put('/', async (req, res) => {
  try {
    const { tickerSpeed } = req.body;

    // findOneAndUpdate with an empty filter {} targets the very first document.
    // 'upsert: true' ensures it creates the document if it somehow got deleted.
    // 'new: true' returns the updated document.
    const settings = await AppSettings.findOneAndUpdate(
      {}, 
      { tickerSpeed },
      { new: true, upsert: true } 
    );

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

module.exports = router;