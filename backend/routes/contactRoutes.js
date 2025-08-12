const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/contactController');

router.post('/send-message', sendContactMessage);

module.exports = router;
