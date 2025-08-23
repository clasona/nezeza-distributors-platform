const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Store = require('../models/Store');
const Order = require('../models/Order');
const User = require('../models/User');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

/**
 * Get transaction history for a seller
 * GET /transaction/seller/:sellerId
 */
const getSellerTransactions = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;
    
    // Validate sellerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new CustomError.BadRequestError('Invalid seller ID format');
    }

    // Authorization: Check if user owns the store with this sellerId
    const sellerStore = await Store.findById(sellerId);
    if (!sellerStore) {
      throw new CustomError.NotFoundError('Store not found');
    }

    // Check if authenticated user owns this store
    if (sellerStore.ownerId.toString() !== req.user.userId) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to view transactions for this store'
      );
    }

    // Build query filters
    const query = { seller: sellerStore.ownerId };
    console.log('Querying transactions for seller:', sellerStore.ownerId);
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const parsedLimit = parseInt(limit);

    console.log('Transaction query:', query);
    // Fetch transactions with populated data
    const transactions = await Transaction.find(query)
      .populate({
        path: 'order',
        select: 'orderNumber createdAt buyerId totalAmount',
        populate: {
          path: 'buyerId',
          select: 'firstName lastName email'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

      console.log(`Fetched ${transactions.length} transactions`);

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(query);

    // Calculate summary statistics
    const summaryPipeline = [
      { $match: { seller: new mongoose.Types.ObjectId(sellerStore.ownerId) } },
      {
        $group: {
          _id: null,
          totalGrossAmount: { $sum: '$grossAmount' },
          totalNetAmount: { $sum: '$netAmount' },
          totalCommission: { $sum: '$commission' },
          totalTransactions: { $sum: 1 },
          statusBreakdown: {
            $push: '$status'
          }
        }
      }
    ];

    const summaryResult = await Transaction.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
      totalGrossAmount: 0,
      totalNetAmount: 0,
      totalCommission: 0,
      totalTransactions: 0,
      statusBreakdown: []
    };

    // Count status breakdown
    const statusCounts = {};
    if (summary.statusBreakdown) {
      summary.statusBreakdown.forEach(status => {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
    }

    // Transform transactions for frontend consumption
    const transformedTransactions = transactions.map(transaction => ({
      _id: transaction._id,
      type: 'Sale', // All current transactions are sales
      amount: transaction.netAmount, // Amount seller receives
      grossAmount: transaction.grossAmount,
      commission: transaction.commission,
      description: `Sale from order ${transaction.order?.orderNumber || 'N/A'}`,
      date: transaction.createdAt,
      status: transaction.status === 'paid' ? 'Completed' : 
               transaction.status === 'pending' ? 'Pending' : 'Failed',
      orderId: transaction.order?._id,
      orderNumber: transaction.order?.orderNumber,
      buyerName: transaction.order?.buyerId ? 
        `${transaction.order.buyerId.firstName || ''} ${transaction.order.buyerId.lastName || ''}`.trim() : 'N/A',
      stripeTransferId: transaction.stripeTransferId
    }));

    res.status(StatusCodes.OK).json({
      transactions: transformedTransactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parsedLimit),
        totalCount,
        hasNext: skip + parsedLimit < totalCount,
        hasPrev: page > 1
      },
      summary: {
        totalSales: summary.totalNetAmount || 0,
        totalGrossAmount: summary.totalGrossAmount || 0,
        totalCommission: summary.totalCommission || 0,
        totalTransactions: summary.totalTransactions || 0,
        statusCounts
      }
    });

  } catch (error) {
    console.error('Error fetching seller transactions:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: error.message || 'Failed to fetch transaction history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a specific transaction by ID
 * GET /transaction/:transactionId
 */
const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      throw new CustomError.BadRequestError('Invalid transaction ID format');
    }

    const transaction = await Transaction.findById(transactionId)
      .populate({
        path: 'order',
        select: 'orderNumber createdAt buyerId totalAmount orderItems',
        populate: [
          {
            path: 'buyerId',
            select: 'firstName lastName email'
          },
          {
            path: 'orderItems.product',
            select: 'name price images'
          }
        ]
      })
      .populate({
        path: 'seller',
        select: 'firstName lastName email'
      });

    if (!transaction) {
      throw new CustomError.NotFoundError('Transaction not found');
    }

    // Authorization: Check if user is the seller
    if (transaction.seller._id.toString() !== req.user.userId) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to view this transaction'
      );
    }

    res.status(StatusCodes.OK).json(transaction);

  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: error.message || 'Failed to fetch transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get transaction statistics for a seller
 * GET /transaction/seller/:sellerId/stats
 */
const getSellerTransactionStats = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y
    
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new CustomError.BadRequestError('Invalid seller ID format');
    }

    const sellerStore = await Store.findById(sellerId);
    if (!sellerStore) {
      throw new CustomError.NotFoundError('Store not found');
    }

    if (sellerStore.ownerId.toString() !== req.user.userId) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to view statistics for this store'
      );
    }

    // Calculate date range based on period
    const now = new Date();
    const periodMap = {
      '7d': 7,
      '30d': 30, 
      '90d': 90,
      '1y': 365
    };
    
    const days = periodMap[period] || 30;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

    // Aggregation pipeline for statistics
    const statsPipeline = [
      {
        $match: {
          seller: new mongoose.Types.ObjectId(sellerStore.ownerId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          dailyRevenue: { $sum: '$netAmount' },
          dailyTransactions: { $sum: 1 },
          dailyCommission: { $sum: '$commission' }
        }
      },
      { $sort: { '_id': 1 } }
    ];

    const dailyStats = await Transaction.aggregate(statsPipeline);

    // Overall stats for the period
    const overallStatsPipeline = [
      {
        $match: {
          seller: new mongoose.Types.ObjectId(sellerStore.ownerId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$netAmount' },
          totalTransactions: { $sum: 1 },
          totalCommission: { $sum: '$commission' },
          avgTransactionValue: { $avg: '$netAmount' }
        }
      }
    ];

    const overallStatsResult = await Transaction.aggregate(overallStatsPipeline);
    const overallStats = overallStatsResult[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      totalCommission: 0,
      avgTransactionValue: 0
    };

    res.status(StatusCodes.OK).json({
      period,
      startDate,
      endDate: now,
      dailyStats,
      overallStats
    });

  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: error.message || 'Failed to fetch transaction statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getSellerTransactions,
  getTransactionById,
  getSellerTransactionStats
};
