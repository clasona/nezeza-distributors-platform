const mongoose = require('mongoose');

const SubOrderSchema = new mongoose.Schema({
    fullOrderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: true,
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },  // Sub-order total
    totalTax: { 
        type: Number, 
        required: true 
    },     
    // Tax specific to this sub-order
    totalShipping: { 
        type: Number, 
        required: true 
    },     // Shipping cost for this manufacturer’s products
    
    transactionFee: { 
        type: Number, 
        required: true 
    },  // Transaction fee for the platform (based on percentage)
    sellerStoreId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true,
      },// Can be wholesaler or retailer or manufacturer,
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
        name: { type: String, 
            required: true 
        },
        image: { 
            type: String, 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true 
        },
        price: { 
            type: Number, 
            required: true 
        },
      }
    ],
    clientSecret: {
        type: String,
        required: true,
      },
      paymentIntentId: {
        type: String,
      },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    
  },{ timestamps: true });
  
  module.exports = mongoose.model('SubOrder', SubOrderSchema);
  