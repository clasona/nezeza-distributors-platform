const mongoose = require('mongoose');
const crypto = require('crypto');
const StoreApplication = require('../../models/StoreApplication');
const User = require('../../models/User');
const Store = require('../../models/Store');
const Role = require('../../models/Role');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');
const path = require('path');
const { checkPermissions, createHash } = require('../../utils');
const {
  sendStoreApprovalEmail,
  sendStoreDeclineEmail,
  sendAdminNotificationEmail,
} = require('../../utils/email/storeApprovalEmailUtils');

//createApplication ?

// approveApplication
const approveStoreApplication = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError.BadRequestError('Invalid application ID');
    }

    const application = await StoreApplication.findById(id).session(session);
    if (!application) {
      throw new CustomError.NotFoundError('Store application not found');
    }

    // Check if already processed
    if (application.status !== 'Pending') {
      throw new CustomError.BadRequestError(`Application has already been ${application.status.toLowerCase()}`);
    }

    const { storeInfo, primaryContactInfo, businessInfo } = application;
    const applicantEmail = primaryContactInfo.email;
    
    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: applicantEmail }).session(session);
    if (existingUser) {
      throw new CustomError.BadRequestError('A user account already exists with this email address');
    }

    // Check if store with this email already exists
    const existingStore = await Store.findOne({ email: storeInfo.email }).session(session);
    if (existingStore) {
      throw new CustomError.BadRequestError('A store already exists with this email address');
    }

    // Get roles based on store type
    let roleNames = ['owner'];
    switch (storeInfo.storeType) {
      case 'manufacturing':
        roleNames.push('manufacturer');
        break;
      case 'wholesale':
        roleNames.push('wholesaler');
        break;
      case 'retail':
        roleNames.push('retailer');
        break;
      default:
        throw new CustomError.BadRequestError('Invalid store type');
    }

    const roles = await Role.find({ name: { $in: roleNames } }).session(session);
    if (!roles || roles.length === 0) {
      throw new CustomError.InternalServerError('Required roles not found in system');
    }

    // Generate password setup token
    const passwordSetupToken = crypto.randomBytes(40).toString('hex');
    const passwordTokenExpirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user account without password initially
    // User will set password during setup process
    const user = await User.create([{
      firstName: primaryContactInfo.firstName,
      lastName: primaryContactInfo.lastName,
      email: applicantEmail,
      phone: primaryContactInfo.phone || '',
      countryOfCitizenship: primaryContactInfo.citizenshipCountry || '',
      dateOfBirth: primaryContactInfo.dateOfBirth || '',
      roles: roles.map(role => role._id),
      isVerified: true, // Approved applications are considered verified
      verified: new Date(),
      passwordToken: createHash(passwordSetupToken),
      passwordTokenExpirationDate,
      provider: 'pending_setup' // Custom provider to bypass password requirement
    }], { session });

    const createdUser = user[0];

    // Create store from application data
    const store = await Store.create([{
      name: storeInfo.name,
      email: storeInfo.email,
      description: storeInfo.description || 'Welcome to our store!',
      ownerId: createdUser._id,
      storeType: storeInfo.storeType,
      businessType: businessInfo?.businessType || 'individual',
      address: {
        street1: storeInfo.address.street || storeInfo.address.street1,
        street2: storeInfo.address.street2,
        city: storeInfo.address.city,
        state: storeInfo.address.state,
        zip: storeInfo.address.zip,
        country: storeInfo.address.country,
        phone: storeInfo.address.phone
      },
      members: [createdUser._id],
      isActive: false // Store needs to be activated after setup
    }], { session });

    const createdStore = store[0];

    // Link user to store
    createdUser.storeId = createdStore._id;
    await createdUser.save({ session });

    // Update application status
    application.status = 'Approved';
    application.approvedAt = new Date();
    application.processedBy = req.user?.userId || 'admin';
    application.updatedAt = new Date();
    await application.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Send approval email with password setup instructions
    const origin = process.env.CLIENT_URL;
    try {
      await sendStoreApprovalEmail({
        email: applicantEmail,
        firstName: primaryContactInfo.firstName,
        lastName: primaryContactInfo.lastName,
        storeName: storeInfo.name,
        storeType: storeInfo.storeType,
        passwordSetupToken,
        origin
      });

      // Send admin notification
      await sendAdminNotificationEmail({
        action: 'approved',
        storeName: storeInfo.name,
        applicantEmail,
        processedBy: req.user?.email || 'admin'
      });

      console.log(`Store application approved and emails sent for: ${applicantEmail}`);
    } catch (emailError) {
      console.error('Error sending approval emails:', emailError);
      // Don't fail the request if email fails
    }

    res.status(StatusCodes.OK).json({
      msg: 'Store application approved successfully. User account and store created.',
      application: {
        ...application.toObject(),
        userId: createdUser._id,
        storeId: createdStore._id
      }
    });

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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

    if (!reason || reason.trim() === '') {
      throw new CustomError.BadRequestError('Decline reason is required');
    }

    const application = await StoreApplication.findById(id);
    if (!application) {
      throw new CustomError.NotFoundError('Store application not found');
    }

    // Check if already processed
    if (application.status !== 'Pending') {
      throw new CustomError.BadRequestError(`Application has already been ${application.status.toLowerCase()}`);
    }

    const { storeInfo, primaryContactInfo } = application;
    const applicantEmail = primaryContactInfo.email;

    // Update application status to declined
    application.status = 'Declined';
    application.declineReason = reason.trim();
    application.declinedAt = new Date();
    application.processedBy = req.user?.userId || 'admin';
    application.updatedAt = new Date();
    await application.save();

    // Send decline email to applicant
    try {
      await sendStoreDeclineEmail({
        email: applicantEmail,
        firstName: primaryContactInfo.firstName,
        lastName: primaryContactInfo.lastName,
        storeName: storeInfo.name,
        reason: reason.trim()
      });

      // Send admin notification
      await sendAdminNotificationEmail({
        action: 'declined',
        storeName: storeInfo.name,
        applicantEmail,
        processedBy: req.user?.email || 'admin'
      });

      console.log(`Store application declined and emails sent for: ${applicantEmail}`);
    } catch (emailError) {
      console.error('Error sending decline emails:', emailError);
      // Don't fail the request if email fails
    }

    res.status(StatusCodes.OK).json({
      msg: 'Store application declined successfully. Applicant has been notified.',
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

// getStoreApplicationsAnalytics
const getStoreApplicationsAnalytics = async (req, res, next) => {
  try {
    // Get total counts by status
    const statusCounts = await StoreApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total applications
    const totalApplications = await StoreApplication.countDocuments();

    // Get applications by month for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyApplications = await StoreApplication.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get applications by store type
    const storeTypeBreakdown = await StoreApplication.aggregate([
      {
        $group: {
          _id: '$storeInfo.storeType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplications = await StoreApplication.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 }).limit(5).select('_id status storeInfo.name primaryContactInfo.firstName primaryContactInfo.lastName createdAt');

    // Get applications by country (citizenship)
    const countryBreakdown = await StoreApplication.aggregate([
      {
        $group: {
          _id: '$primaryContactInfo.citizenshipCountry',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Calculate average processing time (for approved/declined applications)
    const processingTimeData = await StoreApplication.aggregate([
      {
        $match: {
          status: { $in: ['Approved', 'Declined'] }
        }
      },
      {
        $project: {
          status: 1,
          processingTime: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: '$status',
          avgProcessingTime: { $avg: '$processingTime' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format the status counts into a more usable structure
    const formattedStatusCounts = {
      total: totalApplications,
      pending: 0,
      approved: 0,
      declined: 0
    };

    statusCounts.forEach(item => {
      const status = item._id.toLowerCase();
      formattedStatusCounts[status] = item.count;
    });

    res.status(StatusCodes.OK).json({
      analytics: {
        statusCounts: formattedStatusCounts,
        monthlyTrend: monthlyApplications,
        storeTypeBreakdown,
        recentApplications,
        countryBreakdown,
        processingTimeData,
        totalApplications
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStoreApplications,
  approveStoreApplication,
  declineStoreApplication,
  getStoreApplicationDetails,
  deleteStoreApplication,
  getStoreApplicationsAnalytics,
};
