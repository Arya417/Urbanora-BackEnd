const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: [
    {
      productId: String,
      name: String,
      image: Array,
      price: Number,
      quantity: Number,
      size: String,
    },
  ],
  totalAmount: Number,
  expectedDelivery: String,
  deliveryText: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);
