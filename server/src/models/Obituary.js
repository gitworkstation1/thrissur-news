// server/src/models/Obituary.js
const mongoose = require('mongoose');

const THRISSUR_WARDS = [
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad",
  "All Places", ""
];

const obituarySchema = new mongoose.Schema({
  headline: { 
    type: String, 
    required: [true, "The deceased person's name is required"],
    trim: true,
    maxlength: [200, "Name cannot exceed 200 characters"]
  }, 
  body: { 
    type: String, 
    required: [true, "Obituary text is required"],
    trim: true,
    maxlength: [10000, "Obituary text cannot exceed 10,000 characters"] // 🛡️ Generous limit that still blocks DB bloat attacks
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
      maxlength: [150, "Landmark cannot exceed 150 characters"]
    }
  },
  media: [{
    type: { type: String, enum: ['image'], default: 'image' },
    url: { 
      type: String, 
      required: [true, "Media URL is required if an image is added"],
      match: [/^https?:\/\/.+/, "Please provide a valid HTTP or HTTPS URL"] 
    }
  }]
}, { timestamps: true });

// 🚀 Compound Index: Lightning fast queries when filtering out 'drafts' and sorting by newest
obituarySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Obituary', obituarySchema);