const mongoose = require('mongoose');

const FavoritesItemSchema = mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  }
});

const FavoritesSchema = mongoose.Schema(
  {
    favoritesItems: [FavoritesItemSchema],
    buyerStoreId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
    },
    buyerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Favorites', FavoritesSchema);
