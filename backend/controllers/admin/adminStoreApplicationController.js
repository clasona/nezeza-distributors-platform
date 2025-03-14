const mongoose = require('mongoose');
const StoreApplication = require('../../models/StoreApplication');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');
const path = require('path');
const { checkPermissions } = require('../../utils');

//createApplication ?

//approveApplication

// declineApplication

// getApplicationDetails

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
};
