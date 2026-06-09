// server/src/routes/media.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary with your .env keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure Multer to hold the file in RAM (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// 3. The Upload Route
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // SECURITY CHECK: Did we actually receive a file?
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // 1. Grab the headline we sent from the frontend
    const rawHeadline = req.body.headline || 'Untitled-Story';
    
    // 2. Generate the date variables
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 3. Clean the headline
    const safeHeadline = rawHeadline.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

    // 4. Construct the nested folder path (Year / Month / Day / Headline)
    const folderPath = `ThrissurNews/${year}/${month}/${day}/${safeHeadline}`;
    
    // 5. Upload to Cloudinary using an Upload Stream (since the file is in memory)
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        public_id: safeHeadline,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Stream Error:', error);
          return res.status(500).json({ error: 'Cloudinary rejected the upload' });
        }
        // Success! Send the URL back to the frontend
        res.json({ url: result.secure_url });
      }
    );

    // 6. Push the memory buffer into the Cloudinary stream
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error('Upload Route Error:', error);
    res.status(500).json({ error: 'Server error during image upload' });
  }
});

module.exports = router;