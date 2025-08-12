const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const updateAdminPermissions = async () => {
  try {
    console.log('🔄 Updating admin role permissions...');
    
    // Find the admin role
    const adminRole = await Role.findOne({ name: 'admin' });
    
    if (!adminRole) {
      console.log('❌ Admin role not found. Creating admin role with permissions...');
      
      // Create admin role with all necessary permissions
      const newAdminRole = new Role({
        name: 'admin',
        permissions: [
          // user and role management
          'approve_user',
          'reject_user',
          'activate_user',
          'deactivate_user',
          'delete_user',
          'assign_role',
          'view_all_users',
          'view_user',
          'edit_user',
          'reset_user_password',
          'update_user_password',
          'upload_image',
          // store and product management
          'approve_product',
          'view_all_products',
          'view_product',
          'delete_products',
          'update_product',
          // order management
          'cancel_order',
          'refund_order',
          'view_all_orders',
          'view_sub_orders',
          //Platform Settings and Store Management
          'deactivate_stores',
          'activate_stores',
          'create_store_application',
          'view_store_application_details',
          'view_all_store_applications',
          'delete_store_application', // ✅ Added this permission
          // Support and Communication
          'access_support_tickets',
          'view_ticket_details',
          'close_ticket',
          'reply_to_ticket',
          'view_all_tickets',
          'update_ticket_status',
          'send_notification',
          'view_notification',
          'delete_notification',
          'update_notification_status',
          // Analytics and Reporting
          'view_order_report',
          'view_product_report',
          'view_user_report',
          'view_store_report',
          'view_notification_report',
          'view_ticket_report',
          'view_admin_report',
          'view_all_reports',
          'view_report_details',
          'update_report_status',
          'send_report_notification',
          'view_report_notification',
          'delete_report_notification',
          'update_report_notification_status',
          // Other permissions
          'view_store_details',
          'update_store_details',
          'delete_store',
          'view_store_logo',
          'view_store_banner',
          'view_store_hours',
          'view_store_address',
          'view_store_payment_methods',
          'view_store_delivery_options',
          'view_store_social_media_links',
          'view_store_about_us',
          'view_store_contact_details',
          'view_store_terms_and_conditions',
          'view_store_privacy_policy',
          'view_store_refund_policy',
          'view_store_shipping_policy',
          // support roles
          'access_support_tickets',
          'view_ticket_details',
          'reply_to_ticket',
          'update_ticket_status',
          'assign_support_tickets',
          'close_ticket',
          'escalate_ticket',
          'view_support_dashboard',
          'bulk_update_tickets',
          'manage_support_team',
        ],
      });
      
      await newAdminRole.save();
      console.log('✅ Admin role created successfully with delete_store_application permission');
    } else {
      console.log('✅ Admin role found. Checking permissions...');
      
      // Check if delete_store_application permission already exists
      if (!adminRole.permissions.includes('delete_store_application')) {
        // Add the missing permission
        adminRole.permissions.push('delete_store_application');
        await adminRole.save();
        console.log('✅ Added delete_store_application permission to admin role');
      } else {
        console.log('✅ delete_store_application permission already exists for admin role');
      }
    }
    
    // Display current admin permissions
    const updatedAdminRole = await Role.findOne({ name: 'admin' });
    console.log('\n📋 Current admin permissions:');
    updatedAdminRole.permissions.forEach((permission, index) => {
      console.log(`${index + 1}. ${permission}`);
    });
    
    console.log(`\n✅ Total permissions: ${updatedAdminRole.permissions.length}`);
    console.log('🎉 Admin permissions update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating admin permissions:', error);
  }
};

const main = async () => {
  await connectDB();
  await updateAdminPermissions();
  await mongoose.disconnect();
  console.log('📡 MongoDB connection closed');
  process.exit(0);
};

main();
