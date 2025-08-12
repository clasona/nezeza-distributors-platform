const express = require('express');
const router = express.Router();

const {
  validateShippingAddress,
  validateBillingAddress,
  quickValidateAddress,
  normalizeAddressFormat
} = require('../controllers/addressController');

// Address validation routes
router.post('/validate/shipping', validateShippingAddress);
router.post('/validate/billing', validateBillingAddress);
router.post('/validate/quick', quickValidateAddress);
router.post('/normalize', normalizeAddressFormat);

module.exports = router;
