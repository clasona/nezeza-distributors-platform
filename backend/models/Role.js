const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: [
        'admin',
        'owner',
        'manufacturer',
        'wholesaler',
        'inventory manager',
        'retailer',
        'customer',
      ],
      required: true,
    },
    permissions: {
      type: [String], // E.g permissions: 'create_product', 'update_product', 'view_product', 'create_order', etc.
      default: [],
    },
  },
  { timestamps: true }
);

const Role = mongoose.model('Role', RoleSchema);

const initRoles = async () => {
  const roles = [
    {
      name: 'manufacturer',
      permissions: [
        // 'create_product',
        // 'upload_product_image',
        // 'view_products',
        // 'view_product',
        // 'update_product',
        // 'delete_product',
        'view_current_orders',
        'view_current_order',
        'delete_order',
        'update_order',
        // support permissions
        'create_support_ticket',
        'view_own_tickets',
        'respond_to_own_tickets',
        'rate_support_experience',
        'escalate_urgent_issues',
      ],
    },
    {
      name: 'wholesaler',
      permissions: [
        //product permissions for wholesaler
        'view_manufacturer_products',
        'view_manufacturer_product',
        'upload_image',
        //order permission for retailer
        'create_order',
        'view_current_orders',
        'view_current_order',
        'delete_order',
        'update_order',
        'cancel_order',
        //inventory permissions for retailer
        'create_inventory',
        'update_inventory',
        'delete_inventory',
        'view_inventory',
        'create_support_ticket',
        // support permissions
        'view_own_tickets',
        'respond_to_own_tickets',
        'rate_support_experience',
        'escalate_urgent_issues',
      ],
    },
    {
      name: 'retailer',
      permissions: [
        //product permissions for retailer
        'upload_image',
        //order permission for retailer
        'create_order',
        'view_current_orders',
        'view_current_order',
        'update_order',
        'cancel_order',
        //inventory permissions for retailer
        'create_inventory',
        'update_inventory',
        'delete_inventory',
        'view_inventory',
        // support permissions
        'create_support_ticket',
        'view_own_tickets',
        'respond_to_own_tickets',
        'rate_support_experience',
        'escalate_urgent_issues',
      ],
    },
    {
      name: 'customer',
      permissions: [
        'show_me',
        'update_user',
        'update_user_password',
        'upload_image',

        'view_current_orders',
        'view_current_order',
        'delete_order',

        'cancel_order',
        'create_order',
        'update_order',
        // support perms
        'create_support_ticket',
        'view_own_tickets',
        'respond_to_own_tickets',
        'rate_support_experience', // Add any additional permissions required for customers.  E.g., 'view_customer_orders', 'place_order'
      ],
    },
    {
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
        'delete_store_application',
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
        // Add any additional permissions required for administrators.  E.g., 'view_admin_orders', 'create_admin'
      ],
    },
    {
      name: 'owner',
      permissions: [
        // user and role management for the store owner
        'add_user',
        'delete_user',
        'view_user',
        'edit_user',
        'invite_user',
        'reset_user_password',
        'update_user_password',
        'upload_image',
        'view_store_details',
        'update_store_details',
        'create_store_application',
        `view_store_application_details`,
        'create_product',
        'upload_product_image',
        'view_my_products',
        'view_my_product',
        'update_product',
        'delete_product',
      ],
    },

    {
      name: 'inventory manager',
      permissions: [
        // inventory management for the inventory manager
        'create_inventory',
        'update_inventory',
        'delete_inventory',
        'view_inventory',
        // order management for the inventory manager
        'create_order',
        'update_order',
        'view_orders',
        'view_order',
        'cancel_order',
        // additional permissions for the inventory manager
        'upload_image',
        'update_user_password',
      ],
    },
  ];

  for (const roleData of roles) {
    const role = new Role(roleData);
    await role.save();
  }
};

// initRoles();

module.exports = Role;
