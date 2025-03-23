const mongoose = require('mongoose');
const validator = require('validator');
//const AddressSchema = require('./AddressSchema');

const PrimaryContactInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  citizenshipCountry: {
    type: String,
    required: true,
  },
  birthCountry: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  residenceAddress: {
    type: mongoose.Schema.ObjectId,
    ref: 'Address',
    required: true,
  },
});

const StoreInfoSchema = new mongoose.Schema({
  storeType: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: Number, // Changed to Number to match your input type
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  // storeLogo: {
  //   type: Object, // Store the Cloudinary resource object
  //   required: true,
  // },
  address: {
    type: mongoose.Schema.ObjectId,
    ref: 'Address',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const VerificationDocsSchema = new mongoose.Schema({
  primaryContactIdentityDocument: {
    type: String,
    required: true,
  },
  businessDocument: {
    type: String,
    required: true,
  },
});
const storeApplicationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Declined'],
      default: 'Pending',
    },
    primaryContactInfo: { type: PrimaryContactInfoSchema },
    storeInfo: { type: StoreInfoSchema },
    verificationDocs: { type: VerificationDocsSchema },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreApplication', storeApplicationSchema);
