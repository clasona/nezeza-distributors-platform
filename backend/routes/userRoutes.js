const express = require('express');
const router = express.Router();
//const {checkPermission} = require('../utils')
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  getUserByEmail,
  updateUser,
  updateUserPassword,
} = require('../controllers/userController');



router.route('/me').get(authenticateUser, showCurrentUser);
router.route('/:userId').patch(authenticateUser, updateUser);
router.route('/:userId/password').patch(authenticateUser, updateUserPassword);

router.route('/:userId').get(authenticateUser, getSingleUser);
router.route('/by/:email').get(getUserByEmail);


module.exports = router;
