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
    required: false, // Made optional as we're not requesting it for now
  },
  birthCountry: {
    type: String,
    required: false, // Made optional as we're not requesting it for now
  },
  dob: {
    type: Date,
    required: true,
  },
  // residenceAddress: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'Address',
  //   required: true,
  // },
  // In PrimaryContactInfoSchema - Made optional as we're not requesting it for now
  residenceAddress: {
    street: { type: String, required: false },
    street1: { type: String }, // For Shippo API compatibility
    street2: { type: String }, // For Shippo API compatibility
    city: { type: String, required: false },
    state: { type: String, required: false },
    zip: { type: String, required: false },
    country: { type: String, required: false },
    phone: { type: String }, // For Shippo API compatibility
  },
});

const StoreInfoSchema = new mongoose.Schema({
  storeType: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String, // Changed to String to support EIN format with dashes
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
  logo: {
    type: String, // Store the Cloudinary secure URL
    required: false,
  },
  // address: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'Address',
  //   required: true,
  // },
  // In PrimaryContactInfoSchema
  address: {
    name: { type: String, required: false },
    street: { type: String, required: true },
    street1: { type: String }, // For Shippo API compatibility
    street2: { type: String }, // For Shippo API compatibility
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String }, // For Shippo API compatibility
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
