const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  path: { type: String, default: '/images/default-img.png' },
  imageName: String,
  friends: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }] },
});

module.exports = model('User', UserSchema);
