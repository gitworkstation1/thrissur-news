const express = require('express');
const router = express.Router();
const Region = require('../models/Region');

// GET: Fetch all regions (Public)
router.get('/', async (req, res) => {
  try {
    const regions = await Region.find().sort({ state: 1 });
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

// POST: Sync regions (🔓 TEMPORARILY UNLOCKED FOR LIVE SETUP)
router.post('/sync', async (req, res) => {
  try {
    const { regions } = req.body;
    
    if (!regions) {
      return res.status(400).json({ error: 'No regions data provided' });
    }

    await Region.deleteMany({});
    const savedRegions = await Region.insertMany(regions);
    
    res.json({ success: true, regions: savedRegions });
  } catch (error) {
    console.error('Region Sync Error:', error);
    res.status(500).json({ error: `Database Save Failed: ${error.message}` });
  }
});

module.exports = router;