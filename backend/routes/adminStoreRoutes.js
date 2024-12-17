const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getStoreDetails,
  updateStoreDetails,
  getAllStores,
  activateStore,
  deactivateStore,
} = require('../controllers/admin/adminStoreController');

router
  .route('/')
  .get(
    authenticateUser,
    authorizePermissions('view_store_details'),
    getAllStores
  );

router
  .route('/:storeId/activate')
  .patch(
    authenticateUser,
    authorizePermissions('activate_stores'),
    activateStore
  );
router
  .route('/:storeId/deactivate')
  .patch(
    authenticateUser,
    authorizePermissions('deactivate_stores'),
    deactivateStore
  );
router
  .route('/:storeId')
  .patch(
    authenticateUser,
    authorizePermissions('update_store_details'),
    updateStoreDetails
  );
router
  .route('/:storeId')
  .get(
    authenticateUser,
    authorizePermissions('view_store_details'),
    getStoreDetails
  );

module.exports = router;
