// server/src/models/Article.js
const mongoose = require('mongoose');

// Hardcoded Wards to prevent typos from the editorial team
const THRISSUR_WARDS = [
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad"
];

const articleSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  body: { type: String, required: true },
  isBreaking: { type: Boolean, default: false },
  // ADD THIS NEW CATEGORY FIELD:
  category: { 
    type: String, 
    required: true,
    enum: ["News", "Crime", "Politics", "Sports", "Business", "Education", "Local", "Health"],
    default: "News"
  },
  location: {
    ward: { type: String, required: true, enum: THRISSUR_WARDS },
    landmark: { type: String }
  },
  media: { type: Array, default: [] },
}, { timestamps: true });

articleSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Article', articleSchema);