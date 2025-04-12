const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true ,unique: true},
  contact: {type: Number, required: true},
  password: { type: String, required: true },
  profileImg: {type: String, required: true},
  createdAt: { type: Date, default: Date.now, expires: 600 } 
});

module.exports = mongoose.model('TempUser', userSchema);
