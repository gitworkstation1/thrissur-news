// server/src/models/Article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  headline: { 
    type: String, 
    required: [true, 'Headline is required'],
    trim: true,
    maxlength: [300, 'Headline cannot exceed 300 characters']
  },
  body: { 
    type: String, 
    required: [true, 'Article body is required'],
    trim: true,
    maxlength: [50000, 'Article body cannot exceed 50,000 characters']
  },
  isBreaking: { 
    type: Boolean, 
    default: false 
  },
  // 📌 NEW: Ticker Pin Flag
  isTicker: { 
    type: Boolean, 
    default: false 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['News', 'Crime', 'Politics', 'Sports', 'Business', 'Education', 'Local', 'Health'], 
    default: "News"
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  location: {
    // ⚡ DYNAMIC UPGRADE: Removed the hardcoded enum. 
    // MongoDB will now accept ANY region you create in your Territory Manager!
    ward: { type: String, required: false, trim: true },
    landmark: { 
      type: String,
      trim: true,
      maxlength: [150, 'Landmark cannot exceed 150 characters']
    }
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'] 
    },
    url: { 
      type: String, 
      required: [true, 'Media URL is required'],
      match: [/^https?:\/\/.+/, 'Please provide a valid HTTP or HTTPS URL'] 
    },
    credit: { 
      type: String, 
      default: "",
      trim: true,
      maxlength: [100, 'Credit cannot exceed 100 characters']
    } 
  }],
  
  credits: {
    reporter: {
      name: { type: String, trim: true, default: "", maxlength: 100 },
      avatarUrl: { type: String, default: "" }
    },
    photographer: {
      name: { type: String, trim: true, default: "", maxlength: 100 },
      avatarUrl: { type: String, default: "" }
    }
  },

  reportedBy: { 
    type: String, 
    default: "",
    trim: true,
    maxlength: [100, 'Reporter name cannot exceed 100 characters']
  },      
  photographedBy: { 
    type: String, 
    default: "",
    trim: true,
    maxlength: [100, 'Photographer name cannot exceed 100 characters']
  }   

}, { timestamps: true });

// 🚀 HIGH-PERFORMANCE INDEXING
// 1. General feed & Category filtering
articleSchema.index({ status: 1, category: 1, createdAt: -1 });
// 2. Breaking News Carousel filtering
articleSchema.index({ status: 1, isBreaking: 1, createdAt: -1 });
// 3. Ticker filtering (Ensures blazing fast queries for the ticker)
articleSchema.index({ status: 1, isTicker: 1, createdAt: -1 });

module.exports = mongoose.model('Article', articleSchema);