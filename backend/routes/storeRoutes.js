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
    deactivateStore

} = require('../controllers/storeController')

router.route('/').post(authenticateUser, createStore)
router.
    route('/:id')
    .get(authenticateUser, authorizePermissions('manufacturer','admin','wholesaler', 'retailer'), getStoreDetails)
    .patch(updateStoreDetails)
    .delete(deactivateStore)



module.exports = router;
