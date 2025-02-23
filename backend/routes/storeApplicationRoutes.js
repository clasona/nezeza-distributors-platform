const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createStoreApplication,
  getStoreApplicationDetails,
} = require('../controllers/storeApplicationController');

router
  .route('/:ownerId/applications')
  .post(
    [authenticateUser, authorizePermissions('create_store_application')],
    createStoreApplication
);
  
router
  .route('/applications/:id')
  // .route('/:storeId/applications/:id')
  .get(
    authenticateUser,
    authorizePermissions('view_store_application_details'),
    getStoreApplicationDetails
  );
//   .patch(
//     authenticateUser,
//     authorizePermissions('view_store_details'),
//     updateStoreDetails
//   )
//   .delete(deactivateStore);

module.exports = router;
