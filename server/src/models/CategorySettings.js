const mongoose = require('mongoose');

const categorySettingsSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  isVisible: { 
    type: Boolean, 
    default: true 
  },
  order: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model('CategorySettings', categorySettingsSchema);