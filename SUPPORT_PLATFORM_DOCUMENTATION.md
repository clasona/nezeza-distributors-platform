# Nezeza Support Platform Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Email System](#email-system)
8. [File Upload System](#file-upload-system)
9. [User Roles & Permissions](#user-roles--permissions)
10. [Usage Guide](#usage-guide)
11. [Development Guide](#development-guide)
12. [Troubleshooting](#troubleshooting)

## Overview

The Nezeza Support Platform is a comprehensive customer support system designed to handle support tickets from multiple user types including customers, retailers, wholesalers, and manufacturers. It features a full ticket management system with real-time messaging, file attachments, email notifications, and administrative controls.

### Key Technologies
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **File Storage**: Cloudinary for cloud storage, Local file system for fallback
- **Email**: SendGrid integration
- **Authentication**: JWT tokens with role-based permissions

## Architecture

### System Architecture
```
Frontend (Next.js) ↔ Backend API (Express.js) ↔ MongoDB Database
                                ↓
                         Email Service (SendGrid)
                                ↓
                    File Storage (Cloudinary/Local)
```

### Directory Structure
```
backend/
├── controllers/
│   ├── supportController.js           # User-facing support operations
│   └── admin/
│       └── adminSupportController.js  # Admin support operations
├── models/
│   └── SupportTicket.js              # Ticket data model
├── routes/
│   ├── supportRoutes.js              # User support routes
│   └── admin/
│       └── adminSupportRoutes.js     # Admin support routes
├── utils/
│   ├── email/
│   │   └── emailSupportUtils.js      # Email templates and sending
│   └── cloudinaryAttachmentUtils.js  # File attachment utilities

frontend/
├── components/
│   ├── Support/
│   │   └── SupportCenter/            # Main support components
│   └── FormInputs/
│       ├── CloudinaryFileUpload.tsx  # File upload components
│       └── CloudinaryTicketFileUpload.tsx
├── pages/
│   ├── retailer/support/             # Retailer support interface
│   └── admin/support/                # Admin support interface
└── utils/
    ├── support/                      # Support API utilities
    └── admin/                        # Admin API utilities
```

## Features

### Core Features
1. **Ticket Creation & Management**
   - Create support tickets with subject, description, category, priority
   - Attach files (both traditional upload and Cloudinary)
   - Automatic ticket numbering (TKT-XXXXXX format)
   - Status tracking (open, in_progress, waiting_customer, waiting_admin, resolved, closed)

2. **Multi-User Support**
   - Support for customers, retailers, wholesalers, manufacturers
   - Role-based ticket visibility and permissions
   - Business context for retailer tickets (impact, estimated value)

3. **Real-time Messaging**
   - Threaded conversations within tickets
   - Admin and customer responses
   - Internal admin notes (not visible to customers)
   - Message attachments

4. **Administrative Features**
   - Ticket assignment to specific admin users
   - Bulk operations on multiple tickets
   - Dashboard with analytics and metrics
   - Priority escalation and SLA tracking

5. **Email Notifications**
   - Automated emails for ticket creation, responses, status changes
   - Mobile-responsive email templates
   - Admin notifications for high-priority tickets
   - SLA breach warnings

### Advanced Features
1. **File Attachments**
   - Support for both traditional file uploads and Cloudinary
   - Multiple file formats (PDF, DOC, images, etc.)
   - File size validation and security checks
   - Download and preview capabilities

2. **Business Intelligence**
   - Support analytics and reporting
   - Category-based ticket tracking
   - Resolution time metrics
   - Customer satisfaction ratings

3. **Escalation System**
   - Automatic priority escalation
   - SLA breach detection
   - Admin notification system

## Database Schema

### SupportTicket Model
```javascript
{
  ticketNumber: String,           // Auto-generated (TKT-XXXXXX)
  subject: String,                // Ticket subject
  description: String,            // Initial description
  category: String,               // Ticket category
  priority: String,               // low, medium, high, urgent
  status: String,                 // open, in_progress, waiting_customer, etc.
  userId: ObjectId,               // Reference to User
  userRole: String,               // Role of ticket creator
  userStoreId: ObjectId,          // Reference to Store (if business user)
  
  // Optional references
  orderId: ObjectId,              // Related order
  subOrderId: ObjectId,           // Related sub-order
  productId: ObjectId,            // Related product
  
  // Assignment & handling
  assignedTo: ObjectId,           // Assigned admin user
  assignedAt: Date,
  
  // Resolution tracking
  resolvedAt: Date,
  resolvedBy: ObjectId,
  closedAt: Date,
  closedBy: ObjectId,
  
  // Customer feedback
  satisfactionRating: Number,     // 1-5 scale
  satisfactionFeedback: String,
  
  // Messages thread
  messages: [SupportMessageSchema],
  
  // Metadata
  tags: [String],
  isEscalated: Boolean,
  escalatedAt: Date,
  lastResponseAt: Date,
  lastResponseBy: ObjectId,
  
  // File attachments
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number,
    public_id: String             // Cloudinary ID
  }],
  
  timestamps: true
}
```

### SupportMessage Schema
```javascript
{
  senderId: ObjectId,             // Message sender
  senderRole: String,             // Sender's role
  message: String,                // Message content
  attachments: [AttachmentSchema],// Message attachments
  isInternal: Boolean,            // Admin-only message
  timestamps: true
}
```

## API Endpoints

### User Endpoints

#### Ticket Management
```
POST   /api/v1/support                    # Create new ticket
GET    /api/v1/support/my-tickets         # Get user's tickets
GET    /api/v1/support/tickets/:ticketId  # Get ticket details
PATCH  /api/v1/support/tickets/:ticketId  # Update ticket (satisfaction)
```

#### Messaging
```
POST   /api/v1/support/tickets/:ticketId/message  # Add message to ticket
```

#### Metadata
```
GET    /api/v1/support/metadata           # Get categories, priorities, statuses
GET    /api/v1/support/lookup/:ticketNumber  # Lookup ticket by number
```

### Admin Endpoints

#### Dashboard & Analytics
```
GET    /api/v1/admin/support/dashboard    # Support dashboard metrics
```

#### Ticket Management
```
GET    /api/v1/admin/support/tickets      # Get all tickets (with filtering)
GET    /api/v1/admin/support/tickets/:ticketId     # Get ticket details (admin view)
PATCH  /api/v1/admin/support/tickets/:ticketId     # Update ticket (admin fields)
PATCH  /api/v1/admin/support/tickets/bulk          # Bulk update tickets
```

#### Assignment & Response
```
PATCH  /api/v1/admin/support/tickets/:ticketId/assign   # Assign ticket
POST   /api/v1/admin/support/tickets/:ticketId/respond  # Add admin response
```

### Request/Response Examples

#### Create Ticket
```javascript
POST /api/v1/support
Content-Type: multipart/form-data

{
  "subject": "Payment processing issue",
  "description": "Unable to process customer payments",
  "category": "payment_problem",
  "priority": "high",
  "cloudinaryAttachments": "[{...}]"  // JSON string
}

Response:
{
  "success": true,
  "message": "Support ticket created successfully",
  "ticket": {
    "_id": "...",
    "ticketNumber": "TKT-000123",
    "subject": "Payment processing issue",
    "status": "open",
    "priority": "high",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

#### Get User Tickets
```javascript
GET /api/v1/support/my-tickets?status=open&limit=10&offset=0

Response:
{
  "success": true,
  "tickets": [...],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## Frontend Components

### Core Components

#### SupportCenterLayout
Main layout component for support interfaces with tabbed navigation.

#### SupportTicketDetail
Displays ticket details with messaging interface:
- Ticket information header
- Message thread
- Reply form with file attachments
- Status and priority indicators

#### CustomerSupportMyTickets
User's ticket list interface:
- Filtering by status and category
- Ticket preview cards
- Pagination support

### Retailer-Specific Components

#### RetailerSupportPage
Enhanced support interface for business users:
- Business dashboard with metrics
- Volume pricing request forms
- Business impact categorization
- Account management integration

### Admin Components

#### AdminSupportDashboard
Administrative interface with:
- Ticket statistics and analytics
- Priority breakdown charts
- Category distribution
- Resolution metrics

### File Upload Components

#### CloudinaryTicketFileUpload
Multi-file upload component:
- Drag-and-drop interface
- File type validation
- Progress indicators
- File preview and management

#### CloudinaryFileUpload
Single file upload component for documents and attachments.

## Email System

### Email Templates
All email templates are mobile-responsive and include:
- Modern HTML5/CSS3 design
- Dark mode support
- Inline CSS for compatibility
- Professional branding

### Email Types

#### Ticket Created Email
```javascript
sendTicketCreatedEmail({
  userEmail,
  userName,
  ticketNumber,
  subject,
  category
});
```
Sent when a user creates a new ticket.

#### Ticket Response Email
```javascript
sendTicketResponseEmail({
  userEmail,
  userName,
  ticketNumber,
  adminName,
  message
});
```
Sent when admin responds to a ticket.

#### Status Update Email
```javascript
sendTicketStatusUpdateEmail({
  userEmail,
  userName,
  ticketNumber,
  oldStatus,
  newStatus,
  subject
});
```
Sent when ticket status changes.

#### Admin Notification Email
```javascript
sendAdminTicketNotificationEmail({
  ticketNumber,
  subject,
  priority,
  category,
  userName,
  userRole
});
```
Sent to admins for high-priority tickets.

### Email Configuration
```javascript
// Environment variables required
SENDGRID_API_KEY=your_sendgrid_key
ADMIN_EMAILS=admin1@domain.com,admin2@domain.com
CLIENT_URL=https://your-frontend-url.com
ADMIN_URL=https://your-admin-url.com
```

## File Upload System

### Cloudinary Integration
Primary file storage solution with features:
- Cloud-based storage
- Automatic optimization
- CDN delivery
- File transformation

### Configuration
```javascript
// Environment variables
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET=your_preset
CLOUDINARY_API_SECRET=your_api_secret
```

### Supported File Types
- Documents: PDF, DOC, DOCX, TXT
- Images: JPG, JPEG, PNG, GIF, WEBP
- Archives: ZIP
- Spreadsheets: XLS, XLSX

### File Size Limits
- Maximum file size: 10MB per file
- Maximum files per ticket: 5 files
- Total storage managed through Cloudinary quotas

### Fallback System
Traditional file uploads to local storage when Cloudinary is unavailable:
```javascript
// Uploads stored in: ./public/uploads/support/
// Accessible via: /uploads/support/filename
```

## User Roles & Permissions

### User Roles
1. **Customer**: Basic support access, own tickets only
2. **Retailer**: Business support features, enhanced analytics
3. **Wholesaler**: Bulk order support, inventory management
4. **Manufacturer**: Product-related support, quality issues
5. **Admin**: Full access to all tickets and admin features
6. **Owner**: System owner with administrative privileges

### Permission System
```javascript
// Required permissions for admin endpoints
'access_support_tickets'  // View all tickets
'view_ticket_details'     // View detailed ticket info
'update_ticket_status'    // Modify ticket status/priority
'reply_to_ticket'         // Respond to tickets
'assign_tickets'          // Assign tickets to admins
```

### Authorization Flow
1. User authentication via JWT tokens
2. Role extraction from user object
3. Permission validation in middleware
4. Route-level authorization checks

## Usage Guide

### For End Users

#### Creating a Support Ticket
1. Navigate to the Support section
2. Click "Submit Ticket" or "New Support Request"
3. Fill in the required fields:
   - Subject (brief description)
   - Category (select from dropdown)
   - Priority level
   - Detailed description
4. Attach files if needed (optional)
5. Submit the ticket
6. Receive confirmation email with ticket number

#### Managing Your Tickets
1. Go to "My Tickets" section
2. Filter tickets by status, category, or priority
3. Click on any ticket to view details
4. Add responses or attachments as needed
5. Rate your experience when ticket is resolved

### For Retailers

#### Business Support Features
1. **Dashboard**: View business metrics and support analytics
2. **Volume Pricing**: Submit requests for bulk discounts
3. **Business Impact**: Categorize requests by business impact
4. **Account Management**: Access dedicated account manager info

#### Creating Business Requests
1. Select appropriate request type (volume pricing, shipping issues, etc.)
2. Specify business impact level (low, medium, high, critical)
3. Include estimated value for pricing requests
4. Provide detailed business context in description

### For Administrators

#### Dashboard Overview
1. Access admin dashboard for support metrics
2. View ticket statistics by status, priority, category
3. Monitor response times and resolution metrics
4. Track customer satisfaction ratings

#### Managing Tickets
1. **View All Tickets**: Filter by status, priority, user role, date range
2. **Assign Tickets**: Assign tickets to specific admin users
3. **Update Status**: Change ticket status and priority
4. **Bulk Operations**: Update multiple tickets simultaneously

#### Responding to Tickets
1. Open ticket details page
2. Read conversation history
3. Add response (public or internal note)
4. Attach files if needed
5. Update status if resolved

## Development Guide

### Setup Instructions

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev           # Start development server
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local  # Configure environment variables
npm run dev                       # Start development server
```

#### Required Environment Variables

**Backend (.env)**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/nezeza
JWT_SECRET=your_jwt_secret
JWT_LIFETIME=1d
SENDGRID_API_KEY=your_sendgrid_key
ADMIN_EMAILS=admin@nezeza.com
CLIENT_URL=http://localhost:3000
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET=your_preset
CLOUDINARY_API_SECRET=your_api_secret
```

### Adding New Features

#### Adding a New Ticket Category
1. Update `getSupportMetadata()` in `supportController.js`
2. Add category to enum in `SupportTicket.js` model
3. Update frontend category dropdowns
4. Add category-specific icons in UI components

#### Adding New Email Templates
1. Create template function in `emailSupportUtils.js`
2. Use `getBaseEmailTemplate()` for consistent styling
3. Test email rendering across email clients
4. Add template call in appropriate controller

#### Extending User Roles
1. Add role to database seeding
2. Update role enum in User model
3. Add role-specific permissions
4. Update frontend role-based components

### Testing

#### Unit Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

#### Integration Tests
```bash
# Test API endpoints
npm run test:integration

# Test email sending
npm run test:email
```

#### Manual Testing Checklist
- [ ] Ticket creation flow
- [ ] File upload functionality
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] User permissions
- [ ] Mobile responsiveness

### Deployment

#### Production Environment Variables
```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://your-production-db
JWT_SECRET=strong-production-secret
SENDGRID_API_KEY=production-sendgrid-key
CLIENT_URL=https://your-domain.com
```

#### Deployment Steps
1. Build frontend: `npm run build`
2. Set up production database
3. Configure email service
4. Set up Cloudinary production account
5. Deploy backend to server
6. Deploy frontend to hosting platform
7. Configure domain and SSL

## Troubleshooting

### Common Issues

#### Email Not Sending
**Symptoms**: Users not receiving ticket notifications
**Solutions**:
1. Check SendGrid API key configuration
2. Verify email addresses are valid
3. Check SendGrid dashboard for delivery status
4. Review email templates for syntax errors

#### File Upload Failures
**Symptoms**: Files not uploading or displaying errors
**Solutions**:
1. Verify Cloudinary configuration
2. Check file size limits (10MB)
3. Ensure supported file types
4. Test local upload fallback

#### Permission Denied Errors
**Symptoms**: Users unable to access certain features
**Solutions**:
1. Verify user roles in database
2. Check JWT token expiration
3. Review middleware authentication
4. Validate permission assignments

#### Database Connection Issues
**Symptoms**: API returning 500 errors
**Solutions**:
1. Check MongoDB connection string
2. Verify database server is running
3. Check network connectivity
4. Review database user permissions

### Debug Tools

#### Logging
```javascript
// Enable debug mode
NODE_ENV=development
DEBUG=support:*

// View logs
tail -f logs/support.log
```

#### Database Queries
```javascript
// MongoDB shell commands
db.supporttickets.find({status: "open"}).count()
db.supporttickets.find({priority: "urgent"})
```

#### Email Testing
```bash
# Test email configuration
curl -X POST http://localhost:5000/api/v1/test-email
```

### Performance Optimization

#### Database Indexing
```javascript
// Add indexes for common queries
db.supporttickets.createIndex({userId: 1, status: 1})
db.supporttickets.createIndex({assignedTo: 1, status: 1})
db.supporttickets.createIndex({priority: 1, createdAt: -1})
```

#### File Upload Optimization
1. Use Cloudinary transformations for image optimization
2. Implement progressive file upload
3. Add file compression before upload
4. Cache file metadata

#### Email Performance
1. Use email queuing for bulk notifications
2. Implement retry logic for failed sends
3. Use email templates caching
4. Monitor delivery rates

### Monitoring & Analytics

#### Key Metrics to Track
- Ticket creation rate
- Average response time
- Resolution rate
- Customer satisfaction scores
- Admin workload distribution

#### Monitoring Tools
- Application performance monitoring (APM)
- Database performance monitoring
- Email delivery analytics
- User behavior tracking

### Security Considerations

#### Data Protection
- Encrypt sensitive data in database
- Use HTTPS for all communications
- Implement rate limiting
- Validate all user inputs

#### File Upload Security
- Scan uploaded files for malware
- Restrict file types and sizes
- Use CDN for file delivery
- Implement access controls

#### API Security
- Use JWT tokens with expiration
- Implement role-based access control
- Rate limit API endpoints
- Log security events

---

## Conclusion

The Nezeza Support Platform provides a comprehensive solution for managing customer support operations across multiple user types. With its robust feature set, scalable architecture, and user-friendly interfaces, it serves as a complete customer support ecosystem.

For additional support or feature requests, please contact the development team or create an issue in the project repository.

**Last Updated**: January 2024
**Version**: 1.0.0
**Authors**: Nezeza Development Team
