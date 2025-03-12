const mongoose = require('mongoose');
const validator = require('validator');
const AddressSchema = require('./AddressSchema');

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
  residenceAddress: { type: AddressSchema, required: true },
});

const StoreInfoSchema = new mongoose.Schema({
  storeType: {
    type: String,
    required: true,
  },
  storeRegistrationNumber: {
    type: Number, // Changed to Number to match your input type
    required: true,
  },
  storeName: {
    type: String,
    required: true,
  },
  storeCategory: {
    type: String,
    required: true,
  },
  storeDescription: {
    type: String,
    required: true,
  },
  storeEmail: {
    type: String,
    required: true,
  },
  storePhone: {
    type: String,
    required: true,
  },
  // storeLogo: {
  //   type: Object, // Store the Cloudinary resource object
  //   required: true,
  // },
  storeAddress: { type: AddressSchema, required: true },
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
      default: 'Pending',
    },
    // primaryContactInfo: { type: PrimaryContactInfoSchema },
    // storeInfo: { type: StoreInfoSchema},
    verificationDocs:  { type: VerificationDocsSchema },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreApplication', storeApplicationSchema);
