const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
  createNotification,
  getAllNotifications,
  getSingleNotification,
  updateNotification,
  deleteNotification,
} = require('../controllers/notificationController');

router.route('/').get(authenticateUser,getAllNotifications);

router.route('/:recipientId').post(authenticateUser, createNotification);

router
  .route('/:id')
  .get(getSingleNotification)
  .patch(authenticateUser, updateNotification)
  .delete(authenticateUser, deleteNotification);

module.exports = router;
