const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  rating: { type: Schema.Types.ObjectId, ref: 'reviews' },
  image: [{ type: String }],
  category: { type: String, required: true },
  subCategory: { type: String },
  audience: {
    type: String,
    enum: ['Men', 'Women', 'Kids', 'All'],
  },
  attributes: {
    type: Schema.Types.Mixed,
    default: {},
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
});

const Product = model('products', productSchema);

module.exports = Product;
