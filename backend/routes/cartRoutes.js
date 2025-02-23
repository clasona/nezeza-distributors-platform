const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
  getCart,
  updateCart,
  clearCart,
} = require('../controllers/cartController');

router
  .route('/')
  .get(authenticateUser, getCart)
  .patch(authenticateUser, updateCart)
  .delete(authenticateUser, clearCart);

// router
//   .route('/:id')
//   .patch(authenticateUser, updateCart)
//   .delete(authenticateUser, clearCart);

module.exports = router;
