const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createSupportTicket,
  getCurrentUserTickets,
  getSingleTicket,
  addMessageToTicket,
  updateTicket,
  getTicketByNumber,
  getSupportMetadata,
} = require('../controllers/supportController');

/**
 * @route   GET /api/v1/support/metadata
 * @desc    Get support categories, priorities, and statuses for dropdowns
 * @access  Public (but typically used by authenticated users)
 */
router.route('/metadata').get(getSupportMetadata);

/**
 * @route   POST /api/v1/support
 * @desc    Create a new support ticket
 * @access  Private (authenticated users)
 */
router.route('/').post(authenticateUser, createSupportTicket);

/**
 * @route   GET /api/v1/support/my-tickets
 * @desc    Get current user's support tickets with filtering
 * @access  Private (authenticated users)
 */
router.route('/my-tickets').get(authenticateUser, getCurrentUserTickets);

/**
 * @route   GET /api/v1/support/lookup/:ticketNumber
 * @desc    Look up ticket by ticket number (user can only see their own)
 * @access  Private (authenticated users)
 */
router.route('/lookup/:ticketNumber').get(authenticateUser, getTicketByNumber);

/**
 * @route   GET /api/v1/support/tickets/:ticketId
 * @desc    Get single ticket details
 * @access  Private (authenticated users - own tickets only)
 */
router
  .route('/tickets/:ticketId')
  .get(authenticateUser, getSingleTicket)
  .patch(authenticateUser, updateTicket);

/**
 * @route   POST /api/v1/support/tickets/:ticketId/message
 * @desc    Add message to existing ticket
 * @access  Private (authenticated users - own tickets only)
 */
router
  .route('/tickets/:ticketId/message')
  .post(authenticateUser, addMessageToTicket);

module.exports = router;
