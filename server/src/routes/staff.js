const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// --- 🛡️ SECURITY MIDDLEWARE ---
const requireAdmin = (req, res, next) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader || !cookieHeader.includes('admin_token=authenticated')) {
    return res.status(401).json({ error: 'Unauthorized: Admin access required.' });
  }
  next();
};

// 1. GET ALL STAFF (Public - needed for composer dropdown)
router.get('/', async (req, res) => {
  try {
    // Sort alphabetically by name
    const staff = await Staff.find().sort({ name: 1 }).lean();
    res.json(staff);
  } catch (error) {
    console.error('Fetch staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff directory' });
  }
});

// 2. POST NEW STAFF (Protected)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const newStaff = new Staff(req.body);
    const savedStaff = await newStaff.save();
    res.status(201).json(savedStaff);
  } catch (error) {
    console.error("Staff save error:", error);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// 3. DELETE STAFF (Protected)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    console.error('Staff delete error:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

module.exports = router;