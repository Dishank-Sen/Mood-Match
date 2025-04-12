const mongoose = require('mongoose');
const message = require('./chatRoom');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
      },
    senderName: {
        type: String,
        required: true,
      },
      message:{
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
})

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  messages: [messageSchema]
});

module.exports = mongoose.model('Notification', notificationSchema);
