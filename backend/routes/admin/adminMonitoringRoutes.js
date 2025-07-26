// routes/admin/adminMonitoringRoutes.js
const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../../middleware/authentication');

const {
  getSystemHealth,
  getPerformanceMetrics,
  getErrorLogs,
  logSystemError,
  getActivityStats,
  performMaintenance,
  getSystemAlerts,
} = require('../../controllers/admin/adminSystemMonitoringController');

/**
 * @route   GET /api/v1/admin/monitoring/health
 * @desc    Get system health overview
 * @access  Private (Admin only)
 */
router
  .route('/health')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getSystemHealth
  );

/**
 * @route   GET /api/v1/admin/monitoring/performance
 * @desc    Get performance metrics
 * @access  Private (Admin only)
 */
router
  .route('/performance')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getPerformanceMetrics
  );

/**
 * @route   GET /api/v1/admin/monitoring/errors
 * @desc    Get error logs with filtering and pagination
 * @access  Private (Admin only)
 */
router
  .route('/errors')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getErrorLogs
  );

/**
 * @route   POST /api/v1/admin/monitoring/log-error
 * @desc    Log a system error
 * @access  Private (Admin only)
 */
router
  .route('/log-error')
  .post(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    logSystemError
  );

/**
 * @route   GET /api/v1/admin/monitoring/activity
 * @desc    Get platform activity statistics
 * @access  Private (Admin only)
 */
router
  .route('/activity')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getActivityStats
  );

/**
 * @route   POST /api/v1/admin/monitoring/maintenance
 * @desc    Clear old logs and perform maintenance
 * @access  Private (Admin only)
 */
router
  .route('/maintenance')
  .post(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    performMaintenance
  );

/**
 * @route   GET /api/v1/admin/monitoring/alerts
 * @desc    Get real-time system alerts
 * @access  Private (Admin only)
 */
router
  .route('/alerts')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getSystemAlerts
  );

module.exports = router;
