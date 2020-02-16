const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const friendsSchema = new Schema(
  {
    friendId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Friend', friendsSchema);
