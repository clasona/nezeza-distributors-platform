// This is for the cancelled orders that require or have been refunded

const mongoose = require('mongoose');

const RefundSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: true,
    },
    // This is for non-full order cacnellations and refunds
    subOrderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'SubOrder',
      // required: true,
    },
    orderItemId: {
      type: mongoose.Schema.ObjectId,
      // No 'ref' here if orderItem is an embedded subdocument within Order
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
    refundAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
    },
    stripeRefundId: {
      type: String,
      unique: true,
      sparse: true,
    },
    refundReason: {
      type: String,
      default: 'Other',
    },
    // Add sellerStoreId and buyerId
    sellerStoreId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    refundDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    notes: {
      type: String,
    },
    quantityRefunded: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Refund', RefundSchema);