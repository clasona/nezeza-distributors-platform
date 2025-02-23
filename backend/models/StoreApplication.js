const mongoose = require('mongoose');
const validator = require('validator');

const BillingInfoSchema = mongoose.Schema({
  routingNumber: { type: String, required: true },
  accountNumber: { type: String, required: true },
  cardholderName: { type: String, required: true },
  expirationDate: { type: String, required: true },
  cvv: { type: Number, required: true },
  billingAddress: {
    type: mongoose.Schema.ObjectId,
    ref: 'Address',
    // required: true, TODO: enable this
  },
});

const VerificationDocsSchema = mongoose.Schema({});

const storeApplicationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      //   required: [true, 'Please provide store name'],
      default: 'Pending',
    },
    primaryContactId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    storeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
      unique: true,
      required: true,
    },
    billingInfo: [BillingInfoSchema],
    // verificationDocs: [VerificationDocsSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreApplication', storeApplicationSchema);

// const storeApplicationSchema = new mongoose.Schema(
//   {
//     status: {
//       type: String,
//       //   required: [true, 'Please provide store name'],
//       default: 'Pending',
//     },
//     storeInfo: {
//       type: mongoose.Schema.ObjectId,
//       ref: 'Store',
//       required: true,
//     },
