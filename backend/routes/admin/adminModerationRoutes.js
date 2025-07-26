// routes/admin/adminModerationRoutes.js
const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../../middleware/authentication');

const {
  getPendingProducts,
  updateProductStatus,
  bulkUpdateProducts,
  getFlaggedReviews,
  moderateReview,
  getModerationDashboard,
  getProductModerationDetails,
  flagContent,
} = require('../../controllers/admin/adminContentModerationController');

/**
 * @route   GET /api/v1/admin/moderation/dashboard
 * @desc    Get content moderation dashboard
 * @access  Private (Admin only)
 */
router
  .route('/dashboard')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getModerationDashboard
  );

/**
 * @route   GET /api/v1/admin/moderation/products/pending
 * @desc    Get products pending approval
 * @access  Private (Admin only)
 */
router
  .route('/products/pending')
  .get(
    authenticateUser,
    authorizePermissions('approve_product'),
    getPendingProducts
  );

/**
 * @route   PUT /api/v1/admin/moderation/products/:productId/status
 * @desc    Approve or reject a product
 * @access  Private (Admin only)
 */
router
  .route('/products/:productId/status')
  .put(
    authenticateUser,
    authorizePermissions('approve_product'),
    updateProductStatus
  );

/**
 * @route   PUT /api/v1/admin/moderation/products/bulk-update
 * @desc    Bulk approve/reject products
 * @access  Private (Admin only)
 */
router
  .route('/products/bulk-update')
  .put(
    authenticateUser,
    authorizePermissions('approve_product'),
    bulkUpdateProducts
  );

/**
 * @route   GET /api/v1/admin/moderation/products/:productId/details
 * @desc    Get detailed product for moderation review
 * @access  Private (Admin only)
 */
router
  .route('/products/:productId/details')
  .get(
    authenticateUser,
    authorizePermissions('view_product'),
    getProductModerationDetails
  );

/**
 * @route   GET /api/v1/admin/moderation/reviews/flagged
 * @desc    Get flagged reviews that need moderation
 * @access  Private (Admin only)
 */
router
  .route('/reviews/flagged')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getFlaggedReviews
  );

/**
 * @route   PUT /api/v1/admin/moderation/reviews/:reviewId/moderate
 * @desc    Moderate a review (approve, flag, or delete)
 * @access  Private (Admin only)
 */
router
  .route('/reviews/:reviewId/moderate')
  .put(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    moderateReview
  );

/**
 * @route   POST /api/v1/admin/moderation/flag-content
 * @desc    Flag content for further review
 * @access  Private (Admin only)
 */
router
  .route('/flag-content')
  .post(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    flagContent
  );
module.exports = router;
