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
  } = require('../controllers/adminController');

// user management routes
  router
  .route('/')
  .get(authenticateUser, authorizePermissions('view_all_users'), getAllUsers);

router.route('/:userId').get(authenticateUser,authorizePermissions('view_user'), getSingleUser)
router.route('/:userId').delete(authenticateUser, authorizePermissions('delete_user'), deleteUser);
router.route('/:userId').patch(authenticateUser, authorizePermissions('edit_user'), updateUser);

// store management routes

// inventory management routes


  module.exports = router;