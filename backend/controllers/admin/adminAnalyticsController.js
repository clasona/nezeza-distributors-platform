// controllers/admin/adminAnalyticsController.js
const Order = require('../../models/Order');
const SubOrder = require('../../models/SubOrder');
const User = require('../../models/User');
const Store = require('../../models/Store');
const Product = require('../../models/Product');
const SellerBalance = require('../../models/sellerBalance');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');

/**
 * Get comprehensive platform dashboard analytics
 * @route GET /api/v1/admin/analytics/dashboard
 */
const getPlatformDashboard = async (req, res) => {
  try {
    const { period = '90d' } = req.query;

    // Calculate date ranges
    const now = new Date();
    let startDate;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Revenue metrics
    const revenueMetrics = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'Paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
          totalTax: { $sum: '$totalTax' },
          totalShipping: { $sum: '$totalShipping' },
        },
      },
    ]);

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$fulfillmentStatus',
          count: { $sum: 1 },
          value: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Top performing stores
    const topStores = await SubOrder.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'Paid' } },
      {
        $group: {
          _id: '$sellerStoreId',
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'stores',
          localField: '_id',
          foreignField: '_id',
          as: 'store',
        },
      },
      { $unwind: '$store' },
    ]);

    // User growth metrics
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Product category performance
    const categoryPerformance = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'Paid' } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSales: {
            $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] },
          },
          totalQuantity: { $sum: '$orderItems.quantity' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // Platform commission earnings
    const commissionEarnings = await SellerBalance.aggregate([
      {
        $group: {
          _id: null,
          totalCommission: { $sum: '$commissionDeducted' },
          totalPaidOut: {
            $sum: { $subtract: ['$totalSales', '$pendingBalance'] },
          },
        },
      },
    ]);

    // Geographic distribution (based on shipping addresses)
    const geographicDistribution = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'addresses',
          localField: 'shippingAddress',
          foreignField: '_id',
          as: 'address',
        },
      },
      { $unwind: '$address' },
      {
        $group: {
          _id: '$address.state',
          orderCount: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 20 },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      period,
      data: {
        revenue: revenueMetrics[0] || {},
        orderStatusBreakdown,
        topStores,
        userGrowth,
        categoryPerformance,
        commissionEarnings: commissionEarnings[0] || {},
        geographicDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching platform dashboard:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch platform analytics',
      error: error.message,
    });
  }
};

/**
 * Get detailed sales analytics
 * @route GET /api/v1/admin/analytics/sales
 */
const getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, storeType, period = 'daily' } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end },
      paymentStatus: 'Paid',
    };

    // Sales trend over time
    let groupBy;
    switch (period) {
      case 'hourly':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' },
        };
        break;
      case 'daily':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        };
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
        break;
    }

    const salesTrend = await Order.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
    ]);

    // Top products by revenue
    const topProducts = await Order.aggregate([
      { $match: matchCriteria },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] },
          },
          totalQuantity: { $sum: '$orderItems.quantity' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
    ]);

    // Sales by store type
    const salesByStoreType = await SubOrder.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'stores',
          localField: 'sellerStoreId',
          foreignField: '_id',
          as: 'store',
        },
      },
      { $unwind: '$store' },
      ...(storeType ? [{ $match: { 'store.businessType': storeType } }] : []),
      {
        $group: {
          _id: '$store.storeType',
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // Payment method analytics
    const paymentMethodStats = await Order.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' },
        },
      },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        salesTrend,
        topProducts,
        salesByStoreType,
        paymentMethodStats,
        period: {
          start,
          end,
          period,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch sales analytics',
      error: error.message,
    });
  }
};

/**
 * Get user analytics and metrics
 * @route GET /api/v1/admin/analytics/users
 */
const getUserAnalytics = async (req, res) => {
  try {
    const { period = '30d', userType } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    // User registration trends
    const userRegistrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'roles',
          localField: 'roles',
          foreignField: '_id',
          as: 'roleDetails',
        },
      },
      { $unwind: '$roleDetails' },
      {
        $group: {
          _id: {
            date: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            role: '$roleDetails.name',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date.year': 1, '_id.date.month': 1, '_id.date.day': 1 } },
    ]);

    // User activity metrics
    const userActivityMetrics = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'buyerId',
          as: 'orders',
        },
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'roles',
          foreignField: '_id',
          as: 'roleDetails',
        },
      },
      { $unwind: '$roleDetails' },
      {
        $group: {
          _id: '$roleDetails.name',
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [{ $gt: [{ $size: '$orders' }, 0] }, 1, 0],
            },
          },
          avgOrdersPerUser: { $avg: { $size: '$orders' } },
        },
      },
    ]);

    // Top customers by order value
    const topCustomers = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'Paid' } },
      {
        $group: {
          _id: '$buyerId',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ]);

    // Store performance by owner
    const storePerformance = await Store.aggregate([
      {
        $lookup: {
          from: 'suborders',
          localField: '_id',
          foreignField: 'sellerStoreId',
          as: 'subOrders',
        },
      },
      {
        $addFields: {
          paidSubOrders: {
            $filter: {
              input: '$subOrders',
              cond: {
                $and: [
                  { $eq: ['$$this.paymentStatus', 'Paid'] },
                  { $gte: ['$$this.createdAt', startDate] },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          businessType: 1,
          isActive: 1,
          createdAt: 1,
          totalRevenue: { $sum: '$paidSubOrders.totalAmount' },
          orderCount: { $size: '$paidSubOrders' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 20 },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        userRegistrationTrend,
        userActivityMetrics,
        topCustomers,
        storePerformance,
      },
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch user analytics',
      error: error.message,
    });
  }
};

/**
 * Export analytics data
 * @route GET /api/v1/admin/analytics/export
 * NOTE: SKIP FOR MVP
 */
const exportAnalyticsData = async (req, res) => {
  try {
    const { type, startDate, endDate, format = 'json' } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let data;

    switch (type) {
      case 'orders':
        data = await Order.find({
          createdAt: { $gte: start, $lte: end },
        }).populate('buyerId orderItems.product');
        break;

      case 'users':
        data = await User.find({
          createdAt: { $gte: start, $lte: end },
        }).populate('roles storeId');
        break;

      case 'products':
        data = await Product.find({
          createdAt: { $gte: start, $lte: end },
        }).populate('storeId');
        break;

      case 'stores':
        data = await Store.find({
          createdAt: { $gte: start, $lte: end },
        });
        break;

      default:
        throw new CustomError.BadRequestError('Invalid export type');
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${type}_export_${Date.now()}.csv`
      );
      return res.send(csv);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      type,
      period: { start, end },
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to export analytics data',
      error: error.message,
    });
  }
};
//NOTE: SKIP FOR MVP
// Helper function to convert data to CSV
const convertToCSV = (data) => {
  if (!data.length) return '';

  const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
  const csv = [
    headers.join(','),
    ...data.map((item) => {
      const obj = item.toObject ? item.toObject() : item;
      return headers
        .map((header) => {
          const value = obj[header];
          return typeof value === 'string'
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(',');
    }),
  ].join('\n');

  return csv;
};

module.exports = {
  getPlatformDashboard,
  getSalesAnalytics,
  getUserAnalytics,
  exportAnalyticsData,
};
