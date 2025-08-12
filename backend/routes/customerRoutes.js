const express = require('express');
const router = express.Router();
const {
  getCustomersForSeller,
  getCustomerById,
} = require('../controllers/customerController');
const { authenticateUser } = require('../middleware/authentication');

// Get all customers for a seller
router.get('/for/:storeId', authenticateUser, getCustomersForSeller);

// Get a single customer by ID
router.get('/:id', authenticateUser, getCustomerById);

// Add more customer-related routes as needed

module.exports = router;
