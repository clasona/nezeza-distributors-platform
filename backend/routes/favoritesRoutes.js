const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
  getFavorites,
  updateFavorites,
  clearFavorites,
} = require('../controllers/favoritesController');

router
  .route('/')
  .get(authenticateUser, getFavorites)
  .patch(authenticateUser, updateFavorites)
  .delete(authenticateUser, clearFavorites);

// router
//   .route('/:id')
//   .patch(authenticateUser, updateFavorites)
//   .delete(authenticateUser, clearFavorites);

module.exports = router;
