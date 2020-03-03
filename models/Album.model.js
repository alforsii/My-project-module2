const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const albumsSchema = new Schema(
  {
    name: String,
    images: { type: [{ type: Schema.Types.ObjectId, ref: 'Image' }] },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Album', albumsSchema);
