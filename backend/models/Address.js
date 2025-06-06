const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  street1: {
    type: String,
    // required: true,
  },
  street2: {
    type: String,
  },
  city: {
    type: String,
    // required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    // required: true,
  },
  country: {
    type: String,
    // required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    // required: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
});

module.exports = addressSchema;