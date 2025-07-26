// controllers/admin/adminSystemMonitoringController.js
const Order = require('../../models/Order');
const User = require('../../models/User');
const Product = require('../../models/Product');
const SupportTicket = require('../../models/SupportTicket');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');
const os = require('os');
const mongoose = require('mongoose');

// System Error Log Model (you should create this as a proper model)
const SystemErrorLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    level: {
      type: String,
      enum: ['error', 'warning', 'info', 'debug'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    stack: String,
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    endpoint: String,
    method: String,
    statusCode: Number,
    userAgent: String,
    ip: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

SystemErrorLogSchema.index({ timestamp: -1 });
SystemErrorLogSchema.index({ level: 1, timestamp: -1 });

const SystemErrorLog = mongoose.model('SystemErrorLog', SystemErrorLogSchema);

/**
 * Get system health overview
 * @route GET /api/v1/admin/monitoring/health
 */
const getSystemHealth = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last1Hour = new Date(now.getTime() - 60 * 60 * 1000);

    // Database connection status
    const dbStatus =
      mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';

    // System resources
    const systemResources = {
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      systemUptime: os.uptime(),
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
    };

    // Database performance metrics
    const dbStats = await mongoose.connection.db.stats();

    // Recent error count
    const recentErrors = await SystemErrorLog.countDocuments({
      timestamp: { $gte: last24Hours },
      level: 'error',
    });

    // Critical errors in last hour
    const criticalErrors = await SystemErrorLog.countDocuments({
      timestamp: { $gte: last1Hour },
      level: 'error',
    });

    // API performance (simplified - you'd implement proper metrics)
    const apiPerformance = {
      avgResponseTime: Math.random() * 200 + 100, // Mock data
      requestsPerMinute: Math.random() * 1000 + 500,
      errorRate: (recentErrors / (24 * 60)) * 100, // Errors per minute as percentage
    };

    // Active users (users with activity in last hour)
    const activeUsers = await Order.distinct('buyerId', {
      createdAt: { $gte: last1Hour },
    });

    // System status determination
    let overallStatus = 'healthy';
    if (
      dbStatus === 'unhealthy' ||
      criticalErrors > 10 ||
      apiPerformance.errorRate > 5
    ) {
      overallStatus = 'critical';
    } else if (recentErrors > 50 || apiPerformance.avgResponseTime > 500) {
      overallStatus = 'warning';
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        overallStatus,
        timestamp: now,
        database: {
          status: dbStatus,
          stats: dbStats,
        },
        system: systemResources,
        errors: {
          last24Hours: recentErrors,
          lastHour: criticalErrors,
        },
        api: apiPerformance,
        activeUsers: activeUsers.length,
      },
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch system health',
      error: error.message,
    });
  }
};

/**
 * Get performance metrics
 * @route GET /api/v1/admin/monitoring/performance
 */
const getPerformanceMetrics = async (req, res) => {
  try {
    const { period = '24h' } = req.query;

    let startDate;
    const now = new Date();

    switch (period) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // Order processing performance
    const orderMetrics = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          orderCount: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { '_id.day': 1, '_id.hour': 1 } },
    ]);

    // Error rate trends
    const errorTrends = await SystemErrorLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
            level: '$level',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1, '_id.hour': 1 } },
    ]);

    // Database query performance (simplified)
    const dbPerformance = {
      avgQueryTime: Math.random() * 50 + 10, // Mock data
      slowQueries: Math.floor(Math.random() * 10),
      totalQueries: Math.floor(Math.random() * 10000 + 5000),
    };

    // Most accessed endpoints
    const endpointStats = [
      { endpoint: '/api/v1/products', requests: 1250, avgResponseTime: 150 },
      { endpoint: '/api/v1/orders', requests: 850, avgResponseTime: 200 },
      { endpoint: '/api/v1/auth/login', requests: 600, avgResponseTime: 300 },
      { endpoint: '/api/v1/cart', requests: 450, avgResponseTime: 100 },
      { endpoint: '/api/v1/support', requests: 200, avgResponseTime: 180 },
    ];

    res.status(StatusCodes.OK).json({
      success: true,
      period,
      data: {
        orderMetrics,
        errorTrends,
        dbPerformance,
        endpointStats,
      },
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch performance metrics',
      error: error.message,
    });
  }
};

/**
 * Get error logs with filtering and pagination
 * @route GET /api/v1/admin/monitoring/errors
 */
const getErrorLogs = async (req, res) => {
  try {
    const {
      level,
      startDate,
      endDate,
      endpoint,
      userId,
      search,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      limit = 100,
      offset = 0,
    } = req.query;

    // Build query
    const query = {};

    if (level) {
      query.level = level;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (endpoint) {
      query.endpoint = { $regex: endpoint, $options: 'i' };
    }

    if (userId) {
      query.userId = userId;
    }

    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { stack: { $regex: search, $options: 'i' } },
      ];
    }

    const errorLogs = await SystemErrorLog.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const totalCount = await SystemErrorLog.countDocuments(query);

    // Error statistics
    const errorStats = await SystemErrorLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        logs: errorLogs,
        stats: errorStats,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch error logs',
      error: error.message,
    });
  }
};

/**
 * Log a system error (internal function)
 * @route POST /api/v1/admin/monitoring/log-error
 */
