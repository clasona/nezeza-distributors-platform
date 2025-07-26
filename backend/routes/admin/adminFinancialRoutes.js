// routes/admin/adminFinancialRoutes.js
const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../../middleware/authentication');

const {
  getFinancialOverview,
  getSellerBalances,
  processPayout,
  getRefundManagement,
  generateFinancialReport,
} = require('../../controllers/admin/adminFinancialController');

/**
 * @route   GET /api/v1/admin/financial/overview
 * @desc    Get platform financial overview
 * @access  Private (Admin only)
 */
router
  .route('/overview')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getFinancialOverview
  );

/**
 * @route   GET /api/v1/admin/financial/seller-balances
 * @desc    Get all seller balances with filtering
 * @access  Private (Admin only)
 */
router
  .route('/seller-balances')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getSellerBalances
  );

/**
 * @route   POST /api/v1/admin/financial/process-payout
 * @desc    Process payout to seller
 * @access  Private (Admin only)
 */
router
  .route('/process-payout')
  .post(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    processPayout
  );

/**
 * @route   GET /api/v1/admin/financial/refunds
 * @desc    Get refund management data
 * @access  Private (Admin only)
 */
router
  .route('/refunds')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getRefundManagement
  );

/**
 * @route   GET /api/v1/admin/financial/reports/:reportType
 * @desc    Generate financial report
 * @access  Private (Admin only)
 */
router
  .route('/reports/:reportType')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    generateFinancialReport
  );

module.exports = router;
