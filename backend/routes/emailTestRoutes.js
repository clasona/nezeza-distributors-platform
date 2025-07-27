const express = require('express');
const router = express.Router();

const {
  testBasicEmail,
  testBuyerPaymentEmail,
  testSellerOrderEmail
} = require('../controllers/emailTestController');

// Test routes for email functionality
router.post('/test-basic', testBasicEmail);
router.post('/test-buyer-payment', testBuyerPaymentEmail);
router.post('/test-seller-order', testSellerOrderEmail);

module.exports = router;
