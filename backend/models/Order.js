const mongoose = require('mongoose');
const addressSchema = require('./Address');

const shippingSchema = new mongoose.Schema(
  {
    rateId: {
      type: String,
      required: false, // Make optional since it's set when rate is selected
    },
    labelUrl: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          return !v || validator.isURL(v); // Allow empty or valid URL
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    carrier: {
      type: String,
      required: false, // Make optional until label is created
      enum: ['DHL', 'FedEx', 'UPS', 'USPS', 'Other', 'TBD'], // Add 'TBD' as valid option
      default: 'TBD',
    },
    trackingNumber: {
      type: String,
      required: false, // Make optional until label is created
      default: '',
    },
    trackingUrl: {
      type: String,
      required: false,
      default: '',
    },
    estimatedDeliveryDate: {
      type: Date,
      required: false,
    },
    shipmentStatus: {
      type: String,
      required: true,
      enum: ['Awaiting Shipment', 'Pending', 'In Transit', 'Delivered', 'Exception', 'Cancelled'],
      default: 'Pending',
    },
    shippingAddress: addressSchema, // Add shippingAddress field
    shippingNotes: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const SingleOrderItemSchema = mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  taxRate: { type: Number, required: true, default: 0 }, // Seller-defined tax rate
  taxAmount: { type: Number, required: true },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
  sellerStoreId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: true,
  },
  sellerStoreAddress: addressSchema,
  addedToInventory: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: [
      'Active',
      'Cancelled',
      'Returned',
      'Partially Cancelled',
      'Partially Returned',
    ],
    default: 'Active',
  },
  cancelledQuantity: {
    type: Number,
    default: 0,
  }, // Tracks how many of this item have been cancelled
});

const OrderSchema = mongoose.Schema(
  {
    // TODO: add transaction fee field // converse with vesoko
    totalAmount: {
      type: Number,
      required: true,
    },
    totalTax: {
      type: Number,
      required: true,
    }, // Sum of sub-order taxes
    totalShipping: {
      type: Number,
      //required: true,
    }, // Sum of sub-order shipping costs
    transactionFee: {
      type: Number,
      //required: true,
    },
    processingFee: {
      type: Number,
      //required: true,
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
        'Placed',
        'Processing',
        'Partially Fulfilled',
        'Fulfilled',
        'Awaiting Shipment',
        'Partially Shipped',
        'Shipped',
        'Partially Delivered',
        'Delivered',
        'Partially Cancelled',
        'Cancelled',
        'Partially Returned',
        'Returned',
        'Archived',
      ],
      default: 'Pending',
    },
    buyerStoreId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
      required: true,
    },
    // buyerStoreId: {
    //   type: mongoose.Schema.ObjectId,
    //   required: true,
    //   refPath: 'buyerStoreType', // Determines which model to reference
    // },
    // buyerStoreType: {
    //   type: String,
    //   required: true,
    //   enum: ['Store', 'User'], // Must be either 'Store' or 'User'
    // },
    buyerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    }, // Can be wholesaler or retailer or customer
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
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
    // clientSecret: {
    //   type: String,
    //   required: true,
    // },
    paymentIntentId: {
      type: String,
    },
    sellerPayoutStatus: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
    refundId: {
      type: String,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: true,
    },
    shippingDetails: shippingSchema, // Add shipping details for each item

  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
