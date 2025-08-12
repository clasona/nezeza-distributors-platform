const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getAllOrders,
  getSingleOrder,
  getOrderByPaymentIntentId,
  getSellerSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  updateOrderItem,
  archiveOrder,
  updateSubOrder,
  updateToFulfilled,
  updateToShipped,
  updateToDelivered,
  updateToCancelled,
  updateShippingInfo,
  cancelSingleOrderProduct,
  cancelFullOrder,
} = require('../controllers/orderController');

router
  .route('/')
  .post(authenticateUser, authorizePermissions('create_order'), createOrder);

router
  .route('/selling')
  .get(
    authenticateUser,
    authorizePermissions('view_current_orders'),
    getAllOrders
  );

router
  .route('/buying')
  .get(
    authenticateUser,
    authorizePermissions('view_current_orders'),
    getCurrentUserOrders
  );

// router
//   .route('/buying/archived')
//   .get(
//     authenticateUser,
//     authorizePermissions('view_current_orders'),
//     getArchivedOrders
//   );

router
  .route('/buying/:id')
  .get(
    authenticateUser,
    authorizePermissions('view_current_order'),
    getSingleOrder
  );

router
  .route('/buying/payment/:paymentIntentId')
  .get(
    authenticateUser,
    authorizePermissions('view_current_order'),
    getOrderByPaymentIntentId
  );

// Temporary debug route - remove in production
router
  .route('/debug/payment/:paymentIntentId')
  .get(async (req, res) => {
    try {
      const { paymentIntentId } = req.params;
      const Order = require('../models/Order');
      
      console.log('=== DEBUG ENDPOINT ===');
      console.log('Looking for payment intent ID:', paymentIntentId);
      
      const order = await Order.findOne({ paymentIntentId });
      console.log('Order found:', order ? 'YES' : 'NO');
      
      if (order) {
        console.log('Order details:', {
          _id: order._id,
          buyerId: order.buyerId,
          buyerStoreId: order.buyerStoreId,
          paymentIntentId: order.paymentIntentId,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          createdAt: order.createdAt
        });
      }
      
      res.json({
        found: !!order,
        order: order ? {
          _id: order._id,
          buyerId: order.buyerId,
          buyerStoreId: order.buyerStoreId,
          paymentIntentId: order.paymentIntentId,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          createdAt: order.createdAt
        } : null
      });
    } catch (error) {
      console.error('Debug endpoint error:', error);
      res.status(500).json({ error: error.message });
    }
  });

router.route('/buying/archive/:id').patch(authenticateUser, archiveOrder);

router
  .route('/selling/:id')
  .get(
    authenticateUser,
    authorizePermissions('view_current_order'),
    getSellerSingleOrder
  );

// order updates routes
router
  .route('/:id/update/fulfillment/fulfilled')
  .patch(
    authenticateUser,
    authorizePermissions('update_order'),
    updateToFulfilled
  );
router
  .route('/:id/update/fulfillment/shipped')
  .patch(
    authenticateUser,
    authorizePermissions('update_order'),
    updateToShipped
  );
router
  .route('/:id/update/fulfillment/delivered')
  .patch(
    authenticateUser,
    authorizePermissions('update_order'),
    updateToDelivered
  );
router
  .route('/:id/update/fulfillment/cancel')
  .patch(
    authenticateUser,
    authorizePermissions('update_order'),
    updateToCancelled
  );
router
  .route('/:id/update/shipping')
  .patch(
    authenticateUser,
    authorizePermissions('update_order'),
    updateShippingInfo
  );

// Suborder routes
router
  .route('/sub/:id/status')
  .patch(
    authenticateUser,
    authorizePermissions('update_order'),
    updateSubOrder
  );

router
  .route('/:id')
  .get(
    authenticateUser,
    authorizePermissions('view_current_order'),
    getSingleOrder
  )
  .patch(authenticateUser, authorizePermissions('update_order'), updateOrder);

router
  .route('/:id/:itemId')
  .patch(
    authenticateUser,
    authorizePermissions('update_order'),
    updateOrderItem
  );

router
  .route('/:id/:itemId/cancel')
  .post(
    authenticateUser,
    authorizePermissions('update_order'),
    cancelSingleOrderProduct
);
  
router
  .route('/:id/cancel')
  .post(
    authenticateUser,
    authorizePermissions('update_order'),
    cancelFullOrder
);
  
module.exports = router;
