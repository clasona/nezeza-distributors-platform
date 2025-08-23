const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getSellerTransactions,
  getTransactionById,
  getSellerTransactionStats
} = require('../controllers/transactionController');

// All transaction routes require authentication
router.use(authenticateUser);

// Get transaction history for a seller (store)
router.get('/seller/:sellerId', getSellerTransactions);

// Get transaction statistics for a seller
router.get('/seller/:sellerId/stats', getSellerTransactionStats);

// Get specific transaction details
router.get('/:transactionId', getTransactionById);

module.exports = router;
