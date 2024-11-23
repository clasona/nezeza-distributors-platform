// models imports
const User = require('../models/User');
const Store = require('../models/Store');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const Product = require('../models/Product');
const { addProductInventory } = require('../controllers/inventoryController');

const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

/* 
 Update Order Fulfillment Status
 This function is used to update the fulfillment status of a sub-order and the overall order.
 This function checks if the provided fulfillment status is valid.
 If the status is valid, it updates the order and sub-order records.
 If the status is invalid, it throws a Bad Request error.
 */
const updateOrderFulfillmentStatus = async (order, fulfillmentStatus) => {
  // Aggregate statuses from suborders
  const allSubOrders = await SubOrder.find({ fullOrderId: order._id });

  const allFulfilled = allSubOrders.every(
    (sub) => sub.fulfillmentStatus === 'Fulfilled'
  );
  const allDelivered = allSubOrders.every(
    (sub) => sub.fulfillmentStatus === 'Delivered'
  );
  const allShipped = allSubOrders.every(
    (sub) => sub.fulfillmentStatus === 'Shipped'
  );
  const allCancelled = allSubOrders.every(
    (sub) => sub.fulfillmentStatus === 'Cancelled'
  );

  /// if suborders are partially update
  const anyFulfilled = allSubOrders.some(
    (sub) => sub.fulfillmentStatus === 'Fulfilled'
  );
  const anyCancelled = allSubOrders.some(
    (sub) => sub.fulfillmentStatus === 'Cancelled'
  );
  const anyShipped = allSubOrders.some(
    (sub) => sub.fulfillmentStatus === 'Shipped'
  );
  const anyDelivered = allSubOrders.some(
    (sub) => sub.fulfillmentStatus === 'Delivered'
  );
  console.log('Test', allShipped);
  console.log('Test1', anyShipped);
  // Update the full order status based on suborders
  if (allFulfilled) order.fulfillmentStatus = 'Fulfilled';
  if (allShipped) order.fulfillmentStatus = 'Shipped';
  if (allDelivered) order.fulfillmentStatus = 'Delivered';
  if (allCancelled) order.fulfillmentStatus = 'Cancelled';

  // Partiallly Update the full order status based on suborders
  if (!allFulfilled && anyFulfilled)
    order.fulfillmentStatus = 'Partially Fulfilled';
  if (!allShipped && anyShipped) order.fulfillmentStatus = 'Partially Shipped';
  if (!allDelivered && anyDelivered)
    order.fulfillmentStatus = 'Partially Delivered';
  if (!allCancelled && anyCancelled)
    order.fulfillmentStatus = 'Partially Cancelled';

  await order.save();
};

module.exports = updateOrderFulfillmentStatus;
