const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: String,
  firstName: String,
  lastName: String,
  email: String,
  userInSession: { type: Schema.Types.ObjectId, ref: 'User' },
  password: String,
  path: { type: String, default: '/images/default-img.png' },
  imageName: String,
  friends: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }] },
  // the boards that have been created by the user
  userChatBoards: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
      },
    ],
  },
});

module.exports = model('User', UserSchema);
