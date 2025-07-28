const mongoose = require('mongoose');

const SupportMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: [
        'customer',
        'retailer',
        'wholesaler',
        'manufacturer',
        'admin',
        'owner',
      ],
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    attachments: [
      {
        filename: String,
        url: String,
        fileType: String,
        fileSize: Number,
      },
    ],
    isInternal: {
      type: Boolean,
      default: false, // Internal notes between admin staff
    },
  },
  { timestamps: true }
);

const SupportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      maxlength: [200, 'Subject cannot exceed 200 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1500, 'Description cannot exceed 1500 characters'],
    },
    category: {
      type: String,
      enum: [
        'order_issue',
        'payment_problem',
        'shipping_delay',
        'product_quality',
        'refund_request',
        'account_access',
        'technical_support',
        'billing_inquiry',
        'seller_payout',
        'inventory_management',
        'platform_bug',
        'feature_request',
        'other',
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: [
        'open',
        'in_progress',
        'waiting_customer',
        'waiting_admin',
        'resolved',
        'closed',
      ],
      default: 'open',
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: {
      type: String,
      enum: ['customer', 'retailer', 'wholesaler', 'manufacturer', 'owner'],
      required: true,
    },
    userStoreId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
      // Optional - only for business users
    },
    // Related entities (optional)
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
    },
    subOrderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'SubOrder',
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
    // Assignment and handling
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Admin user assigned to handle this ticket
    },
    assignedAt: {
      type: Date,
    },
    // Resolution tracking
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    closedAt: {
      type: Date,
    },
    closedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    // Satisfaction rating (optional)
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    satisfactionFeedback: {
      type: String,
      maxlength: [500, 'Feedback cannot exceed 500 characters'],
    },
    // Message thread
    messages: [SupportMessageSchema],
    // Metadata
    tags: [String], // For categorization and searching
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalatedAt: {
      type: Date,
    },
    lastResponseAt: {
      type: Date,
      default: Date.now,
    },
    lastResponseBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    // Attachments for the initial ticket
    attachments: [
      {
        filename: String,
        url: String,
        fileType: String,
        fileSize: Number,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate ticket number before saving
SupportTicketSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update lastResponseAt when new message is added
SupportTicketSchema.pre('save', function (next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastResponseAt = lastMessage.createdAt || new Date();
    this.lastResponseBy = lastMessage.senderId;
  }
  next();
});

// Virtual for response time calculation
SupportTicketSchema.virtual('responseTimeHours').get(function () {
  if (this.messages.length > 1) {
    const firstMessage = this.messages[0];
    const firstResponse = this.messages[1];
    return Math.round(
      (firstResponse.createdAt - firstMessage.createdAt) / (1000 * 60 * 60)
    );
  }
  return null;
});

// Virtual for resolution time
SupportTicketSchema.virtual('resolutionTimeHours').get(function () {
  if (this.resolvedAt) {
    return Math.round((this.resolvedAt - this.createdAt) / (1000 * 60 * 60));
  }
  return null;
});

// Indexes for better query performance
SupportTicketSchema.index({ userId: 1, status: 1 });
SupportTicketSchema.index({ assignedTo: 1, status: 1 });
SupportTicketSchema.index({ category: 1, priority: 1 });
//SupportTicketSchema.index({ ticketNumber: 1 });
SupportTicketSchema.index({ createdAt: -1 });
SupportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });

// Static method to get ticket statistics
SupportTicketSchema.statics.getTicketStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await this.aggregate([
    {
      $match: { status: { $in: ['open', 'in_progress'] } },
    },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);

  return { statusStats: stats, priorityStats };
};

// Generate unique ticket ID
SupportTicketSchema.statics.generateTicketId = function () {
  return 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
