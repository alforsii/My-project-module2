const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// in order to use .populate in the route file, you must first have the type for what you will populate as Schema.Types.ObjectId and make sure to ref (reference) the model that it will be searching that ID for in your db collection
// author: {type: Schema.Types.ObjectId, ref: 'User'}
// if your using an array of object ids then it would look like the code below
// messages: {type: [{type: Schema.Types.ObjectId, ref: 'Message'}]}
// notice that when you reference you use the capitalization of the model that it is referencing

const replySchema = new Schema(
  {
    // the user that generated this reply
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    // the reply to be viewed by users
    reply: {
      type: String,
    },
    // the message this reply belongs to (not the reply)
    message: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    // the replies to this reply
    // for now we will not add this to our example app. But if you fork and clone this app maybe you can create a route to do so as practice
    replies: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Reply',
        },
      ],
    },
  },
  { timestamps: true }
);

// const autoPopulateAuthor = next => {
//     this.populate("author");
//     next();
// };

// replySchema.pre("findOne", autoPopulateAuthor).pre("find", autoPopulateAuthor);

const Reply = model('Reply', replySchema);
module.exports = Reply;
