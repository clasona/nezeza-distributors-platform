// controllers/admin/adminFinancialController.js
const SellerBalance = require('../../models/sellerBalance');
const stripeModel = require('../../models/stripeModel');
const Order = require('../../models/Order');
const SubOrder = require('../../models/SubOrder');
const Store = require('../../models/Store');
const User = require('../../models/User');
const Refund = require('../../models/Refund');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Get platform financial overview
 * @route GET /api/v1/admin/financial/overview
 */
const getFinancialOverview = async (req, res) => {
  try {
    const { period = '90d' } = req.query;

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

    // Platform revenue from commissions
    const platformRevenue = await SellerBalance.aggregate([
      {
        $group: {
          _id: null,
          totalCommissionEarned: { $sum: '$commissionDeducted' },
          totalVolume: { $sum: '$totalSales' },
          totalPending: { $sum: '$pendingBalance' },
          totalAvailable: { $sum: '$availableBalance' },
        },
      },
    ]);

    // Recent transaction volume
    const recentTransactions = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'Paid' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalTax: { $sum: '$totalTax' },
          totalShipping: { $sum: '$totalShipping' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    // Refund metrics
    const refundMetrics = await Refund.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$refundAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Commission rate analysis by store type
    const commissionByStoreType = await SubOrder.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'Paid' } },
      {
        $lookup: {
          from: 'stores',
          localField: 'sellerStoreId',
          foreignField: '_id',
          as: 'store',
        },
      },
      { $unwind: '$store' },
      {
        $group: {
          _id: '$store.storeType',
          totalSales: { $sum: '$totalAmount' },
          totalFees: { $sum: '$transactionFee' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          totalSales: 1,
          totalFees: 1,
          orderCount: 1,
          avgCommissionRate: {
            $multiply: [{ $divide: ['$totalFees', '$totalSales'] }, 100],
          },
        },
      },
    ]);

    // Payment method fees
    const paymentMethodFees = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'Paid' } },
      {
        $group: {
          _id: '$paymentMethod',
          totalVolume: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          // Estimated Stripe fees (2.9% + $0.30)
          estimatedFees: {
            $sum: {
              $add: [{ $multiply: ['$totalAmount', 0.029] }, 0.3],
            },
          },
        },
      },
    ]);

    // Monthly revenue trend
    const monthlyRevenueTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'Paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        platformRevenue: platformRevenue[0] || {},
        recentTransactions: recentTransactions[0] || {},
        refundMetrics,
        commissionByStoreType,
        paymentMethodFees,
        monthlyRevenueTrend,
        period,
      },
    });
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch financial overview',
      error: error.message,
    });
  }
};

/**
 * Get all seller balances with filtering and pagination
 * @route GET /api/v1/admin/financial/seller-balances
 */
const getSellerBalances = async (req, res) => {
  try {
    const {
      search,
      storeType,
      minBalance,
      maxBalance,
      sortBy = 'totalSales',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
    } = req.query;
    console.log(search, storeType);
    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: '$seller' },
      {
        $lookup: {
          from: 'stores',
          localField: 'seller.storeId',
          foreignField: '_id',
          as: 'store',
        },
      },
      { $unwind: '$store' },
    ];

    // Add filters
    const matchConditions = {};

    if (search) {
      matchConditions.$or = [
        { 'sellerId.firstName': { $regex: search, $options: 'i' } },
        { 'sellerId.lastName': { $regex: search, $options: 'i' } },
        { 'sellerId.email': { $regex: search, $options: 'i' } },
        { 'store.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (storeType) {
      matchConditions['store.storeType'] = storeType;
    }

    if (minBalance) {
      matchConditions.totalSales = { $gte: parseFloat(minBalance) };
    }

    if (maxBalance) {
      if (matchConditions.totalSales) {
        matchConditions.totalSales.$lte = parseFloat(maxBalance);
      } else {
        matchConditions.totalSales = { $lte: parseFloat(maxBalance) };
      }
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add sorting
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: { [sortBy]: sortDirection } });

    // Add pagination
    pipeline.push({ $skip: parseInt(offset) });
    pipeline.push({ $limit: parseInt(limit) });

    // Project fields
    pipeline.push({
      $project: {
        sellerId: 1,
        totalSales: 1,
        commissionDeducted: 1,
        netRevenue: 1,
        pendingBalance: 1,
        availableBalance: 1,
        updatedAt: 1,
        seller: {
          firstName: 1,
          lastName: 1,
          email: 1,
        },
        store: {
          name: 1,
          storeType: 1,
          isActive: 1,
        },
      },
    });

    console.log(pipeline);

    const sellerBalances = await SellerBalance.aggregate(pipeline);
    console.log(sellerBalances);

    // Get total count for pagination
    const totalCount = await SellerBalance.countDocuments();

    res.status(StatusCodes.OK).json({
      success: true,
      data: sellerBalances,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching seller balances:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch seller balances',
      error: error.message,
    });
  }
};

