const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  webhookHandler,
  create_stripe_connect_account,
  confirmPayment,
  processRefund,
  refundTest,
  sellerRequestPayOut,
  getSellerRevenue,
  createCustomerSession,
} = require('../controllers/paymentController');

router.post('/create-stripe-connect-account', create_stripe_connect_account);
router.post('/confirm-payment', confirmPayment);
router.post('/refund', processRefund);
router.get('/refun', refundTest);
router.post('/request-payout', sellerRequestPayOut);
router.get('/seller-revenue/:sellerId', authenticateUser, getSellerRevenue);
router
  .route('/create-customer-session')
  .post(authenticateUser, createCustomerSession);

// Add the webhook route (IMPORTANT: No authentication here!)
// Match the raw body to content type application/json
// If you are using Express v4 - v4.16 you need to use body-parser, not express, to retrieve the request body
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // Important: Raw body parsing
  webhookHandler
);

module.exports = router;
