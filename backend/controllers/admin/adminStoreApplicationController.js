const mongoose = require('mongoose');
const StoreApplication = require('../../models/StoreApplication');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');
const path = require('path');
const { checkPermissions } = require('../../utils');

//createApplication ?

// approveApplication
const approveStoreApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError.BadRequestError('Invalid application ID');
    }

    const application = await StoreApplication.findById(id);
    if (!application) {
      throw new CustomError.NotFoundError('Store application not found');
    }

    // Update application status to approved
    application.status = 'Approved';
    application.updatedAt = new Date();
    await application.save();

    // TODO: Create actual store from application data
    // TODO: Send approval email to applicant
    // TODO: Log admin activity

    res.status(StatusCodes.OK).json({
      msg: 'Store application approved successfully',
      application
    });
  } catch (error) {
    next(error);
  }
};

// declineApplication
const declineStoreApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError.BadRequestError('Invalid application ID');
    }

    const application = await StoreApplication.findById(id);
    if (!application) {
      throw new CustomError.NotFoundError('Store application not found');
    }

    // Update application status to declined
    application.status = 'Declined';
    application.declineReason = reason || 'No reason provided';
    application.updatedAt = new Date();
    await application.save();

    // TODO: Send decline email to applicant
    // TODO: Log admin activity

    res.status(StatusCodes.OK).json({
      msg: 'Store application declined successfully',
      application
    });
  } catch (error) {
    next(error);
  }
};

// getApplicationDetails
const getStoreApplicationDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError.BadRequestError('Invalid application ID');
    }

    const application = await StoreApplication.findById(id)
      .populate('storeInfo')
      .populate('primaryContactInfo');
      
    if (!application) {
      throw new CustomError.NotFoundError('Store application not found');
    }

    res.status(StatusCodes.OK).json({ application });
  } catch (error) {
    next(error);
  }
};

// deleteApplication
const deleteStoreApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError.BadRequestError('Invalid application ID');
    }

    const application = await StoreApplication.findByIdAndDelete(id);
    if (!application) {
      throw new CustomError.NotFoundError('Store application not found');
    }

    // TODO: Log admin activity

    res.status(StatusCodes.OK).json({
      msg: 'Store application deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// getApplications
const getAllStoreApplications = async (req, res, next) => {
  try {
    // Verify admin access
    //   if (req.user.role !== 'admin') {
    //     throw new CustomError.UnauthorizedError(
    //       'Only admins can access this resource.'
    //     );
    //   }

    // Extract query parameters for filtering, sorting, and pagination
    const {
      page = 1,
      limit = 10,
      // offset = 0, // Default offset
      sort = 'createdAt',
      name,
      status,
    } = req.query;

    // Build the query object
    const queryObject = {};
    if (name) {
      queryObject.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }
    if (status) {
      queryObject.status = status; // e.g., 'pending', 'approved', 'rejected'
    }

    // Pagination logic
    const skip = (page - 1) * limit;

    // Execute query with filtering, sorting, and pagination
    const storeApplications = await StoreApplication.find(queryObject)
      .populate('storeInfo')
      .populate('primaryContactInfo') 
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    //  .offset: parseInt(offset),

    // Count total applications for pagination metadata
    const totalApplications = await StoreApplication.countDocuments(
      queryObject
    );

    // Response with applications and pagination metadata
    res.status(StatusCodes.OK).json({
      storeApplications,
      totalApplications,
      totalPages: Math.ceil(totalApplications / limit),
      currentPage: Number(page),
    });
  } catch (errors) {
    next(errors);
  }
};
// updateApplication

// deleteApplication

module.exports = {
  getAllStoreApplications,
  approveStoreApplication,
  declineStoreApplication,
  getStoreApplicationDetails,
  deleteStoreApplication,
};
