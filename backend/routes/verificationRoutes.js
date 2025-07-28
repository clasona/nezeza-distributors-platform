const express = require('express');
const router = express.Router();

const {
  sendEmailVerification,
  verifyEmailCode,
  sendSMSVerification,
  verifySMSCode,
} = require('../controllers/verificationController');

// Email verification routes
router.post('/send-email', sendEmailVerification);
router.post('/verify-email', verifyEmailCode);

// SMS verification routes
router.post('/send-sms', sendSMSVerification);
router.post('/verify-sms', verifySMSCode);

module.exports = router;
