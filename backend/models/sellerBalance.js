const mongoose = require('mongoose');

const SellerBalanceSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    pendingBalance: { type: Number, default: 0 }, // Funds waiting for admin approval
    availableBalance: { type: Number, default: 0 }, // Funds ready for withdrawal
  },
  { timestamps: true }
);

module.exports = mongoose.model('SellerBalance', SellerBalanceSchema);
