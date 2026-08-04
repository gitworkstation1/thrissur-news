const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
  // We can add more platform-wide settings here in the future!
  tickerSpeed: {
    type: Number,
    required: true,
    default: 30 // Fallback default speed
  }
}, { timestamps: true });

module.exports = mongoose.model('AppSettings', appSettingsSchema);