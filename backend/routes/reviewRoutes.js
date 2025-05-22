const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getReviewsByEntityTypeAndId,
} = require('../controllers/reviewController');

router.route('/').get(getAllReviews).post(
  authenticateUser,
  // authorizePermissions('create_review'),
  createReview
);
router
  .route('/:id')
  .get(getReviewById)
  .patch(
    authenticateUser,
    // authorizePermissions('update_review'),
    updateReview
  )
  .delete(
    authenticateUser,
    // authorizePermissions('delete_review'),
    deleteReview
  );

// Get reviews for an Apartment or Car or Neighborhood
router.route('/:type/:id').get(getReviewsByEntityTypeAndId);

module.exports = router;
