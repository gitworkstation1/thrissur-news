// server/src/models/Article.js
const mongoose = require('mongoose');

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
    // EXCLUSIVELY NEWS CATEGORIES
    enum: ['News', 'Crime', 'Politics', 'Sports', 'Business', 'Education', 'Local', 'Health'], 
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
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'] 
    },
    url: String,
    credit: { type: String, default: "" } 
  }],
  reportedBy: { type: String, default: "" },      
  photographedBy: { type: String, default: "" }   

}, { timestamps: true });

articleSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Article', articleSchema);