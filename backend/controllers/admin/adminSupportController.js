const SupportTicket = require('../../models/SupportTicket');
const User = require('../../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');
const {
  sendTicketAssignedEmail,
  sendTicketStatusUpdateEmail,
  sendTicketResponseEmail,
} = require('../../utils/email/emailSupportUtils');

/**
 * Get all support tickets (Admin only)
 * @route GET /api/v1/admin/support/tickets
 */
const getAllTickets = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      userRole,
      assignedTo,
      isEscalated,
      startDate,
      endDate,
      search,
      limit,
      offset,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query = {};

    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    if (priority) {
      if (Array.isArray(priority)) {
        query.priority = { $in: priority };
      } else {
        query.priority = priority;
      }
    }

    if (userRole) query.userRole = userRole;
    if (assignedTo) query.assignedTo = assignedTo;
    if (isEscalated) query.isEscalated = isEscalated === 'true';

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search in subject and description
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Get tickets with pagination
    const tickets = await SupportTicket.find(query)
      .populate([
        { path: 'userId', select: 'firstName lastName email' },
        { path: 'userStoreId', select: 'name' },
        { path: 'assignedTo', select: 'firstName lastName' },
        { path: 'orderId', select: 'totalAmount paymentStatus' },
        { path: 'productId', select: 'title' },
      ])
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const totalCount = await SupportTicket.countDocuments(query);

    // Get summary statistics
    const stats = await SupportTicket.getTicketStats();

    res.status(StatusCodes.OK).json({
      success: true,
      tickets,
      stats,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch tickets',
      error: error.message,
    });
  }
};

/**
 * Get single ticket details (Admin view)
 * @route GET /api/v1/admin/support/tickets/:ticketId
 */
const getAdminTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findById(ticketId).populate([
      { path: 'userId', select: 'firstName lastName email phone' },
      { path: 'userStoreId', select: 'name email' },
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'orderId' },
      { path: 'subOrderId' },
      { path: 'productId' },
      { path: 'resolvedBy', select: 'firstName lastName' },
      { path: 'closedBy', select: 'firstName lastName' },
      { path: 'messages.senderId', select: 'firstName lastName' },
    ]);

    if (!ticket) {
      throw new CustomError.NotFoundError('Support ticket not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Error fetching admin ticket details:', error);
    if (error instanceof CustomError.NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch ticket details',
      error: error.message,
    });
  }
};

/**
 * Assign ticket to admin user
 * @route PATCH /api/v1/admin/support/tickets/:ticketId/assign
 */
const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignedTo } = req.body;
    const adminId = req.user.userId;

    if (!assignedTo) {
      throw new CustomError.BadRequestError('assignedTo user ID is required');
    }

    // Verify the assigned user exists and is an admin
    const assignedUser = await User.findById(assignedTo).populate('roles');
    if (!assignedUser) {
      throw new CustomError.NotFoundError('Assigned user not found');
    }

    const hasAdminRole = assignedUser.roles.some(
      (role) =>
        role.name === 'admin' ||
        role.permissions.includes('access_support_tickets')
    );

    if (!hasAdminRole) {
      throw new CustomError.BadRequestError(
        'User must have admin permissions to be assigned tickets'
      );
    }

    const ticket = await SupportTicket.findById(ticketId).populate(
      'userId',
      'firstName lastName email'
    );

    if (!ticket) {
      throw new CustomError.NotFoundError('Support ticket not found');
    }

    // Update assignment
    ticket.assignedTo = assignedTo;
    ticket.assignedAt = new Date();

    // Update status if it's still open
    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    // Send notification email to assigned admin
    await sendTicketAssignedEmail({
      adminEmail: 'clasona.us@gmail.com',
      //assignedUser.email,
      adminName: `${assignedUser.firstName} ${assignedUser.lastName}`,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      priority: ticket.priority,
      userName: `${ticket.userId.firstName} ${ticket.userId.lastName}`,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket,
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    if (
      error instanceof CustomError.BadRequestError ||
      error instanceof CustomError.NotFoundError
    ) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to assign ticket',
      error: error.message,
    });
  }
};

