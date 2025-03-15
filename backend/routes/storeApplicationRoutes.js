const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createStoreApplication,
  getStoreApplicationDetails,
  approveStoreApplication
} = require('../controllers/storeApplicationController');

router
  .route('/')
  .post(
    createStoreApplication
);
  
router
  .route('/:id')
  // .route('/:storeId/applications/:id')
  .get(
    // authenticateUser,
    // authorizePermissions('view_store_application_details'),
    getStoreApplicationDetails
  );
//   .patch(
//     authenticateUser,
//     authorizePermissions('view_store_details'),
//     updateStoreDetails
//   )
//   .delete(deactivateStore);

router
  .route('/:id/approve')
  // .route('/:storeId/applications/:id')
  .patch(
    // authenticateUser, //TODO: authenticate its the admin and has permissions
    // authorizePermissions('view_store_application_details'),
    approveStoreApplication
  );

module.exports = router;
