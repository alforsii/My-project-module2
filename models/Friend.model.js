const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const friendsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    username: String,
    firstName: String,
    lastName: String,
    email: String,
    path: { type: String, default: '/images/default-img.png' },
    imageName: String,
  },
  {
    timestamps: true,
  }
);

module.exports = model('Friend', friendsSchema);
