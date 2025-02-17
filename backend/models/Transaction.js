const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    grossAmount: Number, // Total before commission
    netAmount: Number, // Amount sent to seller
    commission: Number, // Platform's cut
    stripeTransferId: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
