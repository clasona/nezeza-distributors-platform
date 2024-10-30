const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['manufacturer', 'wholesaler', 'retailer', 'customer', 'admin'],
        required: true,
    },
    permissions: {
        type: [String],  // E.g permissions: 'create_product', 'update_product', 'view_product', 'create_order', etc.
        default: [],
    },
}, { timestamps: true });

const initRoles = async () => {
  const roles = [
    { 
        name: 'manufacturer', 
        permissions: ['create_product', 'update_product', 'view_product', 'delete_product', 'view_orders', 'update_order'  ], 
    },
    { 
        name: 'wholesaler', 
        permissions: ['create_order', 'view_product', 'view_orders', 'update_order'] 
    },
    { 
        name: 'retailer', 
        permissions: ['create_order', 'view_product', 'view_orders'] 
    },
    { 
        name: 'customer', 
        permissions: ['view_product', 'create_order', 'view_orders', 'update_order' ] 
    },
    { 
        name: 'admin', 
        permissions: ['create_product', 'update_product', 'view_orders', 'update_order', 'delete_order', 'create_order'] 
    },
  ];

  const Role = mongoose.model('Role', RoleSchema);
  
  for (const roleData of roles) {
      const role = new Role(roleData);
      await role.save();
    }
};
initRoles();

module.exports = Role;

