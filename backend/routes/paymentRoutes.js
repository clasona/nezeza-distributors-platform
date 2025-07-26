const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  webhookHandler,
  createStripeConnectAccount,
  getStripeConnectAccount,
  hasActiveStripeAccount,
  confirmPayment,
  processRefund,
  refundTest,
  sellerRequestPayOut,
    getSellerRevenue,
  getUserPaymentMethods,
  confirmWithSavedCard,
  createCustomerSession,
  createSubscription,
  cancelSubscription,
  createPaymentIntent,
} = require('../controllers/paymentController');

router.post('/create-stripe-connect-account', createStripeConnectAccount);
router.get('/get-stripe-connect-account/:id', getStripeConnectAccount);
router.get(
  '/has-active-stripe-account/:id',
  hasActiveStripeAccount
);
router.get('/has-active-stripe-account/by-email/:email', hasActiveStripeAccount);
router.post('/seller-subscription', createSubscription);
router.post('/cancel-subscription', cancelSubscription);
router.post('/confirm-with-saved-card', authenticateUser, confirmWithSavedCard);
router.get('/user-payment-methods', authenticateUser, getUserPaymentMethods);
router.post('/confirm-payment', confirmPayment);
router.post('/refund', processRefund);
router.post('/refund', refundTest);
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

router
  .route('/create-payment-intent')
  .post(authenticateUser, createPaymentIntent);

router.route('/refund').post(processRefund).get(refundTest);

module.exports = router;
