const Store = require('../../models/Store');
const User = require('../../models/User');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');
const gracePeriodService = require('../../services/gracePeriodService');
const { sendStoreActivationWelcomeEmail } = require('../../utils/email/storeActivationEmailUtils');
const mongoose = require('mongoose');

const getStoreDetails = async (req, res) => {
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
  const { storeId } = req.params;
  //console.log(user.roles);
  const store = await Store.findById(storeId).select('-password');
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ store });
};

const getAllStores = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('roles');
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });
  if (!isAdmin) {
    throw new CustomError.UnauthorizedError('Unauthorized to view stores');
  }
  const { storeId } = req.params;
  //console.log(user.roles);
  const stores = await Store.find({}).select('-password');
  if (!stores) {
    throw new CustomError.NotFoundError(`No store found.`);
  }
  res.status(StatusCodes.OK).json({ stores });
};

const updateStoreDetails = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('roles');
  const { storeId } = req.params;
  const { email, storeName, address, description } = req.body;
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });

  if (!isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Unauthorized to update the store details'
    );
  }
  const store = await Store.findById(storeId).select('-password');
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${storeId}`);
  }

  if (storeName) store.email = email;
  if (address) store.address = address;
  if (description) store.description = description;
  if (email) store.storeName = storeName;

  await store.save();

  res.status(StatusCodes.OK).json({ store: store });
};

const activateStore = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('roles');
  const { storeId } = req.params;
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });

  if (!isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Unauthorized to activate the store'
    );
  }
  
  // Check if store exists and is not already active
  const existingStore = await Store.findById(storeId);
  if (!existingStore) {
    throw new CustomError.NotFoundError(`No store with id : ${storeId}`);
  }
  
  const wasAlreadyActive = existingStore.isActive;
  
  const store = await Store.findByIdAndUpdate(
    storeId,
    { isActive: true },
    { new: true }
  );

  // Initialize grace period only if store wasn't already active
  if (!wasAlreadyActive) {
    try {
      await gracePeriodService.initializeStoreGracePeriod(storeId);
      console.log(`Grace period initialized for newly activated store: ${store.name}`);
    } catch (gracePeriodError) {
      console.error('Error initializing grace period:', gracePeriodError);
      // Don't fail the activation if grace period initialization fails
    }
  }

  res.status(StatusCodes.OK).json({ 
    store: store,
    message: wasAlreadyActive ? 'Store was already active' : 'Store activated and grace period initialized'
  });
};

const deactivateStore = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('roles');
  const { storeId } = req.params;
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });

  if (!isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Unauthorized to deactivate the store.'
    );
  }
  const store = await Store.findByIdAndUpdate(
    storeId,
    { isActive: false },
    { new: true }
  );

  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${storeId}`);
  }

  res.status(StatusCodes.OK).json({ store: store });
};

// Helper function to check admin permissions
const checkAdminPermissions = async (userId) => {
  const user = await User.findById(userId).populate('roles');
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
  const isAdmin = user.roles.find((role) => role.name === 'admin');
  if (!isAdmin) {
    throw new CustomError.UnauthorizedError('Unauthorized to access this resource');
  }
  return user;
};

// Suspend store (temporary deactivation)
const suspendStore = async (req, res) => {
  await checkAdminPermissions(req.user.userId);
  const { storeId } = req.params;
  const { reason } = req.body;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
  }

  const updatedStore = await Store.findByIdAndUpdate(
    storeId,
    { 
      isActive: false,
      suspensionReason: reason,
      suspendedAt: new Date()
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({ 
    store: updatedStore,
    message: 'Store suspended successfully'
  });
};

// Unsuspend store
const unsuspendStore = async (req, res) => {
  await checkAdminPermissions(req.user.userId);
  const { storeId } = req.params;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
  }

  const updatedStore = await Store.findByIdAndUpdate(
    storeId,
    { 
      isActive: true,
      $unset: { suspensionReason: 1, suspendedAt: 1 }
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({ 
    store: updatedStore,
    message: 'Store unsuspended successfully'
  });
};

// Delete store (soft delete)
const deleteStore = async (req, res) => {
  await checkAdminPermissions(req.user.userId);
  const { storeId } = req.params;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
  }

  // Soft delete - mark as deleted but keep data
  const deletedStore = await Store.findByIdAndUpdate(
    storeId,
    { 
      isActive: false,
      isDeleted: true,
      deletedAt: new Date()
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({ 
    message: 'Store deleted successfully',
    store: deletedStore
  });
};

// Get store analytics
const getStoreAnalytics = async (req, res) => {
  await checkAdminPermissions(req.user.userId);
  const { storeId } = req.params;
  const { startDate, endDate } = req.query;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
  }

  // Date range for analytics
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Get orders analytics
  const ordersAnalytics = await Order.aggregate([
    { $match: { storeId: new mongoose.Types.ObjectId(storeId), ...dateFilter } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'completed'] }, 1, 0] }
        },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get products count
  const productsCount = await Product.countDocuments({ storeId });

  // Get monthly revenue trend
  const monthlyRevenue = await Order.aggregate([
    { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  const analytics = {
    store: {
      id: store._id,
      name: store.name,
      isActive: store.isActive
    },
    summary: ordersAnalytics[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      completedOrders: 0,
      pendingOrders: 0
    },
    productsCount,
    monthlyRevenue
  };

  res.status(StatusCodes.OK).json({ analytics });
};

// Get store grace period information
const getStoreGracePeriodInfo = async (req, res) => {
  await checkAdminPermissions(req.user.userId);
  const { storeId } = req.params;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
  }

  const gracePeriodInfo = {
    storeId: store._id,
    storeName: store.name,
    gracePeriodStart: store.gracePeriodStart,
    gracePeriodEnd: store.gracePeriodEnd,
    gracePeriodNotificationSent: store.gracePeriodNotificationSent,
    platformFeesActive: store.platformFeesActive,
    isInGracePeriod: store.gracePeriodEnd && new Date() < store.gracePeriodEnd,
    gracePeriodDays: process.env.PLATFORM_FEE_GRACE_PERIOD_DAYS || 60
  };

  res.status(StatusCodes.OK).json({ gracePeriod: gracePeriodInfo });
};

// Update store grace period
const updateStoreGracePeriod = async (req, res) => {
  await checkAdminPermissions(req.user.userId);
  const { storeId } = req.params;
  const { extendDays, resetGracePeriod } = req.body;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
  }

  let updatedStore;

  if (resetGracePeriod) {
    // Reset grace period to full duration
    await gracePeriodService.initializeStoreGracePeriod(storeId);
    updatedStore = await Store.findById(storeId);
  } else if (extendDays) {
    // Extend current grace period
    const currentEnd = store.gracePeriodEnd || new Date();
    const newEnd = new Date(currentEnd.getTime() + (extendDays * 24 * 60 * 60 * 1000));
    
    updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { 
        gracePeriodEnd: newEnd,
        platformFeesActive: false,
        gracePeriodNotificationSent: false
      },
      { new: true }
    );
  } else {
    throw new CustomError.BadRequestError('Please specify either extendDays or resetGracePeriod');
  }

  res.status(StatusCodes.OK).json({ 
    store: updatedStore,
    message: resetGracePeriod ? 'Grace period reset successfully' : `Grace period extended by ${extendDays} days`
  });
};