/**
 * Transfer funds to seller
 * @route POST /api/v1/admin/financial/transfer-funds
 */
const transferFundsToConnectedAccount = async (req, res) => {
  try {
    const { sellerId, amount, notes } = req.body;
    const adminId = req.user.userId;

    if (!sellerId || !amount) {
      throw new CustomError.BadRequestError(
        'Seller ID and amount are required'
      );
    }

    // Get seller balance
    const sellerBalance = await SellerBalance.findOne({ sellerId });
    if (!sellerBalance) {
      throw new CustomError.NotFoundError('Seller balance not found');
    }

    // Validate amount
    if (amount > sellerBalance.availableBalance) {
      throw new CustomError.BadRequestError('Insufficient available balance');
    }

    // Get seller's Stripe account
    const seller = await stripeModel.findOne({ storeId: sellerId });
    if (!seller || !seller.stripeAccountId) {
      throw new CustomError.BadRequestError(
        'Seller does not have a connected Stripe account'
      );
    }

    // Create Stripe transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: seller.stripeAccountId,
      metadata: {
        sellerId: sellerId.toString(),
        type: 'marketplace_payout',
        step: 'transfer'
      }
    });

    // Update seller balance
    sellerBalance.updatedAt = new Date();

    // Add payout record
    if (!sellerBalance.payouts) {
      sellerBalance.payouts = [];
    }

    sellerBalance.payouts.push({
      amount,
      stripeTransferId: transfer.id,
      processedBy: adminId,
      status: 'transfer_completed',
      processedAt: new Date(),
      notes,
    });

    await sellerBalance.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Transfer processed successfully',
      data: {
        transferId: transfer.id,
        amount,
        remainingBalance: sellerBalance.availableBalance,
      },
    });
  } catch (error) {
    console.error('Error processing payout:', error);
    if (error.type && error.type.includes('Stripe')) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Stripe error: ' + error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to process payout',
        error: error.message,
      });
    }
  }
};

/**
 * Process payout to seller
 * @route POST /api/v1/admin/financial/process-payout
 */
const processPayout = async (req, res) => {
  try {
    const { sellerId, amount, notes } = req.body;
    const adminId = req.user.userId;

    if (!sellerId) {
      throw new CustomError.BadRequestError(
        'Seller ID is required'
      );
    }

    // Get seller balance
    const sellerBalance = await SellerBalance.findOne({ sellerId });
    if (!sellerBalance) {
      throw new CustomError.NotFoundError('Seller balance not found');
    }

    // Validate amount
    if (amount > sellerBalance.availableBalance) {
      throw new CustomError.BadRequestError('Insufficient available balance');
    }

    // Get seller's Stripe account
    const seller = await stripeModel.findOne({ storeId: sellerId });
    if (!seller || !seller.stripeAccountId) {
      throw new CustomError.BadRequestError(
        'Seller does not have a connected Stripe account'
      );
    }

   const payouts = sellerBalance.payouts || [];
   const payout_to_use = payouts.length > 0 ? payouts[payouts.length - 1] : null;
   const payoutIndex = payouts.length > 0 ? payouts.length - 1 : -1;
    const transferId = payout_to_use ? payout_to_use.stripeTransferId : null;
    const transferAmount = payout_to_use ? payout_to_use.amount : null;
    const transferStatus = payout_to_use ? payout_to_use.status : null;

    if (transferStatus !== 'transfer_completed') {
      throw new CustomError.BadRequestError('No completed transfer found for this seller');
    }

    // Create Stripe payout (if needed, depending on your Stripe setup)
     const payout = await stripe.payouts.create({
      amount: Math.round(transferAmount * 100), // Convert to cents
      currency: 'usd',
     metadata: {
        sellerId: sellerId.toString(),
        type: 'marketplace_payout',
        step: 'payout',
        transfer_id: transferId
      }
    }, {
      stripeAccount: seller.stripeAccountId, // This makes the payout on behalf of the connected account
    });

    // Update seller balance
    sellerBalance.availableBalance -= transferAmount;
    sellerBalance.updatedAt = new Date();

    // Add payout record and update status
    if (payoutIndex >= 0) {
      // Update the existing payout record
      if (!sellerBalance.payouts[payoutIndex].stripePayoutId) {
        sellerBalance.payouts[payoutIndex].stripePayoutId = payout.id;
      }
      sellerBalance.payouts[payoutIndex].status = 'payout_completed';
      sellerBalance.payouts[payoutIndex].processedAt = new Date();
      sellerBalance.payouts[payoutIndex].notes = notes || sellerBalance.payouts[payoutIndex].notes;
      
      // Mark the payouts array as modified so Mongoose detects the changes
      sellerBalance.markModified('payouts');
    }

    await sellerBalance.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Payout processed successfully',
      data: {
        transferId: payout.id,
        amount,
        remainingBalance: sellerBalance.availableBalance,
      },
    });
  } catch (error) {
    console.error('Error processing payout:', error);
    if (error.type && error.type.includes('Stripe')) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Stripe error: ' + error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to process payout',
        error: error.message,
      });
    }
  }
};

