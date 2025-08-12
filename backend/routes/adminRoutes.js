const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} = require('../controllers/adminController'); //TODO: change this to the admin/ folder structure

const {
  getAllStoreApplications,
  approveStoreApplication,
  declineStoreApplication,
  getStoreApplicationDetails,
  deleteStoreApplication,
  getStoreApplicationsAnalytics
} = require('../controllers/admin/adminStoreApplicationController');

// user management routes
router
  .route('/users')
  .get(authenticateUser, authorizePermissions('view_all_users'), getAllUsers);

router
  .route('/users/:userId')
  .get(authenticateUser, authorizePermissions('view_user'), getSingleUser);
router
  .route('/users/:userId')
  .delete(authenticateUser, authorizePermissions('delete_user'), deleteUser);
router
  .route('/users/:userId')
  .patch(authenticateUser, authorizePermissions('edit_user'), updateUser);

// store management routes
router
  .route('/store-applications')
  .get(
    authenticateUser,
    authorizePermissions('view_all_store_applications'),
    getAllStoreApplications
  );

router
  .route('/store-applications/:id')
  .get(
    authenticateUser,
    authorizePermissions('view_store_application_details'),
    getStoreApplicationDetails
  ).delete(
    authenticateUser,
    authorizePermissions('delete_store_application'),
    deleteStoreApplication
  );

  router
  .route('/store-applications/:id/approve')
  .patch(
    // authenticateUser, //TODO: authenticate its the admin and has permissions
    // authorizePermissions('view_store_application_details'),
    approveStoreApplication
  );

  router
  .route('/store-applications/:id/decline')
  .patch(
    // authenticateUser, //TODO: authenticate its the admin and has permissions
    // authorizePermissions('view_store_application_details'),
    declineStoreApplication
  );

// store applications analytics routes
router
  .route('/store-applications/analytics/overview')
  .get(
    authenticateUser,
    authorizePermissions('view_all_store_applications'),
    getStoreApplicationsAnalytics
  );

// inventory management routes

module.exports = router;
