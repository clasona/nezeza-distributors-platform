const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../../middleware/authentication');

const {
  getAllStoreApplications,
  approveStoreApplication,
  declineStoreApplication,
  getStoreApplicationDetails,
  deleteStoreApplication,
  getStoreApplicationsAnalytics,
} = require('../../controllers/admin/adminStoreApplicationController');

// Get all store applications with filtering, sorting, and pagination
router
  .route('/')
  .get(
    authenticateUser,
    authorizePermissions('admin'), // YVES TO TAKE A LOOK - Update permissions as needed
    getAllStoreApplications
  );

// Get specific store application details
router
  .route('/:id')
  .get(
    authenticateUser,
    authorizePermissions('admin'), // YVES TO TAKE A LOOK - Update permissions as needed
    getStoreApplicationDetails
  ) 
  .delete(
    authenticateUser,
    authorizePermissions('admin'), // YVES TO TAKE A LOOK - Update permissions as needed
    deleteStoreApplication
  );

// Approve store application
router
  .route('/:id/approve')
  .patch(
    authenticateUser,
    authorizePermissions('admin'), // YVES TO TAKE A LOOK - Update permissions as needed
    approveStoreApplication
  );

// Decline store application
router
  .route('/:id/decline')
  .patch(
    authenticateUser,
    authorizePermissions('admin'), // YVES TO TAKE A LOOK - Update permissions as needed
    declineStoreApplication
  );

// Get store applications analytics
router
  .route('/analytics/overview')
  .get(
    authenticateUser,
    authorizePermissions('admin'), // YVES TO TAKE A LOOK - Update permissions as needed
    getStoreApplicationsAnalytics
  );

module.exports = router;
