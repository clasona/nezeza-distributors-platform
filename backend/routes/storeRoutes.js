const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createStore,
  getStoreDetails,
  updateStoreDetails,
  deactivateStore,
} = require('../controllers/storeController');

router.route('/').post(authenticateUser, createStore);
router
  .route('/:id')
  .get(
    // authenticateUser,
    // authorizePermissions('view_store_details'),
    getStoreDetails
  )
  .patch(
    authenticateUser,
    authorizePermissions('view_store_details'),
    updateStoreDetails
  )
  .delete(deactivateStore);

module.exports = router;
