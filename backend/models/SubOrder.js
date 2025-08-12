const mongoose = require('mongoose');
const validator = require('validator');
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

const SubOrderSchema = new mongoose.Schema(
  {
    fullOrderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    }, // Sub-order total
    taxRate: { type: Number, required: true, default: 0 }, // Seller-defined tax rate
    totalTax: {
      type: Number,
      required: true,
    },
    // Tax specific to this sub-order
    totalShipping: {
      type: Number,
      ///required: true,
    }, // Shipping cost for this manufacturer’s products

    transactionFee: {
      type: Number,
      required: true,
    }, // Transaction fee for the platform (based on percentage)
    sellerStoreId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
      required: true,
    }, // Can be wholesaler or retailer or manufacturer,
    buyerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerStoreId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: true,
        },
        title: { type: String, required: true },
        image: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    fulfillmentStatus: {
      type: String,
      enum: [
        'Pending',
        'Placed',
        'Processing',
        'Awaiting Shipment',
        'Partially Fulfilled',
        'Fulfilled',
        'Awaiting Shipment',
        'Partially Shipped',
        'Shipped',
        'Partially Delivered',
        'Delivered',
        'Partially Cancelled',
        'Cancelled',
      ],
      default: 'Pending',
    },
    trackingInfo: {
      trackingNumber: String,
      labelUrl: String,
      carrier: String,
      trackingUrlProvider: String // e.g., 'USPS', 'FedEx'
    },
    // clientSecret: {
    //   type: String,
    //   required: true,
    // },
    paymentIntentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    transferId: {
      type: String, // Store Stripe transfer ID
      default: null,
    },
    selectedRateId: {
      type: String, // Store the selected shipping rate ID from Shippo
      default: null,
    },
    isPlatformShipping: { type: Boolean, default: false }, // True if platform handles shipping
    platformShippingFee: { type: Number, default: 0 }, // Amount collected by the platform for shipping
    sellerShippingFee: { type: Number, default: 0 }, // Shipping charged by the seller (if applicable)
    shippingFeeRefundable: { type: Boolean, default: true }, // Determines if shipping is refundable
    shippingDetails: shippingSchema, // Embed the shipping sche

    // fulfillmentStatus duplicate removed; only the above definition remains
    refundId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubOrder', SubOrderSchema);
