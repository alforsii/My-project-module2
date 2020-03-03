const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const imagesSchema = new Schema(
  {
    name: String,
    description: String,
    path: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    album: { type: Schema.Types.ObjectId, ref: 'Album' },
    comments: { type: [{ type: Schema.Types.ObjectId, ref: 'Comment' }] },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Image', imagesSchema);
