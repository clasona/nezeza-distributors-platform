# Current MVP Features & Login System Documentation

## Table of Contents
- [Current MVP Status](#current-mvp-status)
- [Working Features](#working-features)
- [Login System Architecture](#login-system-architecture)
- [User Roles & Permissions](#user-roles--permissions)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Frontend Pages](#frontend-pages)
- [Login Flow Walkthrough](#login-flow-walkthrough)
- [Environment Setup](#environment-setup)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Common Error Messages](#common-error-messages)
- [Developer Tools](#developer-tools)

## Current MVP Status

VeSoko is currently a **functional MVP** (Minimum Viable Product) with the following working capabilities:

### Phase 1 - Currently Working ✅
- **Customer Shopping Experience**: Browse, search, add to cart, favorites, checkout
- **Retailer Seller Platform**: Product management, order fulfillment, inventory tracking
- **User Authentication**: Registration, login, email verification, password recovery
- **Order Management**: Full order lifecycle for buyers and sellers
- **Payment Processing**: Stripe integration for secure payments
- **Admin Panel**: User management, system monitoring

### Phase 2 - Coming Soon 🚧
- **Direct African Manufacturer Integration**: Connect manufacturers from African countries
- **Global Logistics Support**: International shipping and compliance
- **Advanced Analytics**: Business intelligence and reporting

## Working Features

### 1. **Homepage & Product Discovery**
- **File**: `frontend/src/pages/index.tsx`
- **Features**:
  - Product browsing with search and filters
  - Category-based navigation
  - Featured product sections
  - Rating and review display
  - Responsive design

### 2. **User Authentication System**
- **Registration & Login**: Credential-based and Google OAuth
- **Email Verification**: Required for account activation
- **Password Recovery**: Forgot/reset password functionality
- **Multi-role Support**: Customer, Retailer, Wholesaler, Manufacturer, Admin

### 3. **Shopping Experience**
- **Product Details**: `/product/[id]` with image carousel, reviews, quantity selection
- **Shopping Cart**: Add/remove items, quantity management
- **Favorites/Wishlist**: Save products for later
- **Checkout Process**: Complete order placement with payment

### 4. **Order Management**
- **Customer Orders**: `/customer/orders` - View order history, track status, cancel orders
- **Seller Orders**: 
  - Retailers: `/retailer/orders/` - Manage customer orders, fulfillment
  - Wholesalers: `/wholesaler/orders/` - B2B order management
- **Order Statuses**: Pending → Confirmed → Processing → Shipped → Delivered

### 5. **Seller Dashboards**
- **Retailer Dashboard**: `/retailer/` - Product management, order fulfillment
- **Wholesaler Dashboard**: `/wholesaler/` - B2B product and order management
- **Product Management**: Create, edit, delete products with image uploads

### 6. **Admin Features**
- **User Management**: View all users, manage permissions
- **Store Applications**: Review and approve seller applications
- **System Monitoring**: Logs and error tracking

### 7. **Coming Soon Page**
- **File**: `frontend/src/pages/coming-soon.tsx`
- **Features**: Marketing page for Phase 2 features, email waitlist

## Login System Architecture

### Frontend Authentication (NextAuth.js)
```typescript
// File: frontend/src/pages/api/auth/[...nextauth].ts
// Handles frontend session management and OAuth providers
```

### Backend Authentication (Express.js + JWT)
```javascript
// File: backend/controllers/authController.js
// Handles user authentication, password validation, JWT tokens
```

### Authentication Flow
1. **Frontend Login Form** → `/login`
2. **NextAuth Credentials Provider** → Calls backend helper
3. **Backend Helper** → `/api/auth/backend-login.ts`
4. **Backend API** → `/api/v1/auth/login`
5. **JWT Token Generation** → Stored in httpOnly cookies
6. **User Session** → Maintained across requests

## User Roles & Permissions

### Role Hierarchy
```javascript
// Based on backend/controllers/authController.js registration logic

Customer (default):
- roles: ['customer']
- Can: browse products, place orders, manage account

Retailer:
- roles: ['owner', 'retailer']
- Can: manage products, fulfill orders, view analytics

Wholesaler:
- roles: ['owner', 'wholesaler'] 
- Can: B2B sales, bulk order management

Manufacturer:
- roles: ['owner', 'manufacturer']
- Can: product manufacturing, supplier management

Admin:
- roles: ['admin']
- Can: system administration, user management
```

### Permission System
```javascript
// File: backend/middleware/authentication.js
// Uses Role model with granular permissions like:
- 'view_all_users'
- 'create_product'
- 'update_order'
- 'view_current_orders'
```

## Data Models

### User Model
```javascript
// File: backend/models/User.js
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  roles: [ObjectId] (ref: Role),
  isVerified: Boolean,
  verificationToken: String,
  provider: String (credentials/google),
  storeId: ObjectId (optional),
  address: {
    street1, street2, city, state, zip, country, phone
  },
  previousPasswords: [String] // Last 5 passwords
}
```

### Product Model
```javascript
// Products have:
- title, description, price, images
- category, availability, quantity
- dimensions (weight, height, width, length)
- colors, freeShipping
- rating, numOfReviews
- sellerId (User reference)
```

### Order Model
```javascript
// Orders have:
- buyerId, sellerIds, orderItems
- totalAmount, paymentStatus, fulfillmentStatus
- shippingAddress, paymentIntentId (Stripe)
- Tax calculations, shipping fees
- Timestamps, delivery estimates
```

## API Endpoints

### Authentication Routes
```javascript
// File: backend/routes/authRoutes.js
POST /api/v1/auth/register          // Create new account
POST /api/v1/auth/register/google   // Google registration
POST /api/v1/auth/login             // Email/password login  
POST /api/v1/auth/login/google      // Google login
POST /api/v1/auth/verify-email      // Verify email address
GET  /api/v1/auth/verify/status     // Check verification status
POST /api/v1/auth/resend-verification // Resend verification email
DELETE /api/v1/auth/logout          // Logout user
POST /api/v1/auth/forgot-password   // Request password reset
POST /api/v1/auth/reset-password    // Reset password with token
GET  /api/v1/auth/user-for-auth/:email // Get user for NextAuth
```

### Product Routes
```javascript
// File: backend/routes/productRoutes.js
GET  /api/v1/products/retailers     // Get all retailer products (public)
GET  /api/v1/products/wholesalers   // Get all wholesaler products
GET  /api/v1/products/manufacturers // Get all manufacturer products
GET  /api/v1/products/:id           // Get single product (public)
POST /api/v1/products               // Create product (auth required)
PATCH /api/v1/products/:id          // Update product (auth required)
DELETE /api/v1/products/:id         // Delete product (auth required)
```

### Order Routes
```javascript
// File: backend/routes/orderRoutes.js
POST /api/v1/orders                 // Create new order
GET  /api/v1/orders/buying          // Get customer's orders
GET  /api/v1/orders/selling         // Get seller's orders
GET  /api/v1/orders/buying/:id      // Get specific customer order
GET  /api/v1/orders/selling/:id     // Get specific seller order
PATCH /api/v1/orders/buying/archive/:id // Archive order
POST /api/v1/orders/:id/cancel      // Cancel full order
POST /api/v1/orders/:id/:itemId/cancel // Cancel order item
```

## Architecture & Design Patterns

### Dynamic Routing with `[[...tab]].tsx`
The platform implements advanced Next.js dynamic routing patterns for sophisticated user interfaces. This architectural pattern allows single files to handle multiple related routes while maintaining clean URLs and excellent performance.

📖 **[Complete Dynamic Routing Documentation](./DYNAMIC_ROUTING_ARCHITECTURE.md)**

**Key Benefits:**
- Single file per user type instead of multiple separate pages
- Tab-based navigation with clean, bookmarkable URLs
- Role-specific support portals with tailored content
- Optimized performance and state management
- Easier maintenance and feature additions

**Current Implementations:**
- Customer Support Portal: `/customer/support/[[...tab]].tsx`
- Retailer Business Support: `/retailer/support/[[...tab]].tsx`
- Wholesaler B2B Support: `/wholesaler/support/[[...tab]].tsx`
- Manufacturer Support: `/manufacturer/support/[[...tab]].tsx`
- Admin Support Management: `/admin/support/[[...tab]].tsx`

Each implementation handles 4-6 related routes (dashboard, ticket submission, ticket management, analytics, FAQs) in a single file with dynamic content rendering.

## Frontend Pages

### Public Pages
- `/` - Homepage with product browsing
- `/product/[id]` - Product details page
- `/login` - Login page
- `/register` - Registration page
- `/coming-soon` - Marketing page for Phase 2

### Customer Pages (Authenticated)
- `/customer/orders` - Order history and management
- `/customer/order/[id]` - Specific order details
- `/cart` - Shopping cart
- `/favorites` - Wishlist/favorites
- `/checkout/review` - Order review and payment

### Retailer Pages (Role: retailer)
- `/retailer/` - Retailer dashboard
- `/retailer/orders/my-orders` - Orders placed by retailer
- `/retailer/orders/customer-orders` - Customer orders to fulfill
- `/retailer/orders/archived` - Archived orders
- `/retailer/products/` - Product management
- `/retailer/products/add-product` - Add new product

### Wholesaler Pages (Role: wholesaler)
- `/wholesaler/` - Wholesaler dashboard
- `/wholesaler/orders/my-orders` - Wholesaler's orders
- `/wholesaler/orders/customer-orders` - B2B orders to fulfill
- `/wholesaler/orders/archived` - Archived orders

### Admin Pages (Role: admin)
- `/admin/` - Admin dashboard
- `/admin/users` - User management
- `/admin/store-applications` - Review seller applications

## Login Flow Walkthrough

### 1. User Registration
```
Frontend: /register → 
Backend: POST /api/v1/auth/register →
Creates user with verification token →
Sends verification email →
User clicks email link →
Frontend: /verify-email →
Backend: POST /api/v1/auth/verify-email →
Account activated (isVerified: true)
```

### 2. User Login (Credentials)
```
Frontend: /login →
User enters email/password →
NextAuth credentials provider →
Calls: /api/auth/backend-login.ts →
Backend: POST /api/v1/auth/login →
Validates credentials & verification →
Generates JWT tokens →
Sets httpOnly cookies →
Returns user data →
Frontend session established
```

### 3. User Login (Google OAuth)
```
Frontend: /login →
User clicks "Login with Google" →
NextAuth Google provider →
OAuth flow with Google →
Backend: POST /api/v1/auth/login/google →
Validates Google user →
Generates JWT tokens →
Sets httpOnly cookies →
Frontend session established
```

### 4. Protected Route Access
```
User visits protected page →
NextAuth checks session →
If valid: access granted →
If invalid: redirect to login →
Backend API calls include cookies →
JWT middleware validates tokens →
User data attached to request
```

## Environment Setup

### Prerequisites
1. **Node.js** (v14+ recommended)
2. **MongoDB** (local or cloud instance)
3. **Stripe Account** (for payments)
4. **Email Service** (for verification emails)

### Backend Environment (.env)
```bash
# Database
MONGO_URL=mongodb://localhost:27017/vesoko-dev

# JWT Secrets
JWT_SECRET=your-jwt-secret-key
JWT_LIFETIME=1d

# Email Service (SendGrid/NodeMailer)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@vesoko.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
CLIENT_URL=http://localhost:3000

# Server Config
PORT=8000
NODE_ENV=development
```

### Frontend Environment (.env.local)
```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Running the Application
```bash
# Start Backend
cd backend
npm install
npm run dev  # Runs on http://localhost:8000

# Start Frontend (new terminal)
cd frontend  
npm install
npm run dev  # Runs on http://localhost:3000

# Start MongoDB (if local)
mongod --dbpath /path/to/your/db
```

## Troubleshooting Guide

### Login Issues

#### 1. **"Invalid Credentials" Error**
**Symptoms**: User gets invalid credentials even with correct password
**Common Causes**:
- Account not verified (`isVerified: false`)
- Wrong email/password
- User doesn't exist

**Diagnosis Steps**:
```bash
# Use the diagnostic script
node backend/scripts/diagnose-user.js retailer@example.com

# Check MongoDB directly
use vesoko-dev
db.users.findOne({email: "retailer@example.com"})
```

**Solutions**:
- Ensure email is verified: Check `isVerified` field
- Reset password if needed
- Check roles are correctly assigned

#### 2. **"Account not verified" Error**
**Symptoms**: Login fails with verification message
**Cause**: User hasn't clicked email verification link

**Solutions**:
```bash
# Resend verification email
curl -X POST http://localhost:8000/api/v1/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Manually verify (development only)
db.users.updateOne(
  {email: "user@example.com"}, 
  {$set: {isVerified: true, verificationToken: ""}}
)
```

#### 3. **Role/Permission Issues**
**Symptoms**: User can login but can't access retailer/wholesaler pages
**Cause**: Incorrect roles assigned during registration

**Diagnosis**:
```javascript
// Check user roles
db.users.findOne({email: "user@example.com"}, {roles: 1})
db.roles.find({}) // List all available roles
```

**Solutions**:
```javascript
// Find role IDs
const customerRole = db.roles.findOne({name: "customer"})._id
const retailerRole = db.roles.findOne({name: "retailer"})._id
const ownerRole = db.roles.findOne({name: "owner"})._id

// Update user roles (retailer example)
db.users.updateOne(
  {email: "retailer@example.com"},
  {$set: {roles: [ownerRole, retailerRole]}}
)
```

### Connection Issues

#### 1. **Backend Won't Start**
**Check**:
- MongoDB is running
- Port 8000 is available
- Environment variables are set
- Database connection string is correct

#### 2. **Frontend Can't Connect to Backend**
**Check**:
- Backend is running on port 8000
- `NEXT_PUBLIC_BACKEND_URL` is correct
- CORS settings allow frontend origin
- No firewall blocking requests

#### 3. **Database Connection Errors**
**Symptoms**: "MongoNetworkError" or connection refused
**Solutions**:
- Start MongoDB service
- Check connection string format
- Ensure database exists
- Check network connectivity

## Common Error Messages

### Authentication Errors
| Error Message | Cause | Solution |
|---------------|--------|-----------|
| "Invalid Credentials" | Wrong password or unverified account | Check password, verify email |
| "Account not verified" | Email not verified | Click verification link or resend email |
| "Authentication invalid" | JWT token expired/invalid | Re-login to get new token |
| "Unauthorized to access this route" | Insufficient permissions | Check user roles and permissions |

### Database Errors
| Error Message | Cause | Solution |
|---------------|--------|-----------|
| "MongoNetworkError" | MongoDB not running | Start MongoDB service |
| "Email already exists" | Registration with existing email | Use different email or login |
| "No user with email" | User not found | Check email spelling or register |

### API Errors
| Error Message | Cause | Solution |
|---------------|--------|-----------|
| "Please provide email and password" | Missing login fields | Ensure form fields are filled |
| "Please provide all values" | Missing required fields | Check API request body |
| "Internal server error" | Backend exception | Check server logs for details |

## Developer Tools

### Diagnostic Script
```bash
# File: backend/scripts/diagnose-user.js
# Usage: node backend/scripts/diagnose-user.js user@example.com
```

### Database Queries
```javascript
// Connect to MongoDB
mongosh vesoko-dev

// Check user status
db.users.findOne({email: "user@example.com"})

// List all roles
db.roles.find({})

// Check recent orders
db.orders.find().sort({createdAt: -1}).limit(5)

// User role details
db.users.aggregate([
  {$match: {email: "user@example.com"}},
  {$lookup: {from: "roles", localField: "roles", foreignField: "_id", as: "roleDetails"}}
])
```

### API Testing
```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test products endpoint
curl http://localhost:8000/api/v1/products/retailers

# Test protected endpoint (replace with actual cookie)
curl http://localhost:8000/api/v1/orders/buying \
  -H "Cookie: accessToken=your-token; refreshToken=your-refresh-token"
```

### Log Monitoring
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend development logs
# Check browser console and Next.js terminal output
```

## Security Notes

1. **JWT Tokens**: Stored in httpOnly cookies, not localStorage
2. **Password Security**: Bcrypt hashing, previous password tracking
3. **Email Verification**: Required for account activation
4. **CORS Configuration**: Restricts cross-origin requests
5. **Input Validation**: Server-side validation for all inputs
6. **Rate Limiting**: Protection against brute force attacks (recommended to add)

## Next Steps for Developers

1. **Add User**: Create test users with different roles using the registration endpoint
2. **Test Login Flow**: Verify the complete authentication process
3. **Check Permissions**: Ensure role-based access works correctly
4. **Test Product Management**: Create and manage products as retailer
5. **Test Order Flow**: Complete an end-to-end purchase
6. **Monitor Logs**: Set up proper logging and monitoring
7. **Add Error Handling**: Improve error messages and user feedback

---

**Last Updated**: December 2024
**Status**: Active Development - MVP Phase
**Contact**: Development Team
