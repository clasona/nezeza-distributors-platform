const mongoose = require('mongoose');

const SingleOrderItemSchema = mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
  sellerStoreId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: true,
  }, // Can be wholesaler or retailer or manufacturer
});

const OrderSchema = mongoose.Schema(
  {
    // TODO: add transaction fee field // converse with nezeza
    total: {
      type: Number,
      required: true,
    },
    totalTax: {
      type: Number,
      required: true,
    }, // Sum of sub-order taxes
    totalShipping: {
      type: Number,
      required: true,
    }, // Sum of sub-order shipping costs
    transactionFee: {
      type: Number,
      required: true,
    },
    orderItems: [SingleOrderItemSchema],
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    fulfillmentStatus: {
      type: String,
      enum: [
        'Pending',
        'Partially Fulfilled',
        'Fulfilled',
        'Partially Shipped',
        'Shipped',
        'Partially Delivered',
        'Delivered',
        'Partially Cancelled',
        'Cancelled',
      ],
      default: 'Pending',
    },
    buyerStoreId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    }, // Can be wholesaler or retailer or customer
    shippingAddress: {
      type: String,
      required: true,
    },
    billingAddress: {
      type: String,
      required: true,
    },
    subOrders: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'SubOrder', // Link to each sub-order
      },
    ],
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'paypal'],
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
    sellerPayoutStatus: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
