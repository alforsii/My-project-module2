const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const friendsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Friend', friendsSchema);
