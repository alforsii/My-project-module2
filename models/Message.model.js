const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// in order to use .populate in the route file, you must first have the type for what you will populate as Schema.Types.ObjectId and make sure to ref (reference) the model that it will be searching that ID for in your db collection
// author: {type: Schema.Types.ObjectId, ref: 'User'}
// if your using an array of object ids then it would look like the code below
// messages: {type: [{type: Schema.Types.ObjectId, ref: 'Message'}]}
// notice that when you reference you use the capitalization of the model that it is referencing

const messageSchema = new Schema(
  {
    // the user that generated this message
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiverID: {
      type: Schema.Types.ObjectId,
      ref: 'User', //the author will be the user to whom sending message
    },
    sender: String,
    receiver: String,
    // the message to be viewed by users
    message: {
      type: String,
    },
    // the message board that this message belongs to
    messageBoard: {
      type: Schema.Types.ObjectId,
      ref: 'Chat', //my message Board will be the User id to whom current user sending message
    },
  },
  { timestamps: true }
);

const Message = model('Message', messageSchema);
module.exports = Message;
