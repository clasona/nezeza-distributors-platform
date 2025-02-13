const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  create_stripe_connect_account,
  confirmPayment,
  sellerRequestPayOut,
} = require('../controllers/paymentController');

router.post('/create-stripe-connect-account', create_stripe_connect_account);
router.post('/confirm-payment', confirmPayment);
router.post('/request-payout', sellerRequestPayOut);

module.exports = router;
