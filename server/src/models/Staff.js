const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['Reporter', 'Photographer'] 
  },
  avatarUrl: { 
    type: String, 
    default: "" 
  }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);