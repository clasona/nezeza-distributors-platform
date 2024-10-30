const express = require('express');
const router = express.Router();
const {addProductInventory,
  viewInventory,
} = require('../controllers/inventoryController');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router.route('/inventory').post(authenticateUser, authorizePermissions('create_inventory'), addProductInventory);
router.route('/').get(authenticateUser, authorizePermissions('view_inventory'), viewInventory);

module.exports = router

