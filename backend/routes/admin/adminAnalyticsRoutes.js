// routes/admin/adminAnalyticsRoutes.js
const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../../middleware/authentication');

const {
  getPlatformDashboard,
  getSalesAnalytics,
  getUserAnalytics,
  exportAnalyticsData,
} = require('../../controllers/admin/adminAnalyticsController');

/**
 * @route   GET /api/v1/admin/analytics/dashboard
 * @desc    Get comprehensive platform dashboard analytics
 * @access  Private (Admin only)
 */
router
  .route('/dashboard')
  .get(
    authenticateUser,
    authorizePermissions('view_all_reports'),
    getPlatformDashboard
  );

/**
 * @route   GET /api/v1/admin/analytics/sales
 * @desc    Get detailed sales analytics
 * @access  Private (Admin only)
 */
router
  .route('/sales')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getSalesAnalytics
  );

/**
 * @route   GET /api/v1/admin/analytics/users
 * @desc    Get user analytics and metrics
 * @access  Private (Admin only)
 */
router
  .route('/users')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getUserAnalytics
  );

/**
 * @route   GET /api/v1/admin/analytics/export
 * @desc    Export analytics data
 * @access  Private (Admin only)
 */
router
  .route('/export')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    exportAnalyticsData
  );

module.exports = router;
