const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const StoreApplication = require('../models/StoreApplication');
const { register } = require('../controllers/authController');
const { createStore } = require('../controllers/storeController');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const { checkPermissions } = require('../utils');

//createApplication
/*
 * Create a new store application.
 *
 * @param req - Express request object  - name, description, price, category, image (optional)
 * @param res - Express response object  - created application object
 */
const createStoreApplication = async (req, res, next) => {
  // await StoreApplication.collection.dropIndex('primaryContactInfo.email_1');
  try {
    // TODO: Prevent from the possibility of creating two applications for one store
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
    res.locals.application = application; // used when approving or declining
    // Check if the current user is authorized to view the application
    //if we also wanted to check for admin
    // if (req.user.role !== 'admin' && application.primaryContactId.toString() !== req.user.userId.toString()) {
    // if (
    //   application.primaryContactId.toString() !== req.user.userId.toString()
    // ) {
    //   throw new CustomError.UnauthorizedError(
    //     'You are not authorized to view this store application.'
    //   );
    // }

    // Check if a response has already been sent
    if (!res.skipResponse) {
      res.status(StatusCodes.OK).json({ application });
    } 
  } catch (error) {
    // Pass error to the global error handler
    next(error);
  }
};

//approve application
const approveStoreApplication = async (req, res, next) => {
  const { id: storeApplicationId } = req.params;

  // create primary contact user and store
  try {
    res.skipResponse = true; // to prevent other functions in here from sening response
    await getStoreApplicationDetails(req, res, next);
    const application = res.locals.application;
    if (!application) {
      throw new CustomError.NotFoundError(
        `Could not retrieve application details for id: ${storeApplicationId}`
      );
    }
    const { primaryContactInfo, storeInfo } = application;

    // Create a new request object to pass to register
    const userReq = {
      body: {
        firstName: primaryContactInfo.firstName,
        lastName: primaryContactInfo.lastName,
        email: primaryContactInfo.email,
        password: primaryContactInfo.email, // Using email as a temporary password - TODO: ask use to change later
        storeType: storeInfo.storeType.toLowerCase(),
      },
    };

    await register(userReq, res, next);
    const user = res.locals.user;

    // Create a new request object to pass to createSrore
    const storeReq = {
      body: {
        name: storeInfo.name,
        email: storeInfo.email,
        address: storeInfo.address,
        description: storeInfo.description,
        storeType: storeInfo.storeType.toLowerCase(),
        ownerId: user._id,
        // isActive: storeInfo.isActive, // Activated after stripe?
      },
    };
    await createStore(storeReq, res, next);

    await StoreApplication.findByIdAndUpdate(
      storeApplicationId,
      { status: 'Approved' },
      { new: true }
    );
    res.status(StatusCodes.OK).json({ msg: 'Store application approved' }); // Or whatever response you want to send
  } catch (error) {
    next(error);
  }
};

// updateApplication

// deleteApplication

module.exports = {
  createStoreApplication,
  getStoreApplicationDetails,
  approveStoreApplication,
};
