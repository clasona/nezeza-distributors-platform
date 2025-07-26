// routes/admin/adminSettingsRoutes.js
const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../../middleware/authentication');

const {
  getAllSettings,
  getSetting,
  updateSetting,
  createSetting,
  deleteSetting,
  bulkUpdateSettings,
  initializeDefaultSettings,
  getSettingHistory,
} = require('../../controllers/admin/adminPlatformSettingsController');

/**
 * @route   GET /api/v1/admin/settings
 * @desc    Get all platform settings
 * @access  Private (Admin only)
 */
router
  .route('/')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getAllSettings
  )
  .post(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    createSetting
  );

/**
 * @route   POST /api/v1/admin/settings/initialize
 * @desc    Initialize default platform settings
 * @access  Private (Admin only)
 */
router
  .route('/initialize')
  .post(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    initializeDefaultSettings
  );

/**
 * @route   PUT /api/v1/admin/settings/bulk
 * @desc    Bulk update multiple settings
 * @access  Private (Admin only)
 */
router
  .route('/bulk')
  .put(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    bulkUpdateSettings
  );

/**
 * @route   GET /api/v1/admin/settings/:key
 * @desc    Get a specific setting by key
 * @access  Private (Admin only)
 */
router
  .route('/:key')
  .get(authenticateUser, authorizePermissions('view_admin_report'), getSetting)
  .put(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    updateSetting
  )
  .delete(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    deleteSetting
  );

/**
 * @route   GET /api/v1/admin/settings/:key/history
 * @desc    Get settings history/audit log
 * @access  Private (Admin only)
 */
router
  .route('/:key/history')
  .get(
    authenticateUser,
    authorizePermissions('view_admin_report'),
    getSettingHistory
  );

module.exports = router;
