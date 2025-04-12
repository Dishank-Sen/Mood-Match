const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
  email: { type: String, required: true ,unique: true},
  code: {type: Number, required: true},
  createdAt: { type: Date, default: Date.now, expires: 600 } 
});

module.exports = mongoose.model('Code', codeSchema);
