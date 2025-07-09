const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const Store = require('../models/Store');
const Order = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  sendTicketCreatedEmail,
  sendTicketResponseEmail,
  sendTicketStatusUpdateEmail,
  sendAdminTicketNotificationEmail,
} = require('../utils/email/emailSupportUtils');

/**
 * Create a new support ticket
 * @route POST /api/v1/support
 */
const createSupportTicket = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      subject,
      description,
      category,
      priority,
      orderId,
      subOrderId,
      productId,
      attachments,
    } = req.body;

    // Validate the required fields
    if (!subject || !description || !category) {
      throw new CustomError.BadRequestError(
        'Subject, description, and category are required'
      );
    }

    // Get user details
    const user = await User.findById(userId).populate('roles storeId');
    if (!user) {
      throw new CustomError.NotFoundError('User not found');
    }

    // Determine user role
    const userRoles = user.roles.map((role) => role.name);
    let userRole = 'customer';
    if (userRoles.includes('manufacturer')) userRole = 'manufacturer';
    else if (userRoles.includes('wholesaler')) userRole = 'wholesaler';
    else if (userRoles.includes('retailer')) userRole = 'retailer';
    else if (userRoles.includes('owner')) userRole = 'owner';

    // Create initial message
    const initialMessage = {
      senderId: userId,
      senderRole: userRole,
      message: description,
      attachments: attachments || [],
    };

    // Create ticket
    const ticketData = {
      ticketNumber: SupportTicket.generateTicketId(),
      subject,
      description,
      category,
      priority: priority || 'medium',
      userId,
      userRole,
      userStoreId: user.storeId?._id,
      orderId,
      subOrderId,
      productId,
      messages: [initialMessage],
      attachments: attachments || [],
    };

    const ticket = await SupportTicket.create(ticketData);

    // Populate the created ticket for response
    await ticket.populate([
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'userStoreId', select: 'name' },
      { path: 'orderId', select: 'totalAmount createdAt' },
      { path: 'messages.senderId', select: 'firstName lastName' },
    ]);

    // Send email notifications
    await sendTicketCreatedEmail({
      userEmail: 'clasona.us@gmail.com',
      userName: `${user.firstName} ${user.lastName}`,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      category: ticket.category,
    });

    // Notify admin if high priority
    if (priority === 'high' || priority === 'urgent') {
      await sendAdminTicketNotificationEmail({
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        priority: ticket.priority,
        category: ticket.category,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: userRole,
      });
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket,
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    if (error instanceof CustomError.BadRequestError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to create support ticket',
      error: error.message,
    });
  }
};

/**
 * Get current user's tickets
 * @route GET /api/v1/support/my-tickets
 */
const getCurrentUserTickets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      status,
      category,
      priority,
      limit,
      offset,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query = { userId };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Get tickets with pagination
    const tickets = await SupportTicket.find(query)
      .populate([
        { path: 'assignedTo', select: 'firstName lastName' },
        {
          path: 'orderId',
          select: 'totalAmount paymentStatus fulfillmentStatus createdAt',
        },
        { path: 'productId', select: 'title price image' },
      ])
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const totalCount = await SupportTicket.countDocuments(query);

    res.status(StatusCodes.OK).json({
      success: true,
      tickets,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch tickets',
      error: error.message,
    });
  }
};

/**
 * Get single ticket details
 * @route GET /api/v1/support/tickets/:ticketId
 */
const getSingleTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    console.log(ticketId);
    const userId = req.user.userId;

    const ticket = await SupportTicket.findById(ticketId).populate([
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'userStoreId', select: 'name email' },
      { path: 'assignedTo', select: 'firstName lastName email' },
      {
        path: 'orderId',
        select: 'totalAmount paymentStatus fulfillmentStatus createdAt',
      },
      { path: 'productId', select: 'title price image' },
      { path: 'resolvedBy', select: 'firstName lastName' },
      { path: 'closedBy', select: 'firstName lastName' },
      { path: 'messages.senderId', select: 'firstName lastName' },
    ]);

    if (!ticket) {
      throw new CustomError.NotFoundError('Support ticket not found');
    }

    // Check authorization - user can only view their own tickets
    // (Admin access will be handled in admin controller)
    if (ticket.userId._id.toString() !== userId) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to view this ticket'
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    if (
      error instanceof CustomError.NotFoundError ||
      error instanceof CustomError.UnauthorizedError
    ) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch ticket',
      error: error.message,
    });
  }
};

/**
 * Add message to ticket
 * @route POST /api/v1/support/tickets/:ticketId/message
 */
const addMessageToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;
    const { message, attachments } = req.body;

    if (!message || message.trim().length === 0) {
      throw new CustomError.BadRequestError('Message content is required');
    }

    const ticket = await SupportTicket.findById(ticketId)
      .populate('userId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!ticket) {
      throw new CustomError.NotFoundError('Support ticket not found');
    }

    // Check authorization
    if (ticket.userId._id.toString() !== userId) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to add message to this ticket'
      );
    }

    // Check if ticket is closed
    if (ticket.status === 'closed') {
      throw new CustomError.BadRequestError(
        'Cannot add message to a closed ticket'
      );
    }

    // Get user details for role
    const user = await User.findById(userId).populate('roles');
    const userRoles = user.roles.map((role) => role.name);
    let userRole = 'customer';
    if (userRoles.includes('manufacturer')) userRole = 'manufacturer';
    else if (userRoles.includes('wholesaler')) userRole = 'wholesaler';
    else if (userRoles.includes('retailer')) userRole = 'retailer';
    else if (userRoles.includes('owner')) userRole = 'owner';

    // Add message
    const newMessage = {
      senderId: userId,
      senderRole: userRole,
      message: message.trim(),
      attachments: attachments || [],
    };

    ticket.messages.push(newMessage);

    // Update ticket status if it was waiting for customer response
    if (ticket.status === 'waiting_customer') {
      ticket.status = 'waiting_admin';
    }

    await ticket.save();

    // Populate the new message for response
    await ticket.populate('messages.senderId', 'firstName lastName');

    // Send email notification to assigned admin

    if (ticket.assignedTo && ticket.assignedTo.email) {
      await sendTicketResponseEmail({
        userEmail: 'clasona.us@gmail.com',
        //ticket.assignedTo.email,
        adminName: `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`,
        ticketNumber: ticket.ticketNumber,
        userName: `${ticket.userId.firstName} ${ticket.userId.lastName}`,
        message: message.trim(),
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Message added successfully',
      ticket,
    });
  } catch (error) {
    console.error('Error adding message to ticket:', error);
    if (
      error instanceof CustomError.BadRequestError ||
      error instanceof CustomError.NotFoundError ||
      error instanceof CustomError.UnauthorizedError
    ) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to add message',
      error: error.message,
    });
  }
};

/**
 * Update ticket status or priority (user can only update certain fields)
 * @route PATCH /api/v1/support/tickets/:ticketId
 */
const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;
    const { satisfactionRating, satisfactionFeedback } = req.body;

    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new CustomError.NotFoundError('Support ticket not found');
    }

    // Check authorization
    if (ticket.userId.toString() !== userId) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to update this ticket'
      );
    }

    // Users can only update satisfaction rating and feedback (after resolution)
    if (satisfactionRating !== undefined) {
      if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
        throw new CustomError.BadRequestError(
          'Can only rate resolved or closed tickets'
        );
      }
      if (satisfactionRating < 1 || satisfactionRating > 5) {
        throw new CustomError.BadRequestError(
          'Satisfaction rating must be between 1 and 5'
        );
      }
      ticket.satisfactionRating = satisfactionRating;
    }

    if (satisfactionFeedback !== undefined) {
      ticket.satisfactionFeedback = satisfactionFeedback;
    }

    await ticket.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ticket updated successfully',
      ticket,
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    if (
      error instanceof CustomError.BadRequestError ||
      error instanceof CustomError.NotFoundError ||
      error instanceof CustomError.UnauthorizedError
    ) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to update ticket',
      error: error.message,
    });
  }
};

/**
 * Get ticket by ticket number (public lookup)
 * @route GET /api/v1/support/lookup/:ticketNumber
 */
const getTicketByNumber = async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    const userId = req.user.userId;

    const ticket = await SupportTicket.findOne({ ticketNumber })
      .populate([
        { path: 'userId', select: 'firstName lastName' },
        { path: 'assignedTo', select: 'firstName lastName' },
      ])
      .select(
        'ticketNumber subject status priority category messages createdAt userId'
      );

    if (!ticket) {
      throw new CustomError.NotFoundError('Ticket not found');
    }

    // Check authorization
    if (ticket.userId._id.toString() !== userId) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to view this ticket'
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Error looking up ticket:', error);
    if (
      error instanceof CustomError.NotFoundError ||
      error instanceof CustomError.UnauthorizedError
    ) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to lookup ticket',
      error: error.message,
    });
  }
};

/**
 * Get support categories and priorities (for dropdowns)
 * @route GET /api/v1/support/metadata
 */
const getSupportMetadata = async (req, res) => {
  try {
    const categories = [
      { value: 'order_issue', label: 'Order Issue' },
      { value: 'payment_problem', label: 'Payment Problem' },
      { value: 'shipping_delay', label: 'Shipping Delay' },
      { value: 'product_quality', label: 'Product Quality' },
      { value: 'refund_request', label: 'Refund Request' },
      { value: 'account_access', label: 'Account Access' },
      { value: 'technical_support', label: 'Technical Support' },
      { value: 'billing_inquiry', label: 'Billing Inquiry' },
      { value: 'seller_payout', label: 'Seller Payout' },
      { value: 'inventory_management', label: 'Inventory Management' },
      { value: 'platform_bug', label: 'Platform Bug' },
      { value: 'feature_request', label: 'Feature Request' },
      { value: 'other', label: 'Other' },
    ];

    const priorities = [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ];

    const statuses = [
      { value: 'open', label: 'Open' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'waiting_customer', label: 'Waiting for Customer' },
      { value: 'waiting_admin', label: 'Waiting for Admin' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'closed', label: 'Closed' },
    ];

    res.status(StatusCodes.OK).json({
      success: true,
      metadata: {
        categories,
        priorities,
        statuses,
      },
    });
  } catch (error) {
    console.error('Error fetching support metadata:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch support metadata',
      error: error.message,
    });
  }
};

module.exports = {
  createSupportTicket,
  getCurrentUserTickets,
  getSingleTicket,
  addMessageToTicket,
  updateTicket,
  getTicketByNumber,
  getSupportMetadata,
};
