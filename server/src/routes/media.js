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
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}); 

// 3. The Upload Route
router.post('/upload', (req, res) => {
  
  // WRAP MULTER EXECUTION TO CATCH ERRORS GRACEFULLY
  upload.single('image')(req, res, async (err) => {
    
    // --- 1. HANDLE MULTER CRASHES ---
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'An unknown server error occurred during upload.' });
    }

    // --- 2. PROCEED WITH CLOUDINARY UPLOAD ---
    try {
      // SECURITY CHECK: Did we actually receive a file?
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Grab the headline we sent from the frontend
      const rawHeadline = req.body.headline || 'Untitled-Story';
      
      // Generate the date variables
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      // Clean the headline
      const safeHeadline = rawHeadline.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

      // Construct the nested folder path (Year / Month / Day / Headline)
      const folderPath = `ThrissurNews/${year}/${month}/${day}/${safeHeadline}`;
      
      // Upload to Cloudinary using an Upload Stream
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

      // Push the memory buffer into the Cloudinary stream
      uploadStream.end(req.file.buffer);

    } catch (error) {
      console.error('Upload Route Error:', error);
      res.status(500).json({ error: 'Server error during image upload' });
    }
  });
});

module.exports = router;