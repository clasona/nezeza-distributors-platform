const mongoose = require('mongoose');
const validator = require('validator');

const shippingSchema = new mongoose.Schema(
  {
    carrier: {
      type: String,
      required: true,
      enum: ['DHL', 'FedEx', 'UPS', 'USPS', 'Other'], // Limit to known carriers
      default: 'Other',
    },
    trackingNumber: {
      type: String,
      required: true,
    },
    trackingUrl: {
      type: String,
      required: false,
    },
    estimatedDelivery: {
      type: Date,
      required: false,
    },
    shipmentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'In Transit', 'Delivered', 'Exception', 'Cancelled'],
      default: 'Pending',
    },
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
    // clientSecret: {
    //   type: String,
    //   required: true,
    // },
    paymentIntentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    transferId: {
      type: String, // Store Stripe transfer ID
      default: null,
    },
    isPlatformShipping: { type: Boolean, default: false }, // True if platform handles shipping
    platformShippingFee: { type: Number, default: 0 }, // Amount collected by the platform for shipping
    sellerShippingFee: { type: Number, default: 0 }, // Shipping charged by the seller (if applicable)
    shippingFeeRefundable: { type: Boolean, default: true }, // Determines if shipping is refundable
    shippingDetails: shippingSchema, // Embed the shipping sche

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
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubOrder', SubOrderSchema);
