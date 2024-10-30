const mongoose = require('mongoose')
//TODOs: 
const inventorySchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    maxlength: [1000, 'Description can not be more than 1000 characters'],
  },
  image: {
    type: String,
    default: '/uploads/example.jpeg',
  },
    owner: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'User' 
    },
    buyerStoreId: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'Store',
    },
    seller: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'User',
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product', 
      required: true,  // Link to central product in central market place
    },
      // Link to central product in central market place
    stock: {
      type: Number,
      required: true,
      default: 0,  // Initial stock level
    },
    
    price: {
      type: Number,
      required: true, // Wholesaler/retailer sets their own price
      default: 0,  // Initial price level
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    availability: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    lastUpdated: { 
      type: Date, 
      default: Date.now 
    },
  }, { timestamps: true });
  

  module.exports = mongoose.model('Inventory',inventorySchema);