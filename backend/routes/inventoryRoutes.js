const express = require('express');
const router = express.Router();
const {
  addProductInventory,
  viewInventory,
  getInventory,
} = require('../controllers/inventoryController');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router
  .route('/')
  .post(
    authenticateUser,
    authorizePermissions('create_inventory'),
    addProductInventory
  );
router
  .route('/')
  .get(authenticateUser, authorizePermissions('view_inventory'), getInventory);

module.exports = router;
