const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  getNotificationById,
  getAllNotifications,
} = require('../controllers/admin/notificationController');
router
  .route('/')
  .get(
    authenticateUser,
    authorizePermissions('view_notification'),
    getAllNotifications
  );
router
  .route('/:id')
  .get(
    authenticateUser,
    authorizePermissions('view_notification'),
    getNotificationById
  );
module.exports = router;
