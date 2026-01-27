const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const cartSchema = new Schema({
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
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      size: {
        type: String,
      },
      priceAtAddTime: {
        type: Number,
      },
    },
  ],
  totalAmount: {
    type: Number,
    default: 0,
  },
});

module.exports = model('carts', cartSchema)