// server/src/models/Short.js
const mongoose = require('mongoose');

const THRISSUR_WARDS = [
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad",
  "All Places", ""
];

const shortSchema = new mongoose.Schema({
  headline: { 
    type: String, 
    required: [true, 'Headline is required'],
    trim: true, // Automatically strips accidental spaces at the start/end
    maxlength: [200, 'Headline cannot exceed 200 characters'] // 🛡️ NEW: Prevents DB bloat
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  location: {
    ward: { type: String, required: false, enum: THRISSUR_WARDS },
  },
  media: [{
    type: { type: String, enum: ['youtube-short', 'video'], default: 'youtube-short' },
    url: { 
      type: String, 
      required: [true, 'Media URL is required'],
      // 🛡️ NEW: Strict Regex to ensure it is an actual HTTP/HTTPS web address
      match: [/^https?:\/\/.+/, 'Please provide a valid HTTP or HTTPS URL'] 
    }
  }]
}, { timestamps: true });

// 🚀 NEW: Compound Index! 
// In your news.js, you constantly query `status` and sort by `createdAt`. 
// This compound index makes those API calls lightning fast.
shortSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Short', shortSchema);