const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const chatsSchema = new Schema(
  {
    name: String,
    message: String,
    content: String,
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Chat', chatsSchema);
