const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    minimum_order_quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    measurement_unit: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model('Inventory', InventorySchema);
