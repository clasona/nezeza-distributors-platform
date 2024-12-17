const Store = require('../../models/Store');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');

// Controller: Get Notification by ID
const getNotificationById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user.userId).populate('roles');
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });
  if (!isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Unauthorized to view store details'
    );
  }
  const notification = await Notification.findById(id);

  if (!notification) {
    throw new CustomError.NotFoundError(
      `No notification found with id : ${id}`
    );
  }

  res.status(StatusCodes.OK).json({
    message: 'Notification fetched successfully',
    data: notification,
  });
};

const getAllNotifications = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('roles');
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });
  if (!isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Unauthorized to view store details'
    );
  }
  const notification = await Notification.find({});

  if (!notification || notification.length === 0) {
    throw new CustomError.NotFoundError(`No notifications found.`);
  }

  res.status(StatusCodes.OK).json({
    message: 'Notifications fetched successfully',
    data: notification,
  });
};

module.exports = {
  getNotificationById,
  getAllNotifications,
};
