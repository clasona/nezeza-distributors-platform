const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const StoreApplication = require('../models/StoreApplication');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const { checkPermissions } = require('../utils');

//createApplication
/*
 * Create a new store application.
 * User must be authenticated and have 'owner' role to create a application.
 *
 * @param req - Express request object  - name, description, price, category, image (optional)
 * @param res - Express response object  - created application object
 */
const createStoreApplication = async (req, res, next) => {
  try {
    const { ownerId } = req.params;

    // Validate ownerId and current user
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      throw new CustomError.BadRequestError('Invalid owner ID.');
    }

    if (ownerId !== req.user.userId.toString()) {
      throw new CustomError.UnauthorizedError(
        'You are not authorize to create store application.'
      );
    }

    // Append ownerId as primary contact to the request body
    req.body.primaryContactId = ownerId;

    // Check if the user has a valid storeId
    const user = await User.findById(req.user.userId);
    if (!user || !user.storeId) {
      throw new CustomError.NotFoundError(
        'The store does not exist for current user.'
      );
    }

    // Check if an application already exists for the store
    const existingApplication = await StoreApplication.findOne({
      storeId: user.storeId,
    });
    if (existingApplication) {
      throw new CustomError.BadRequestError(
        'An application for this store already exists.'
      );
    }

    // Append storeId to the request body
    req.body.storeId = user.storeId;

    const application = await StoreApplication.create(req.body);
    res.status(StatusCodes.CREATED).json({ application });
  } catch (error) {
    // Pass error to the global error handler
    next(error);
  }
};

// getApplicationDetails
const getStoreApplicationDetails = async (req, res, next) => {
  // const { storeId, id: storeApplicationId } = req.params;

  try {
    const { id: storeApplicationId } = req.params;

    // Validate applicationId
    if (!mongoose.Types.ObjectId.isValid(storeApplicationId)) {
      throw new CustomError.BadRequestError('Invalid store application ID.');
    }

    // const user = await User.findById(req.user.userId);
    // const store = await Store.findById(req.user.storeId).select('-password');

    // if (!user) {
    //   throw new CustomError.UnauthorizedError(
    //     `No user with id : ${req.user.userId}`
    //   );
    // }

    // if (!store) {
    //   throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
    // }

    // if (store._id.toString() !== user.storeId.toString()) {
    //   throw new CustomError.UnauthorizedError(
    //     'You are not authorized to view this store application details.'
    //   );
    // }

    const application = await StoreApplication.findOne({
      _id: storeApplicationId,
    });

    if (!application) {
      throw new CustomError.NotFoundError(
        `No store application with id : ${storeApplicationId}`
      );
    }

    // Check if the current user is authorized to view the application
    //if we also wanted to check for admin
    // if (req.user.role !== 'admin' && application.primaryContactId.toString() !== req.user.userId.toString()) {
    if (
      application.primaryContactId.toString() !== req.user.userId.toString()
    ) {
      throw new CustomError.UnauthorizedError(
        'You are not authorized to view this store application.'
      );
    }

    res.status(StatusCodes.OK).json({ application });
  } catch (error) {
    // Pass error to the global error handler
    next(error);
  }
};

// updateApplication

// deleteApplication

module.exports = {
  createStoreApplication,
  getStoreApplicationDetails,
};
