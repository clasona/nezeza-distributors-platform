const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../../middleware/authentication');

const {
  getAllTickets,
  getAdminTicketDetails,
  assignTicket,
  updateTicketAdmin,
  respondToTicket,
  getSupportDashboard,
  bulkUpdateTickets,
} = require('../../controllers/admin/adminSupportController');

/**
 * @route   GET /api/v1/admin/support/dashboard
 * @desc    Get support dashboard statistics and metrics
 * @access  Private (Admin only)
 */
router
  .route('/dashboard')
  .get(
    authenticateUser,
    authorizePermissions('access_support_tickets'),
    getSupportDashboard
  );

/**
 * @route   GET /api/v1/admin/support/tickets
 * @desc    Get all support tickets with filtering and pagination
 * @access  Private (Admin only)
 */
router
  .route('/tickets')
  .get(
    authenticateUser,
    authorizePermissions('access_support_tickets'),
    getAllTickets
  );

/**
 * @route   PATCH /api/v1/admin/support/tickets/bulk
 * @desc    Bulk update multiple tickets
 * @access  Private (Admin only)
 */
router
  .route('/tickets/bulk')
  .patch(
    authenticateUser,
    authorizePermissions('access_support_tickets'),
    bulkUpdateTickets
  );

/**
 * @route   GET /api/v1/admin/support/tickets/:ticketId
 * @desc    Get single ticket details (admin view with full info)
 * @access  Private (Admin only)
 */
router
  .route('/tickets/:ticketId')
  .get(
    authenticateUser,
    authorizePermissions('view_ticket_details'),
    getAdminTicketDetails
  )
  .patch(
    authenticateUser,
    authorizePermissions('update_ticket_status'),
    updateTicketAdmin
  );

/**
 * @route   PATCH /api/v1/admin/support/tickets/:ticketId/assign
 * @desc    Assign ticket to admin user
 * @access  Private (Admin only)
 */
router
  .route('/tickets/:ticketId/assign')
  .patch(
    authenticateUser,
    authorizePermissions('access_support_tickets'),
    assignTicket
  );

/**
 * @route   POST /api/v1/admin/support/tickets/:ticketId/respond
 * @desc    Add admin response to ticket
 * @access  Private (Admin only)
 */
router
  .route('/tickets/:ticketId/respond')
  .post(
    authenticateUser,
    authorizePermissions('reply_to_ticket'),
    respondToTicket
  );

module.exports = router;