/**
 * Update ticket status, priority, or other admin fields
 * @route PATCH /api/v1/admin/support/tickets/:ticketId
 */
const updateTicketAdmin = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const adminId = req.user.userId;
    const { status, priority, isEscalated, tags, assignedTo } = req.body;

    const ticket = await SupportTicket.findById(ticketId)
      .populate('userId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!ticket) {
      throw new CustomError.NotFoundError('Support ticket not found');
    }

    const oldStatus = ticket.status;
    let statusChanged = false;

    // Update fields
    if (status !== undefined) {
      ticket.status = status;
      statusChanged = oldStatus !== status;

      // Set resolution/closure timestamps
      if (status === 'resolved' && oldStatus !== 'resolved') {
        ticket.resolvedAt = new Date();
        ticket.resolvedBy = adminId;
      }

      if (status === 'closed' && oldStatus !== 'closed') {
        ticket.closedAt = new Date();
        ticket.closedBy = adminId;
      }
    }

    if (priority !== undefined) ticket.priority = priority;
    if (isEscalated !== undefined) {
      ticket.isEscalated = isEscalated;
      if (isEscalated && !ticket.escalatedAt) {
        ticket.escalatedAt = new Date();
      }
    }
    if (tags !== undefined) ticket.tags = tags;
    if (assignedTo !== undefined) {
      ticket.assignedTo = assignedTo;
      ticket.assignedAt = new Date();
    }

    await ticket.save();

    // Send status update email to user if status changed
    if (statusChanged) {
      await sendTicketStatusUpdateEmail({
        userEmail: 'clasona.us@gmail.com',
        //ticket.userId.email,
        userName: `${ticket.userId.firstName} ${ticket.userId.lastName}`,
        ticketNumber: ticket.ticketNumber,
        oldStatus: oldStatus,
        newStatus: status,
        subject: ticket.subject,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ticket updated successfully',
      ticket,
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    if (error instanceof CustomError.NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to update ticket',
      error: error.message,
    });
  }
};

/**
 * Add admin response to ticket
 * @route POST /api/v1/admin/support/tickets/:ticketId/respond
 */
const respondToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const adminId = req.user.userId;
    const { message, isInternal, attachments } = req.body;

    if (!message || message.trim().length === 0) {
      throw new CustomError.BadRequestError('Message content is required');
    }

    const ticket = await SupportTicket.findById(ticketId).populate(
      'userId',
      'firstName lastName email'
    );

    if (!ticket) {
      throw new CustomError.NotFoundError('Support ticket not found');
    }

    // Check if ticket is closed
    if (ticket.status === 'closed') {
      throw new CustomError.BadRequestError(
        'Cannot respond to a closed ticket'
      );
    }

    // Add admin response
    const adminResponse = {
      senderId: adminId,
      senderRole: 'admin',
      message: message.trim(),
      attachments: attachments || [],
      isInternal: isInternal || false,
    };

    ticket.messages.push(adminResponse);

    // Update ticket status
    if (ticket.status === 'open' || ticket.status === 'waiting_admin') {
      ticket.status = isInternal ? ticket.status : 'waiting_customer';
    }

    // Assign ticket to responding admin if not already assigned
    if (!ticket.assignedTo) {
      ticket.assignedTo = adminId;
      ticket.assignedAt = new Date();
    }

    await ticket.save();

    // Populate the response for return
    await ticket.populate('messages.senderId', 'firstName lastName');

    // Send email notification to user (only for non-internal messages)
    if (!isInternal) {
      const admin = await User.findById(adminId);
      await sendTicketResponseEmail({
        userEmail: 'clasona.us@gmail.com',
        //ticket.userId.email,
        userName: `${ticket.userId.firstName} ${ticket.userId.lastName}`,
        ticketNumber: ticket.ticketNumber,
        adminName: `${admin.firstName} ${admin.lastName}`,
        message: message.trim(),
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Response added successfully',
      ticket,
    });
  } catch (error) {
    console.error('Error responding to ticket:', error);
    if (
      error instanceof CustomError.BadRequestError ||
      error instanceof CustomError.NotFoundError
    ) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to respond to ticket',
      error: error.message,
    });
  }
};

