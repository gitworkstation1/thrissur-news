// server/src/models/Article.js
const mongoose = require('mongoose');

// Added "All Places" and "" to allow optional/global saving
const THRISSUR_WARDS = [
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad",
  "All Places", ""
];

const articleSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  body: { type: String, required: true },
  isBreaking: { type: Boolean, default: false },
  category: { 
    type: String, 
    required: true,
    enum: ['News', 'Crime', 'Politics', 'Sports', 'Business', 'Education', 'Local', 'Health', 'Shorts', 'Advertisement'],
    default: "News"
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  location: {
    ward: { type: String, required: false, enum: THRISSUR_WARDS },
    landmark: { type: String }
  },
  externalLink: { type: String, required: false },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'youtube-short'] 
    },
    url: String
  }]
}, { timestamps: true });

articleSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Article', articleSchema);