// server/src/models/Short.js
const mongoose = require('mongoose');

const THRISSUR_WARDS = [
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad",
  "All Places", ""
];

const shortSchema = new mongoose.Schema({
  headline: { type: String, required: true },
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
    url: { type: String, required: true }
  }]
}, { timestamps: true });

shortSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Short', shortSchema);