/**
 * Get support dashboard statistics
 * @route GET /api/v1/admin/support/dashboard
 */
const getSupportDashboard = async (req, res) => {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Overall statistics
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({
      status: {
        $in: ['open', 'in_progress', 'waiting_customer', 'waiting_admin'],
      },
    });
    const resolvedTickets = await SupportTicket.countDocuments({
      status: 'resolved',
    });
    const closedTickets = await SupportTicket.countDocuments({
      status: 'closed',
    });

    // Recent activity
    const recentTickets = await SupportTicket.countDocuments({
      createdAt: { $gte: last7Days },
    });
    const recentResolved = await SupportTicket.countDocuments({
      resolvedAt: { $gte: last7Days },
    });

    // Priority breakdown
    const priorityStats = await SupportTicket.aggregate([
      {
        $match: {
          status: {
            $in: ['open', 'in_progress', 'waiting_customer', 'waiting_admin'],
          },
        },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Category breakdown (last 30 days)
    const categoryStats = await SupportTicket.aggregate([
      {
        $match: { createdAt: { $gte: last30Days } },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Average resolution time (in hours)
    const resolutionTimes = await SupportTicket.aggregate([
      {
        $match: {
          resolvedAt: { $exists: true, $gte: last30Days },
        },
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' },
          minResolutionTime: { $min: '$resolutionTime' },
          maxResolutionTime: { $max: '$resolutionTime' },
        },
      },
    ]);

    // Satisfaction ratings
    const satisfactionStats = await SupportTicket.aggregate([
      {
        $match: {
          satisfactionRating: { $exists: true },
          resolvedAt: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$satisfactionRating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    // Tickets by user role
    const roleStats = await SupportTicket.aggregate([
      {
        $match: { createdAt: { $gte: last30Days } },
      },
      {
        $group: {
          _id: '$userRole',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      dashboard: {
        overview: {
          totalTickets,
          openTickets,
          resolvedTickets,
          closedTickets,
          recentTickets,
          recentResolved,
        },
        priorityBreakdown: priorityStats,
        categoryBreakdown: categoryStats,
        resolutionMetrics: resolutionTimes[0] || {
          avgResolutionTime: 0,
          minResolutionTime: 0,
          maxResolutionTime: 0,
        },
        satisfaction: satisfactionStats[0] || {
          avgRating: 0,
          totalRatings: 0,
        },
        roleDistribution: roleStats,
      },
    });
  } catch (error) {
    console.error('Error fetching support dashboard:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
};

/**
 * Bulk update tickets
 * @route PATCH /api/v1/admin/support/tickets/bulk
 */
const bulkUpdateTickets = async (req, res) => {
  try {
    const { ticketIds, updates } = req.body;
    const adminId = req.user.userId;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      throw new CustomError.BadRequestError('ticketIds array is required');
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new CustomError.BadRequestError('Updates object is required');
    }

    const allowedUpdates = ['status', 'priority', 'assignedTo', 'tags'];
    const updateKeys = Object.keys(updates);
    const isValidUpdate = updateKeys.every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidUpdate) {
      throw new CustomError.BadRequestError(
        `Invalid update fields. Allowed: ${allowedUpdates.join(', ')}`
      );
    }

    // Prepare update object
    const updateObj = { ...updates };
    if (updates.status === 'resolved') {
      updateObj.resolvedAt = new Date();
      updateObj.resolvedBy = adminId;
    }
    if (updates.status === 'closed') {
      updateObj.closedAt = new Date();
      updateObj.closedBy = adminId;
    }
    if (updates.assignedTo) {
      updateObj.assignedAt = new Date();
    }

    // Perform bulk update
    const result = await SupportTicket.updateMany(
      { _id: { $in: ticketIds } },
      { $set: updateObj }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} tickets`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error bulk updating tickets:', error);
    if (error instanceof CustomError.BadRequestError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to bulk update tickets',
      error: error.message,
    });
  }
};

module.exports = {
  getAllTickets,
  getAdminTicketDetails,
  assignTicket,
  updateTicketAdmin,
  respondToTicket,
  getSupportDashboard,
  bulkUpdateTickets,
};
