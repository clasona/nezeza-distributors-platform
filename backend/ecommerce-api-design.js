// User Roles & Relationships
const userRoles = {
  MANUFACTURER: 'manufacturer',
  WHOLESALER: 'wholesaler',
  RETAILER: 'retailer',
  CUSTOMER: 'customer'
};

// Entity Relationships:
/*
Users:
- Manufacturers: Can create/manage products, manage inventory, view orders
- Wholesalers: Can manage inventory, create orders to manufacturers, view retailer orders
- Retailers: Can manage inventory, create orders to wholesalers, view customer orders
- Customers: Can view products, create orders to retailers

Products:
- Belongs to a manufacturer
- Has many inventories (at different seller levels)
- Has many reviews
- Associated with orders

Orders:
- Belongs to a buyer and seller
- Contains multiple products
- Has status tracking

Stores:
- Belongs to a user (manufacturer/wholesaler/retailer)
- Has inventory

Inventory:
- Belongs to a store
- Associated with products
*/

// API Routes Structure
const apiRoutes = {
  // Authentication Routes
  auth: {
    'POST /api/auth/register': 'Register new user',
    'POST /api/auth/login': 'User login',
    'POST /api/auth/logout': 'User logout',
    'GET /api/auth/me': 'Get current user profile'
  },

  // User Routes
  users: {
    'GET /api/users': 'Get users (admin only)',
    'GET /api/users/:id': 'Get user by ID',
    'PUT /api/users/:id': 'Update user',
    'DELETE /api/users/:id': 'Delete user'
  },

  // Product Routes
  products: {
    // Manufacturer only
    'POST /api/products': 'Create new product',
    'PUT /api/products/:id': 'Update product',
    'DELETE /api/products/:id': 'Delete product',
    
    // Available based on role hierarchy
    'GET /api/products': 'Get products list (filtered by role)',
    'GET /api/products/:id': 'Get product details',
    'GET /api/manufacturers/:id/products': 'Get manufacturer products',
    'GET /api/wholesalers/:id/products': 'Get wholesaler products',
    'GET /api/retailers/:id/products': 'Get retailer products'
  },

  // Store Routes
  stores: {
    'POST /api/stores': 'Create store',
    'GET /api/stores': 'Get stores list',
    'GET /api/stores/:id': 'Get store details',
    'PUT /api/stores/:id': 'Update store',
    'DELETE /api/stores/:id': 'Delete store',
    'GET /api/stores/:id/products': 'Get store products'
    // Invite a User to the Store
    //'POST   /api/stores/:storeId/invite':        '// Invite a new user to the store'

    // Remove a User from the Store
   // DELETE /api/stores/:storeId/users/:userId  // Remove an existing user from the store

    // Get All Users in the Store
    //GET    /api/stores/:storeId/users           // Get a list of all users associated with the store

    // Get User Details in the Store
    //GET    /api/stores/:storeId/users/:userId   // Get details of a specific user in the store

  },

 /* // Manufacturers
GET    /api/manufacturers/:manufacturerId/products     // View own products
POST   /api/manufacturers/:manufacturerId/products     // Create product (manufacturers only)
PUT    /api/manufacturers/:manufacturerId/products/:productId  // Update own product
DELETE /api/manufacturers/:manufacturerId/products/:productId  // Delete own product

// Wholesalers
GET    /api/wholesalers/:wholesalerId/products         // Browse products from manufacturers
GET    /api/wholesalers/:wholesalerId/inventory        // View own inventory
PUT    /api/wholesalers/:wholesalerId/inventory/:inventoryId   // Update inventory item

// Retailers
GET    /api/retailers/:retailerId/products             // Browse products from wholesalers
GET    /api/retailers/:retailerId/inventory            // View own inventory
PUT    /api/retailers/:retailerId/inventory/:inventoryId // Update inventory item

// End-customers
GET    /api/customers/:customerId/orders               // View order history
POST   /api/customers/:customerId/orders               // Place order
POST   /api/customers/:customerId/reviews              // Add product review
*/

  // Inventory Routes
  inventory: {
    'POST /api/stores/:storeId/inventory': 'Add inventory',
    'GET /api/stores/:storeId/inventory': 'Get store inventory',
    'PUT /api/stores/:storeId/inventory/:id': 'Update inventory',
    'DELETE /api/stores/:storeId/inventory/:id': 'Delete inventory'
  },

  // Order Routes
  orders: {
    'POST /api/orders': 'Create order',
    'GET /api/orders': 'Get orders (filtered by role)',
    'GET /api/orders/:id': 'Get order details',
    'PUT /api/orders/:id/status': 'Update order status',
    'GET /api/orders/selling': 'Get orders where user is seller',
    'GET /api/orders/buying': 'Get orders where user is buyer'
  },

  // Review Routes
  reviews: {
    'POST /api/products/:id/reviews': 'Create review',
    'GET /api/products/:id/reviews': 'Get product reviews',
    'PUT /api/reviews/:id': 'Update review',
    'DELETE /api/reviews/:id': 'Delete review'
  }
};

// Example Implementation of Product Routes
const productRoutes = {
  // Create Product (Manufacturer Only)
  createProduct: async (req, res) => {
    try {
      // Check if user is manufacturer
      if (req.user.role !== userRoles.MANUFACTURER) {
        return res.status(403).json({ message: 'Only manufacturers can create products' });
      }

      const product = await Product.create({
        ...req.body,
        manufacturerId: req.user.id
      });

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get Products (Role-based filtering)
  getProducts: async (req, res) => {
    try {
      let query = {};
      
      switch (req.user.role) {
        case userRoles.WHOLESALER:
          // Wholesalers can only see manufacturer products
          query = { manufacturerId: { $exists: true } };
          break;
        case userRoles.RETAILER:
          // Retailers can only see wholesaler products
          query = { wholesalerId: { $exists: true } };
          break;
        case userRoles.CUSTOMER:
          // Customers can only see retailer products
          query = { retailerId: { $exists: true } };
          break;
      }

      const products = await Product.find(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// Example Implementation of Order Creation
const orderRoutes = {
  createOrder: async (req, res) => {
    try {
      const { sellerId, products } = req.body;
      
      // Validate order based on user roles
      const isValidOrder = await validateOrderHierarchy(req.user, sellerId);
      if (!isValidOrder) {
        return res.status(403).json({ 
          message: 'Invalid order: You cannot purchase from this seller level' 
        });
      }

      const order = await Order.create({
        buyerId: req.user.id,
        sellerId,
        products,
        status: 'pending'
      });

      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

// Example middleware for role-based access control
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to access this resource' 
      });
    }
    next();
  };
};
