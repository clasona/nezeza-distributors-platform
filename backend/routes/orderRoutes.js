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
} = require('../controllers/orderController');

router.route('/').post(createOrder);
//authenticateUser, authorizePermissions('create_order')

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
module.exports = router;
