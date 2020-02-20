const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const chatsSchema = new Schema(
  {
    // the user that created the Chat board
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    // the user that generated this message
    senderID: {
      type: Schema.Types.ObjectId,
      ref: 'User', //the author will be the user to whom sending message
    },
    receiverID: {
      type: Schema.Types.ObjectId,
      ref: 'User', //the author will be the user to whom sending message
    },
    messages: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Message',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Chat', chatsSchema);
