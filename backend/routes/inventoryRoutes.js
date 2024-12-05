const express = require('express');
const router = express.Router();
const {
  createInventory,
  updateInventory,
  deleteInventory,
  getAllInventory,
  getSingleInventory,
} = require('../controllers/inventoryController');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router
  .route('/')
  .get(
    authenticateUser,
    authorizePermissions('view_inventory'),
    getAllInventory
  );
router
  .route('/')
  .post(
    authenticateUser,
    authorizePermissions('create_inventory'),
    createInventory
  );
router
  .route('/:id')
  .patch(
    authenticateUser,
    authorizePermissions('update_inventory'),
    updateInventory
  );

router
  .route('/:id')
  .delete(
    authenticateUser,
    authorizePermissions('delete_inventory'),
    deleteInventory
  );
router
  .route('/:id')
  .get(
    authenticateUser,
    authorizePermissions('view_inventory'),
    getSingleInventory
  );

module.exports = router;
