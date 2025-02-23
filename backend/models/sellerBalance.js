const mongoose = require('mongoose');

const SellerBalanceSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalSales: { type: Number, default: 0 }, // Total amount from all sales
    commissionDeducted: { type: Number, default: 0 }, // Platform commission deducted
    netRevenue: { type: Number, default: 0 }, // Earnings after commission deduction
    pendingBalance: { type: Number, default: 0 }, // Funds waiting for admin approval
    availableBalance: { type: Number, default: 0 }, // Funds ready for withdrawa
  },
  { timestamps: true }
);

module.exports = mongoose.model('SellerBalance', SellerBalanceSchema);
