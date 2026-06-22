// server/src/models/Obituary.js
const mongoose = require('mongoose');

const THRISSUR_WARDS = [
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad",
  "All Places", ""
];

const obituarySchema = new mongoose.Schema({
  headline: { type: String, required: true }, // The deceased person's name
  body: { type: String, required: true },     // The obituary text
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  location: {
    ward: { type: String, required: false, enum: THRISSUR_WARDS },
    landmark: { type: String }
  },
  media: [{
    type: { type: String, enum: ['image'], default: 'image' },
    url: String
  }]
}, { timestamps: true });

obituarySchema.index({ createdAt: -1 });
module.exports = mongoose.model('Obituary', obituarySchema);