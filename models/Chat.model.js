const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const chatsSchema = new Schema(
  {
    // the user that created the Chat board
    users: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    // the user that generated this message
    sender: String,
    receiver: String,

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
