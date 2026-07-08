const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  state: { 
    type: String, 
    required: true, 
    unique: true 
  },
  districts: [{
    name: { type: String, required: true },
    locals: [{ type: String }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Region', regionSchema);