// server/src/models/Advertisement.js
const mongoose = require('mongoose');

const THRISSUR_WARDS = [
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad",
  "All Places", ""
];

const advertisementSchema = new mongoose.Schema({
  headline: { 
    type: String, 
    required: [true, 'Sponsor name/headline is required'],
    trim: true,
    maxlength: [200, 'Headline cannot exceed 200 characters']
  }, 
  externalLink: { 
    type: String, 
    required: [true, 'External link is required'],
    trim: true,
    // 🛡️ SECURITY: Prevents JS-injection into the href attribute
    match: [/^https?:\/\/.+/, 'Please provide a valid web URL (http/https)']
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  location: {
    ward: { type: String, required: false, enum: THRISSUR_WARDS },
    landmark: { 
      type: String,
      trim: true,
      maxlength: [100, 'Landmark identifier cannot exceed 100 characters']
    }
  },
  media: [{
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    url: { 
      type: String, 
      required: [true, 'Media URL is required'],
      match: [/^https?:\/\/.+/, 'Please provide a valid image/video URL'] 
    }
  }]
}, { timestamps: true });

// 🚀 PERFORMANCE: Speeds up your homepage ad-filtering logic
advertisementSchema.index({ status: 1, 'location.landmark': 1 });

module.exports = mongoose.model('Advertisement', advertisementSchema);