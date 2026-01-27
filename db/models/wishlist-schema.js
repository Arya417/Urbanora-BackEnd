const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const wishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'products',
        required: true,
      },
    },
  ],
});

module.exports = model('wishlists', wishlistSchema);
