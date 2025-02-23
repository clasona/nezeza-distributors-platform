const Notification = require('../models/Notification');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');

const createNotification = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user.userId;

    // Fetch user once instead of twice
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError.UnauthorizedError(
        `User with ID ${userId} not found.`
      );
    }

    if (!user.storeId) {
      throw new CustomError.UnauthorizedError('User store does not exist.');
    }

    // Attach sender ID (store) and recipient ID
    const notificationData = {
      ...req.body,
      senderId: userId,
      recipientId: recipientId,
    };

    // Create and save the notification
    const notification = await Notification.create(notificationData);

    res.status(StatusCodes.CREATED).json({ notification });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Something went wrong' });
  }
};

// Get a single notification by ID
const getSingleNotification = async (req, res) => {
  try {
    const { id: notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new CustomError.NotFoundError(
        `No notification found with ID: ${notificationId}`
      );
    }

    res.status(StatusCodes.OK).json({ notification });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Something went wrong' });
  }
};

// Get all notifications for the logged-in user
const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError.UnauthorizedError(
        `User with ID ${userId} not found.`
      );
    }

    const notifications = await Notification.find({
      recipientId: userId,
    }).sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ notifications, count: notifications.length });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Something went wrong' });
  }
};

// Update a notification (e.g., mark as read)
const updateNotification = async (req, res) => {
  try {
    const { id: notificationId } = req.params;

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedNotification) {
      throw new CustomError.NotFoundError(
        `No notification found with ID: ${notificationId}`
      );
    }

    res.status(StatusCodes.OK).json({ notification: updatedNotification });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Something went wrong' });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { id: notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      throw new CustomError.NotFoundError(
        `No notification found with ID: ${notificationId}`
      );
    }

    res
      .status(StatusCodes.OK)
      .json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Something went wrong' });
  }
};

module.exports = {
  createNotification,
  getAllNotifications,
  getSingleNotification,
  updateNotification,
  deleteNotification,
};
