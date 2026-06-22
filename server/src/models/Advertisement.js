// server/src/models/Advertisement.js
const mongoose = require('mongoose');

const THRISSUR_WARDS = [
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad",
  "All Places", ""
];

const advertisementSchema = new mongoose.Schema({
  // Using 'headline' instead of 'sponsorName' so your frontend components don't break
  headline: { type: String, required: true }, 
  externalLink: { type: String, required: true },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  location: {
    ward: { type: String, required: false, enum: THRISSUR_WARDS },
    landmark: { type: String } // e.g., "Homepage Hero"
  },
  media: [{
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    url: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Advertisement', advertisementSchema);