/**
 * Get refund management data
 * @route GET /api/v1/admin/financial/refunds
 */
const getRefundManagement = async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
    } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      query.refundAmount = {};
      if (minAmount) query.refundAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.refundAmount.$lte = parseFloat(maxAmount);
    }

    const refunds = await Refund.find(query)
      .populate('orderId', 'totalAmount paymentStatus')
      .populate('buyerId', 'firstName lastName email')
      .populate('sellerStoreId', 'name businessType')
      .populate('productId', 'title price')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const totalCount = await Refund.countDocuments(query);

    // Get refund summary statistics
    const refundStats = await Refund.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$refundAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        refunds,
        stats: refundStats,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching refund management data:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch refund data',
      error: error.message,
    });
  }
};

/**
 * Generate financial report
 * @route GET /api/v1/admin/financial/reports/:reportType
 * NOTE: SKIP FOR THE MVP
 */
const generateFinancialReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let reportData;

    switch (reportType) {
      case 'revenue':
        reportData = await generateRevenueReport(start, end);
        break;
      case 'commission':
        reportData = await generateCommissionReport(start, end);
        break;
      case 'payouts':
        reportData = await generatePayoutReport(start, end);
        break;
      case 'tax':
        reportData = await generateTaxReport(start, end);
        break;
      default:
        throw new CustomError.BadRequestError('Invalid report type');
    }

    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${reportType}_report_${Date.now()}.csv`
      );
      return res.send(csv);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      reportType,
      period: { start, end },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to generate financial report',
      error: error.message,
    });
  }
};

// Helper functions for report generation
const generateRevenueReport = async (startDate, endDate) => {
  return await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'Paid',
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        totalRevenue: { $sum: '$totalAmount' },
        totalTax: { $sum: '$totalTax' },
        totalShipping: { $sum: '$totalShipping' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);
};

const generateCommissionReport = async (startDate, endDate) => {
  return await SellerBalance.aggregate([
    { $match: { updatedAt: { $gte: startDate, $lte: endDate } } },
    {
      $lookup: {
        from: 'stores',
        localField: 'sellerId',
        foreignField: 'ownerId',
        as: 'store',
      },
    },
    { $unwind: '$store' },
    {
      $group: {
        _id: '$store.businessType',
        totalCommission: { $sum: '$commissionDeducted' },
        totalSales: { $sum: '$totalSales' },
        sellerCount: { $sum: 1 },
      },
    },
  ]);
};

const generatePayoutReport = async (startDate, endDate) => {
  // This would depend on having a proper Payout model
  return [];
};

const generateTaxReport = async (startDate, endDate) => {
  return await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'Paid',
      },
    },
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
        totalTaxCollected: { $sum: '$totalTax' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { totalTaxCollected: -1 } },
  ]);
};

// Helper to convert data to CSV
const convertToCSV = (data) => {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((item) =>
      headers
        .map((header) => {
          const value = item[header];
          return typeof value === 'string'
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(',')
    ),
  ].join('\n');

  return csv;
};

module.exports = {
  getFinancialOverview,
  getSellerBalances,
  transferFundsToConnectedAccount,
  processPayout,
  getRefundManagement,
  generateFinancialReport,
};
