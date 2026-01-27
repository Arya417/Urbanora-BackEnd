const { Schema, model } = require('mongoose');

const addressSchema = Schema({
  houseName: {
    type: String,
    required: true,
  },
  street: {
    type: String,
   
  },

  landmark: {
    type: String,
   
  },

  city: {
    type: String,
    required: true,
  },

  district: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  pincode: {
    type: String,
    required: true,
  },
});

const userSchema = Schema({
  name: { type: String, required: true, trim: true },
  email: { type: Schema.Types.Mixed, required: true, trim: true, unique: true },
  address: [addressSchema],

  password: {
    type: Schema.Types.Mixed,
    required: true,
    trim: true,
    unique: true,
  },
});

const User = model('users', userSchema);

module.exports = User;


