const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getAllOrders,
  getSingleOrder,
  getSellerSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require('../controllers/orderController');

router
  .route('/')
  .post(authenticateUser, authorizePermissions('create_order'), createOrder)


router.route('/selling').get(authenticateUser, authorizePermissions('view_current_orders'), getAllOrders);

router.route('/buying').get(authenticateUser, authorizePermissions('view_current_order'), getCurrentUserOrders);
router.route('/buying/:id').get(authenticateUser, authorizePermissions('view_current_order'), getSingleOrder);
router.route('/selling/:id').get(authenticateUser, authorizePermissions('view_current_order'), getSellerSingleOrder);

router
  .route('/:id')
  .get(authenticateUser,authorizePermissions('view_current_order'), getSingleOrder)
  .patch(authenticateUser,authorizePermissions('update_order'), updateOrder);

module.exports = router;
