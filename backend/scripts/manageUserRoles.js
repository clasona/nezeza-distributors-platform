const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config();

//How to use this script:
// 1. Run `npm run manageUserRoles` to see available commands
// 2. Use the commands to manage user roles and permissions
// node scripts/manageUserRoles.js list-users
// node scripts/manageUserRoles.js assign-role user@example.com admin
// node scripts/manageUserRoles.js show-permissions user@example.com
// node scripts/manageUserRoles.js add-permission admin new_permission_name

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Function to assign a role to a user
const assignRoleToUser = async (userEmail, roleName) => {
  try {
    console.log(`🔄 Assigning ${roleName} role to ${userEmail}...`);
    
    // Find the user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`❌ User with email ${userEmail} not found`);
      return false;
    }
    
    // Find the role
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      console.log(`❌ Role ${roleName} not found`);
      return false;
    }
    
    // Assign the role to the user
    user.role = role._id;
    await user.save();
    
    console.log(`✅ Successfully assigned ${roleName} role to ${userEmail}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error assigning role to user:', error);
    return false;
  }
};

// Function to list all users with their roles
const listUsersWithRoles = async () => {
  try {
    console.log('📋 Listing all users with their roles...\n');
    
    const users = await User.find().populate('role');
    
    if (users.length === 0) {
      console.log('No users found');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role ? user.role.name : 'No role assigned'}`);
      console.log(`   Created: ${user.createdAt.toDateString()}`);
      console.log(`   Status: ${user.isVerified ? 'Verified' : 'Not verified'}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }
};

// Function to list all available roles
const listAvailableRoles = async () => {
  try {
    console.log('📋 Available roles:\n');
    
    const roles = await Role.find();
    
    if (roles.length === 0) {
      console.log('No roles found');
      return;
    }
    
    roles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name}`);
      console.log(`   Permissions: ${role.permissions.length} permissions`);
      console.log(`   Created: ${role.createdAt.toDateString()}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error listing roles:', error);
  }
};

// Function to show user permissions
const showUserPermissions = async (userEmail) => {
  try {
    console.log(`🔍 Showing permissions for ${userEmail}...\n`);
    
    const user = await User.findOne({ email: userEmail }).populate('role');
    if (!user) {
      console.log(`❌ User with email ${userEmail} not found`);
      return;
    }
    
    if (!user.role) {
      console.log(`❌ User ${userEmail} has no role assigned`);
      return;
    }
    
    console.log(`User: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`Role: ${user.role.name}`);
    console.log(`Permissions (${user.role.permissions.length}):`);
    
    user.role.permissions.forEach((permission, index) => {
      console.log(`  ${index + 1}. ${permission}`);
    });
    
  } catch (error) {
    console.error('❌ Error showing user permissions:', error);
  }
};

// Function to add permission to a role
const addPermissionToRole = async (roleName, permission) => {
  try {
    console.log(`🔄 Adding ${permission} permission to ${roleName} role...`);
    
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      console.log(`❌ Role ${roleName} not found`);
      return false;
    }
    
    if (role.permissions.includes(permission)) {
      console.log(`✅ Permission ${permission} already exists for ${roleName} role`);
      return true;
    }
    
    role.permissions.push(permission);
    await role.save();
    
    console.log(`✅ Successfully added ${permission} permission to ${roleName} role`);
    return true;
    
  } catch (error) {
    console.error('❌ Error adding permission to role:', error);
    return false;
  }
};

// Function to remove permission from a role
const removePermissionFromRole = async (roleName, permission) => {
  try {
    console.log(`🔄 Removing ${permission} permission from ${roleName} role...`);
    
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      console.log(`❌ Role ${roleName} not found`);
      return false;
    }
    
    const permissionIndex = role.permissions.indexOf(permission);
    if (permissionIndex === -1) {
      console.log(`❌ Permission ${permission} not found for ${roleName} role`);
      return false;
    }
    
    role.permissions.splice(permissionIndex, 1);
    await role.save();
    
    console.log(`✅ Successfully removed ${permission} permission from ${roleName} role`);
    return true;
    
  } catch (error) {
    console.error('❌ Error removing permission from role:', error);
    return false;
  }
};

// Main function to handle command line arguments
const main = async () => {
  await connectDB();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'list-users':
      await listUsersWithRoles();
      break;
      
    case 'list-roles':
      await listAvailableRoles();
      break;
      
    case 'assign-role':
      const userEmail = process.argv[3];
      const roleName = process.argv[4];
      if (!userEmail || !roleName) {
        console.log('Usage: node manageUserRoles.js assign-role <user-email> <role-name>');
      } else {
        await assignRoleToUser(userEmail, roleName);
      }
      break;
      
    case 'show-permissions':
      const email = process.argv[3];
      if (!email) {
        console.log('Usage: node manageUserRoles.js show-permissions <user-email>');
      } else {
        await showUserPermissions(email);
      }
      break;
      
    case 'add-permission':
      const roleForAdd = process.argv[3];
      const permissionToAdd = process.argv[4];
      if (!roleForAdd || !permissionToAdd) {
        console.log('Usage: node manageUserRoles.js add-permission <role-name> <permission>');
      } else {
        await addPermissionToRole(roleForAdd, permissionToAdd);
      }
      break;
      
    case 'remove-permission':
      const roleForRemove = process.argv[3];
      const permissionToRemove = process.argv[4];
      if (!roleForRemove || !permissionToRemove) {
        console.log('Usage: node manageUserRoles.js remove-permission <role-name> <permission>');
      } else {
        await removePermissionFromRole(roleForRemove, permissionToRemove);
      }
      break;
      
    default:
      console.log('🛠️ Available commands:');
      console.log('  list-users              - List all users with their roles');
      console.log('  list-roles              - List all available roles');
      console.log('  assign-role <email> <role> - Assign a role to a user');
      console.log('  show-permissions <email> - Show user permissions');
      console.log('  add-permission <role> <permission> - Add permission to a role');
      console.log('  remove-permission <role> <permission> - Remove permission from a role');
      console.log('');
      console.log('Examples:');
      console.log('  node manageUserRoles.js list-users');
      console.log('  node manageUserRoles.js assign-role user@example.com admin');
      console.log('  node manageUserRoles.js add-permission admin new_permission');
      break;
  }
  
  await mongoose.disconnect();
  console.log('📡 MongoDB connection closed');
  process.exit(0);
};

main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
