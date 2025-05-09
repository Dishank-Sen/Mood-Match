const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true ,unique: true},
  otp: {type: Number, required: true},
  createdAt: { type: Date, default: Date.now, expires: 600 } 
});

module.exports = mongoose.model('Otp', otpSchema);