// Get store financial information
const getStoreFinancials = async (req, res) => {
  await checkAdminPermissions(req.user.userId);
  const { storeId } = req.params;
  const { startDate, endDate } = req.query;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
  }

  // Date range for financials
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Get financial data from orders
  const financialData = await Order.aggregate([
    { $match: { storeId: new mongoose.Types.ObjectId(storeId), ...dateFilter } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalPlatformFees: { $sum: '$platformFee' },
        totalStripeFees: { $sum: '$stripeFee' },
        netEarnings: { $sum: { $subtract: ['$total', { $add: ['$platformFee', '$stripeFee'] }] } },
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  const financials = financialData[0] || {
    totalRevenue: 0,
    totalPlatformFees: 0,
    totalStripeFees: 0,
    netEarnings: 0,
    totalOrders: 0
  };

  // Add grace period info
  financials.gracePeriodInfo = {
    isInGracePeriod: store.gracePeriodEnd && new Date() < store.gracePeriodEnd,
    gracePeriodStart: store.gracePeriodStart,
    gracePeriodEnd: store.gracePeriodEnd,
    platformFeesActive: store.platformFeesActive
  };

  res.status(StatusCodes.OK).json({ financials });
};

// Get store orders
const getStoreOrders = async (req, res) => {
  await checkAdminPermissions(req.user.userId);
  const { storeId } = req.params;
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
  }

  // Build filter
  const filter = { storeId };
  if (status) filter.orderStatus = status;
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const skip = (page - 1) * limit;
  
  const orders = await Order.find(filter)
    .populate('userId', 'firstName lastName email')
    .populate('items.productId', 'name price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalOrders = await Order.countDocuments(filter);

  res.status(StatusCodes.OK).json({ 
    orders,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      hasNext: skip + orders.length < totalOrders,
      hasPrev: page > 1
    }
  });
};

// Get store products
const getStoreProducts = async (req, res) => {
  await checkAdminPermissions(req.user.userId);
  const { storeId } = req.params;
  const { page = 1, limit = 10, category, status } = req.query;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
  }

  // Build filter
  const filter = { storeId };
  if (category) filter.category = category;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalProducts = await Product.countDocuments(filter);

  res.status(StatusCodes.OK).json({ 
    products,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      hasNext: skip + products.length < totalProducts,
      hasPrev: page > 1
    }
  });
};

// Get store users (owner and any associated users)
const getStoreUsers = async (req, res) => {
  await checkAdminPermissions(req.user.userId);
  const { storeId } = req.params;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
  }

  // Find users associated with this store
  const users = await User.find({ storeId })
    .populate('roles', 'name')
    .select('-password -passwordToken -previousPasswords');

  res.status(StatusCodes.OK).json({ 
    users,
    storeInfo: {
      id: store._id,
      name: store.name,
      isActive: store.isActive
    }
  });
};

module.exports = {
  getStoreDetails,
  getAllStores,
  updateStoreDetails,
  activateStore,
  deactivateStore,
  getStoreAnalytics,
  getStoreGracePeriodInfo,
  updateStoreGracePeriod,
  getStoreFinancials,
  suspendStore,
  unsuspendStore,
  deleteStore,
  getStoreOrders,
  getStoreProducts,
  getStoreUsers,
};
