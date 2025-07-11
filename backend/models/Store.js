const mongoose = require('mongoose');
const validator = require('validator');
const addressSchema = require('./Address'); 

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide store name'],
      default: 'My Store',
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide valid email',
      },
    },
    description: {
      type: String,
      required: [true, 'Please provide store description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
      default: 'Welcome to our store!',
    },
    ownerId: {
      // Store Owner (Creator)
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    storeType: {
      type: String,
      enum: ['manufacturing', 'wholesale', 'retail', 'admin'],
      required: true,
    },
    businessType: {
      type: String,
      enum: ['individual', 'company'],
      // required: true,
    },

    address: addressSchema,
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Users (members) that belong to this store
        //For example, a wholesaler might invite sales agents, managers, etc
      },
    ],
    isActive: {
      type: Boolean,
      default: false, // Store is active or not
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
