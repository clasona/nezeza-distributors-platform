const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const addressSchema = require('./Address'); // Assuming you have an Address schema

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    // minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: [function () {
      return this.provider === 'credentials';
    }, 'Please provide last name'],
    // minlength: 3,
    maxlength: 50,
    default: '',
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

  password: {
    type: String,
    required: [function () {
      return this.provider === 'credentials';
    }, 'Please provide password'],
    minlength: 6,
  },
  previousPasswords: {
    type: [String],
    default: [],
  }, // Array to store old password hashes

  roles: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Role', // Link to the Role schema
      required: true,
    },
  ],
  image: {
    type: String,
    // default: '/uploads/defaultUserImage.png',
  },
  storeId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  }, // Link user to store
  // NEW FIELDS
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: Date,
  passwordToken: {
    type: String,
  },
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationDate: {
    type: Date,
  },
  stripeAccountId: {
    type: String,
    // required: true,
  },

  address: addressSchema, // Embedded Address schema for user address

  // Optional: required for store register primary contact
  phone: {
    type: String,
    // required: [true, 'Please provide email'],
    // validate: {
    //   validator: validator.isEmail,
    //   message: 'Please provide valid email',
    // },
  },
  countryOfCitizenship: {
    type: String,
    // required: [true, 'Please provide email'],
  },
  // countryOfBirth: {
  //   type: String,
  //   // required: [true, 'Please provide email'],
  // },
  dateOfBirth: {
    type: String,
    // required: [true, 'Please provide email'],
  },
  residenceAddress: {
    type: mongoose.Schema.ObjectId,
    ref: 'Address',
  },
  provider: {
    type: String,
    enum: ['credentials', 'google', 'facebook', 'apple'],
    default: 'credentials',
  },
});



UserSchema.pre('save', async function () {
  // console.log(this.modifiedPaths());
  // console.log(this.isModified('name'));
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
