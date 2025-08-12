const express = require('express');
const router = express.Router();

const {
  setupPassword,
  verifySetupToken,
  resendPasswordSetup,
} = require('../controllers/passwordSetupController');

// POST /api/v1/password-setup/setup - Set up password for approved applicants
router.post('/setup', setupPassword);

// GET /api/v1/password-setup/verify-token - Verify password setup token
router.get('/verify-token', verifySetupToken);

// POST /api/v1/password-setup/resend - Resend password setup email
router.post('/resend', resendPasswordSetup);

module.exports = router;