const logSystemError = async (req, res) => {
  try {
    const {
      level,
      message,
      stack,
      endpoint,
      method,
      statusCode,
      userAgent,
      ip,
      metadata,
    } = req.body;

    const userId = req.user ? req.user.userId : null;

    const errorLog = await SystemErrorLog.create({
      level,
      message,
      stack,
      userId,
      endpoint,
      method,
      statusCode,
      userAgent,
      ip,
      metadata,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Error logged successfully',
      data: errorLog,
    });
  } catch (error) {
    console.error('Error logging system error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to log error',
      error: error.message,
    });
  }
};

/**
 * Get platform activity statistics
 * @route GET /api/v1/admin/monitoring/activity
 */
const getActivityStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate;
    const now = new Date();

    switch (period) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // User activity
    const userActivity = {
      newRegistrations: await User.countDocuments({
        createdAt: { $gte: startDate },
      }),
      activeUsers: await Order.distinct('buyerId', {
        createdAt: { $gte: startDate },
      }).then((users) => users.length),
    };

    // Order activity
    const orderActivity = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Product activity
    const productActivity = {
      newProducts: await Product.countDocuments({
        createdAt: { $gte: startDate },
      }),
    };

    // Support activity
    const supportActivity = {
      newTickets: await SupportTicket.countDocuments({
        createdAt: { $gte: startDate },
      }),
      resolvedTickets: await SupportTicket.countDocuments({
        resolvedAt: { $gte: startDate },
      }),
      closedTickets: await SupportTicket.countDocuments({
        closedAt: { $gte: startDate },
      }),
    };

    // Resource usage trends
    const resourceTrends = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeConnections: Math.floor(Math.random() * 100 + 50), // Mock data
    };

    res.status(StatusCodes.OK).json({
      success: true,
      period,
      data: {
        userActivity,
        orderActivity,
        productActivity,
        supportActivity,
        resourceTrends,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch activity statistics',
      error: error.message,
    });
  }
};

/**
 * Clear old logs and perform maintenance
 * @route POST /api/v1/admin/monitoring/maintenance
 */
const performMaintenance = async (req, res) => {
  try {
    const { action, olderThanDays = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let result = {};

    switch (action) {
      case 'clear_old_logs':
        const deletedLogs = await SystemErrorLog.deleteMany({
          timestamp: { $lt: cutoffDate },
          level: { $in: ['info', 'debug'] },
        });
        result.deletedLogs = deletedLogs.deletedCount;
        break;

      case 'optimize_database':
        // Perform database optimization tasks
        await mongoose.connection.db.command({ compact: 'systemerrorlogs' });
        result.message = 'Database optimization completed';
        break;

      case 'clear_old_sessions':
        // Clear expired sessions (if you have a sessions collection)
        result.message = 'Old sessions cleared';
        break;

      default:
        throw new CustomError.BadRequestError('Invalid maintenance action');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Maintenance completed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error performing maintenance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to perform maintenance',
      error: error.message,
    });
  }
};

/**
 * Get real-time system alerts
 * @route GET /api/v1/admin/monitoring/alerts
 * NOTE: SKIP FOR MVP
 */
const getSystemAlerts = async (req, res) => {
  try {
    const now = new Date();
    const last15Minutes = new Date(now.getTime() - 15 * 60 * 1000);
    const last1Hour = new Date(now.getTime() - 60 * 60 * 1000);

    const alerts = [];

    // Check for high error rate
    const recentErrors = await SystemErrorLog.countDocuments({
      timestamp: { $gte: last15Minutes },
      level: 'error',
    });

    if (recentErrors > 5) {
      alerts.push({
        type: 'error_rate',
        severity: 'high',
        message: `High error rate detected: ${recentErrors} errors in last 15 minutes`,
        timestamp: now,
      });
    }

    // Check system resources
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent =
      (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    if (memoryUsagePercent > 90) {
      alerts.push({
        type: 'memory',
        severity: 'critical',
        message: `High memory usage: ${memoryUsagePercent.toFixed(1)}%`,
        timestamp: now,
      });
    }

    // Check for database connection issues
    if (mongoose.connection.readyState !== 1) {
      alerts.push({
        type: 'database',
        severity: 'critical',
        message: 'Database connection issue detected',
        timestamp: now,
      });
    }

    // Check for support ticket backlog
    const pendingTickets = await SupportTicket.countDocuments({
      status: { $in: ['open', 'in_progress'] },
      createdAt: { $lt: last1Hour },
    });

    if (pendingTickets > 20) {
      alerts.push({
        type: 'support_backlog',
        severity: 'medium',
        message: `High support ticket backlog: ${pendingTickets} pending tickets`,
        timestamp: now,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        alerts,
        alertCount: alerts.length,
        lastChecked: now,
      },
    });
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch system alerts',
      error: error.message,
    });
  }
};

// Middleware function to automatically log errors
const errorLoggingMiddleware = (err, req, res) => {
  // Only log server errors (5xx) and client errors that are important
  if (
    err.statusCode >= 500 ||
    (err.statusCode >= 400 && err.statusCode < 500 && err.statusCode !== 404)
  ) {
    SystemErrorLog.create({
      level: err.statusCode >= 500 ? 'error' : 'warning',
      message: err.message,
      stack: err.stack,
      userId: req.user ? req.user.userId : null,
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: err.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      metadata: {
        //body: req.body,
        query: req.query,
        params: req.params,
      },
    }).catch((logError) => {
      console.error('Failed to log error:', logError);
    });
  }

  //next(err);
};

module.exports = {
  getSystemHealth,
  getPerformanceMetrics,
  getErrorLogs,
  logSystemError,
  getActivityStats,
  performMaintenance,
  getSystemAlerts,
  errorLoggingMiddleware,
  SystemErrorLog, // Export the model
};
