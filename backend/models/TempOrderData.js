const mongoose = require('mongoose');

const TempOrderDataSchema = new mongoose.Schema({
  orderItems: {
    type: Array,
    required: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  billingAddress: {
    type: Object,
    required: false,
  },
  selectedShippingOptions: {
    type: Object,
    required: true,
  },
  buyerId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shippingTotal: {
    type: Number,
    required: true,
  },
  totalTax: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerFirstName: {
    type: String,
    required: true,
  },
  feeBreakdown: {
    type: Object,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Expires after 1 hour (3600 seconds)
  }
});

module.exports = mongoose.model('TempOrderData', TempOrderDataSchema);
