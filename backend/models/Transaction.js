const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Wholesaler/Retailer/Customer
    payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Manufacturer/Wholesaler/Retailer
    amount: Number,
    currency: String,
    status: { type: String, enum: ['pending', 'completed', 'failed'] },
    createdAt: { type: Date, default: Date.now }
  });
  
  const Transaction = mongoose.model('Transaction', transactionSchema);
  