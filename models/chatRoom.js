// models/ChatRoom.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderProfile: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatRoomSchema = new mongoose.Schema({
  roomID: {
    type: String,
    required: true,
    unique: true
  },
  messages: [messageSchema]
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
