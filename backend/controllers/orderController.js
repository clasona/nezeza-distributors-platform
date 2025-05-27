// models imports
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const User = require('../models/User');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const SubOrder = require('../models/SubOrder');
const Product = require('../models/Product');
const Address = require('../models/Address');
const Refund = require('../models/Refund');
const { createOrderUtil } = require('../utils/order/createOrderUtil');
const processRefundUtil = require('../utils/payment/refunds');

// utils imports
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  checkPermissions,
  checkWhoIsTheBuyer,
  updateOrderFulfillmentStatus,
  sendNotification,
  // cancelFullOrder,
} = require('../utils');
const {
  sendBuyerPaymentRefundEmail,
  sendBuyerFullOrderRefundEmail,
} = require('../utils/email/buyerPaymentEmailUtils');
const {
  sendSellerItemCancellationNotificationEmail,
  sendSellerFullOrderCancellationEmail,
} = require('../utils/email/sellerOrderEmailUtils');
// helpers imports
const { groupProductsBySeller } = require('../helpers/groupProductsBySeller');
//const {updateOrderFulfillmentStatus} = require('../utils/updateFulfillmentStatus');

/* 
  Get/create dummy payment intent secret
 */
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'someRandomValue';
  return { client_secret, amount };
};

/* 
   Create a new order and group items by seller,
   and create sub-orders for each seller.
   Then, create a payment intent using the fake Stripe API().
   Finally, return the created order and payment intent.
   TODOs: integrate with actual payment processing (like Stripe)
 */
const createOrder = async (req, res) => {
  try {
    const { items: cartItems, shippingFee, paymentMethod } = req.body;
    const buyerId = req.user.userId; // authenticated buyer's id

    // Call the reusable utility
    const result = await createOrderUtil({
      cartItems,
      shippingFee,
      paymentMethod,
      buyerId,
      // You might pass shipping/billing addresses here if they are dynamic
    });

    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    console.error('Error in createOrderController:', error);
    if (error.name === 'CustomError') {
      // Assuming your CustomError has a 'name' property
      return res.status(error.statusCode).json({ msg: error.message });
    }
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Something went wrong, please try again' });
  }
};

/* 
  Get all orders for the authenticated user
  implement filtering and pagination as well
   TODOs: Implement filtering and pagination
 */
const getAllOrders = async (req, res) => {
  const userId = req.user.userId; // Retrieve authenticated user
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError.UnauthorizedError('Not authorized to view orders');
  }
  // Extract query parameters for filtering
  const {
    paymentStatus,
    fulfillmentStatus,
    canceledAt,
    updatedAt,
    createdAt,
    buyerId,
    buyerStoreId,
    limit = 100, // Default limit
    offset = 0, // Default offset
  } = req.query;

  const isIndividualCustomer = !user.storeId; // True if buyer has no storeId (i.e., is a customer)

  const storeId = isIndividualCustomer ? userId : user.storeId;

  // Retrieve suborders for the seller’s store
  const subOrders = await SubOrder.find({
    sellerStoreId: storeId,
    archived: false,
  })
    .populate('buyerStoreId')
    .populate('products.productId');

  // const orders = await SubOrder.find({seller: req.user.userId});
  // console.log(orders)
  if (!subOrders) {
    throw new CustomError.NotFoundError(`No Orders at the moment`);
  }

  const queryObject = { sellerStoreId: storeId };

  if (paymentStatus) queryObject.paymentStatus = paymentStatus;

  if (fulfillmentStatus) queryObject.fulfillmentStatus = fulfillmentStatus;

  if (canceledAt) queryObject.cancelAt = { $gte: new Date(canceledAt) }; // Find orders canceled after this date

  if (updatedAt) queryObject.updatedAt = { $lte: new Date(updatedAt) }; // Find orders updated after this date

  if (createdAt) queryObject.createdAt = { $lte: new Date(createdAt) }; // Find orders created after this date

  if (buyerId) queryObject.buyerId = buyerId; // Assuming this is an ID or buyer's identifier

  if (buyerStoreId) queryObject.buyerStoreId = buyerStoreId;

  // console.log(queryObject);
  // Execute the query with pagination
  const orders = await SubOrder.find(queryObject)
    .populate('sellerStoreId')
    .skip(parseInt(offset))
    .limit(parseInt(limit));
  if (orders.length < 1) {
    return res
      .status(StatusCodes.OK)
      .json({ orders: subOrders, count: subOrders.length });
  }
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

/* 
  Get a single order for the authenticated user(Seller or Buyer)
  Implement filtering and pagination as well
   TODOs: Implement filtering and pagination

 */
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params; // The order ID from the URL params
  const userId = req.user.userId; // get the user ID attached to the request after authentication

  const user = await User.findById(userId);

  const isIndividualCustomer = !user.storeId; // True if buyer has no storeId (i.e., is a customer)

  const storeId = isIndividualCustomer ? userId : user.storeId;

  if (!storeId) {
    throw new CustomError.UnauthorizedError('Not authorized to view order');
  }
  const order = await Order.findOne({ _id: orderId })
    .select('-subOrders')
    .populate('buyerId', '-password')
    .populate('buyerStoreId')
    .populate({
      path: 'orderItems',
      populate: [
        {
          path: 'product',
        },
      ],
    })
    .exec(); //Find the full order by ID

  ///console.log(order);
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  const buyerStoreId = isIndividualCustomer
    ? userId.toString()
    : order.buyerStoreId._id.toString(); // if buyer is requesting, get buyer ID from the order
  if (buyerStoreId !== storeId.toString()) {
    throw new CustomError.UnauthorizedError('Not authorized to view order');
    // return full order to the customer sub-orders from different sellers
  }

  if (buyerStoreId === storeId.toString()) {
    return res.status(StatusCodes.OK).json({ order }); // return full order to the customer
  }
};

/* 
  Get a single order for the authenticated buyer using payment intent id
 */
const getOrderByPaymentIntentId = async (req, res) => {
  const { paymentIntentId } = req.params; // The order ID from the URL params
  const userId = req.user.userId; // get the user ID attached to the request after authentication

  const user = await User.findById(userId);

  const isIndividualCustomer = !user.storeId; // True if buyer has no storeId (i.e., is a customer)

  const storeId = isIndividualCustomer ? userId : user.storeId;

  if (!storeId) {
    throw new CustomError.UnauthorizedError('Not authorized to view order');
  }
  const order = await Order.findOne({ paymentIntentId: paymentIntentId })
    .select('-subOrders')
    .populate('buyerId', '-password')
    .populate('buyerStoreId')
    .populate({
      path: 'orderItems',
      populate: [
        {
          path: 'product',
        },
      ],
    })
    .exec(); //Find the full order by ID

  ///console.log(order);
  if (!order) {
    throw new CustomError.NotFoundError(
      `No order with payment intent id : ${paymentIntentId}`
    );
  }
  const buyerStoreId = isIndividualCustomer
    ? userId.toString()
    : order.buyerStoreId._id.toString(); // if buyer is requesting, get buyer ID from the order
  if (buyerStoreId !== storeId.toString()) {
    throw new CustomError.UnauthorizedError('Not authorized to view order');
    // return full order to the customer sub-orders from different sellers
  }

  if (buyerStoreId === storeId.toString()) {
    return res.status(StatusCodes.OK).json({ order }); // return full order to the customer
  }
};

/* 
  Get a single order for the authenticated user(Seller or Buyer)
  Implement filtering and pagination as well
   TODOs: Implement filtering and pagination

 */
const getSellerSingleOrder = async (req, res) => {
  const { id: orderId } = req.params; // The order ID from the URL params
  const userId = req.user.userId; // get the user ID attached to the request after authentication

  const { storeId } = await User.findById(userId);

  if (!storeId) {
    throw new CustomError.UnauthorizedError('Not authorized to view order');
  }
  const order = await SubOrder.findOne({ _id: orderId });
  // console.log(order);
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  const sellerStoreId = order.sellerStoreId._id.toString(); // if buyer is requesting, get buyer ID from the order

  if (sellerStoreId !== storeId.toString()) {
    throw new CustomError.UnauthorizedError('Not authorized to view order');
    // return full order to the customer sub-orders from different sellers
  }

  if (sellerStoreId === storeId.toString()) {
    return res.status(StatusCodes.OK).json({ order }); // return full order to the customer
  }
};

/*
  Get all orders for the currently authenticated user (Buyer)
 */
const getCurrentUserOrders = async (req, res) => {
  // console.log(req.user);
  const userId = req.user.userId; // Retrieve authenticated user
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError.UnauthorizedError('Not authorized to view orders');
  }

  const isIndividualCustomer = !user.storeId; // True if buyer has no storeId (i.e., is a customer)

  const storeId = isIndividualCustomer ? userId : user.storeId;

  const orders = await Order.find({
    buyerStoreId: storeId,
  }).populate({
    path: 'orderItems',
    populate: [
      {
        path: 'sellerStoreId',
      },
      {
        path: 'product',
      },
    ],
  });
  // if (!orders || orders.length < 1) {
  if (!orders) {
    throw new CustomError.NotFoundError(`No Orders at the moment`);
  }
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const archiveOrder = async (req, res) => {
  const { id } = req.params; // Get the order ID from the URL parameters
  const userId = req.user.userId; // Retrieve authenticated user
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError.UnauthorizedError(
      'Not authorized to archive this order'
    );
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new CustomError.NotFoundError(`Order with id ${id} not found`);
  }
  const isIndividualCustomer = !user.storeId; // True if buyer has no storeId (i.e., is a customer)

  const storeId = isIndividualCustomer ? userId : user.storeId;

  order.fulfillmentStatus = 'Archived';
  await order.save(); // Save the updated order

  res.status(StatusCodes.OK).json({ order });
};

/*
 Update the order fulfillment status, cancellation, payment status to 'Canceled'
 */
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  // Extract userID and UserRole to check if the user making the request is the buyer of the order
  const userId = req.user.userId;
  const { storeId } = await User.findById(userId);
  if (!storeId) {
    throw new CustomError.UnauthorizedError('Not authorized to update order');
  }
  //const userRole = req.user.role;

  // Extract updated fields from request body
  const { paymentIntentId, fulfillmentStatus, shippingAddress, cancelOrder } =
    req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  const subOrders = await SubOrder.find({ fullOrderId: order._id })
    .populate('buyerId', '-password')
    .populate('sellerStoreId', '-password');

  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }

  /*  
  Once the all checks are passed, 
  update the order with payment intent and payment status
  */
  order.paymentIntentId = paymentIntentId;
  order.paymentStatus = 'Paid';
  await order.save();

  if (subOrders.length < 1) {
    throw new CustomError.UnauthorizedError(`No Orders found found.`);
  }

  /* 
  update the sub-order with payment intent and payment status as well
  */
  subOrders.paymentStatus = 'paid';

  // Ensure only the seller can update fulfillment status
  // Find on the sub-order where the seller is the authenticated user
  const subOrder = subOrders.find((subOrder) => {
    if (subOrder.sellerStoreId._id.toString() === storeId.toString()) {
      return subOrder;
    }
  });

  if (!subOrder) {
    throw new CustomError.UnauthorizedError('No order to update.');
  }

  if (fulfillmentStatus) {
    await updateOrderFulfillmentStatus(
      res,
      req,
      subOrder,
      order,
      fulfillmentStatus
    );
  }
};

const updateOrderItem = async (req, res) => {
  const { id: orderId, itemId: orderItemId } = req.params;
  const userId = req.user.userId;
  const { addedToInventory } = req.body; // Only updating this field

  // Find the order
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
  }

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError.UnauthorizedError(`No user with id: ${userId}`);
  }

  // Check authorization based on storeId
  if (!user.storeId) {
    throw new CustomError.UnauthorizedError(
      'Not authorized to update this order'
    );
  }

  // Find the specific orderItem inside orderItems[]
  const orderItemIndex = order.orderItems.findIndex(
    (item) => item._id.toString() === orderItemId
  );
  if (orderItemIndex === -1) {
    throw new CustomError.NotFoundError(
      `No order item with id: ${orderItemId}`
    );
  }

  // Update only the addedToInventory field
  order.orderItems[orderItemIndex].addedToInventory = addedToInventory;

  await order.save(); // Save the updated order

  res
    .status(StatusCodes.OK)
    .json({ orderItem: order.orderItems[orderItemIndex] });
};

const updateSubOrder = async (req, res) => {
  const { id: subOrderId } = req.params;
  // Extract updated fields from request body
  const { paymentIntentId, fulfillmentStatus, shippingAddress, cancelOrder } =
    req.body;

  ///const { storeId } = req.user;
  const userId = req.user.userId;
  const { storeId } = await User.findById(userId);
  // Find the suborder and ensure it belongs to the seller's store
  const subOrder = await SubOrder.findOne({
    _id: subOrderId,
    sellerStoreId: storeId,
  });
  //console.log(subOrderId, storeId);
  if (!subOrder) {
    throw new CustomError.NotFoundError(
      'Suborder not found or you are not authorized to update it'
    );
  }

  const order = await Order.findOne({ _id: subOrder.fullOrderId });

  if (
    !['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(
      fulfillmentStatus
    )
  ) {
    throw new CustomError.BadRequestError('Invalid fulfillment status');
  }
  // Update allowed fields
  if (fulfillmentStatus) {
    subOrder.fulfillmentStatus = fulfillmentStatus;
    await subOrder.save();
    updateOrderFulfillmentStatus(res, req, subOrder, order, fulfillmentStatus);
  }
  //subOrder.fulfillmentStatus = fulfillmentStatus;
  if (shippingAddress) subOrder.shippingAddress = shippingAddress;

  //await subOrder.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Suborder updated successfully',
    data: subOrder,
  });
};

const updateToFulfilled = async (req, res) => {
  const { id: subOrderId } = req.params;
  const { fulfillmentStatus } = req.body; // 'Fulfilled'

  ///const { storeId } = req.user;
  const userId = req.user.userId;
  const { email, storeId } = await User.findById(userId);
  // Find the suborder and ensure it belongs to the seller's store
  const subOrder = await SubOrder.findOne({
    _id: subOrderId,
    sellerStoreId: storeId,
  }).populate('buyerId');

  if (!subOrder) {
    throw new CustomError.NotFoundError(
      'Suborder not found or you are not authorized to update it'
    );
  }
  // console.log(subOrder.fulfillmentStatus);

  // Check current status and ensure valid transition
  if (subOrder.fulfillmentStatus !== 'Pending') {
    throw new CustomError.BadRequestError(
      'SubOrder must be in Pending status to be marked as Fulfilled.'
    );
  }

  const order = await Order.findOne({ _id: subOrder.fullOrderId });

  if (!order) {
    throw new CustomError.NotFoundError('Order not found');
  }

  // Additional logic: Notify the buyer or update stock
  if (fulfillmentStatus === 'Fulfilled') {
    // Update status
    subOrder.fulfillmentStatus = 'Fulfilled';
    // Save changes
    await subOrder.save();
    // Update the fullOrder status
    updateOrderFulfillmentStatus(order);
    const notification = await Notification.create({
      to: subOrder.buyerId.email,
      channel: 'email',
      provider_id: 'Ethereal',
      template: 'order_template',
      data: `Your order: ${subOrder._id} from store: ${storeId} Fulfilled!`,
      trigger_type: 'order_fulfilled',
      resource_typ: subOrder._id,
    });
    //   const data = await sendNotification({
    //     email: subOrder.buyerId.email,
    //     firstName: subOrder.buyerId.firstName,
    //     subject: `Your ${storeId} Order Fulfilled!`,
    //     message: `Your order: ${subOrder._id} from store: ${storeId} Fulfilled!`,
    //   });

    //   await sendNotification({
    //     email,
    //     subject: `${subOrder.buyerStoreId} Order Fulfilled`,
    //     message: `Your order: ${subOrder._id} from your store: ${storeId} has Fulfilled.`,
    //   });
  } else {
    throw new CustomError.BadRequestError(
      'Suborder cannot be marked as Fulfilled'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Order updated to ${fulfillmentStatus}`,
    subOrder,
  });
};

const updateToShipped = async (req, res) => {
  const { id: subOrderId } = req.params;
  const { fulfillmentStatus } = req.body; // 'Fulfilled'

  ///const { storeId } = req.user;
  const userId = req.user.userId;
  const { email, storeId } = await User.findById(userId);
  // Find the suborder and ensure it belongs to the seller's store
  const subOrder = await SubOrder.findOne({
    _id: subOrderId,
    sellerStoreId: storeId,
  }).populate('buyerId');

  if (!subOrder) {
    throw new CustomError.NotFoundError(
      'Suborder not found or you are not authorized to update it'
    );
  }

  if (
    !['Fulfilled', 'Shipped', 'Delivered', 'Cancelled'].includes(
      fulfillmentStatus
    )
  ) {
    throw new CustomError.BadRequestError('Invalid fulfillment status');
  }

  // Check current status and ensure valid transition
  if (subOrder.fulfillmentStatus !== 'Fulfilled') {
    throw new CustomError.BadRequestError(
      'SubOrder must be in Fulfilled status to be marked as Shipped.'
    );
  }

  const order = await Order.findOne({ _id: subOrder.fullOrderId });

  if (!order) {
    throw new CustomError.NotFoundError('Order not found');
  }

  // Validate conditions
  if (subOrder.paymentStatus !== 'Paid') {
    throw new CustomError.BadRequestError('Cannot ship an unpaid order');
  }

  if (!subOrder.shippingDetails || !subOrder?.shippingDetails?.trackingNumber) {
    throw new CustomError.BadRequestError(
      'Shipping details must be provided before marking the order as shipped'
    );
  }

  if (fulfillmentStatus === 'Shipped') {
    // Update status
    subOrder.fulfillmentStatus = 'Shipped';
    // Save changes
    await subOrder.save();
    // Update the fullOrder status
    updateOrderFulfillmentStatus(order, fulfillmentStatus);

    // Notify the buyer and seller that the order has been shipped

    await sendNotification({
      email: subOrder.buyerId.email,
      firstName: subOrder.buyerId.firstName,
      subject: `Your ${storeId} Order has Shipped`,
      message: `Your order: ${subOrder._id} from store: ${storeId} has Shipped.`,
    });
    await sendNotification({
      email,
      subject: 'Your Order Shipped',
      message: `Your order: ${subOrder._id} from your store: ${storeId} has Shipped.`,
    });
  } else {
    throw new CustomError.BadRequestError(
      'Suborder cannot be marked as Shipped'
    );
  }

  // order.shipmentTracking = generateTrackingInfo();
  res.status(StatusCodes.OK).json({
    success: true,
    message: `Order updated to ${fulfillmentStatus}`,
    subOrder,
  });
};

const updateToDelivered = async (req, res) => {
  const { id: subOrderId } = req.params;
  const { fulfillmentStatus } = req.body; // 'Fulfilled'

  ///const { storeId } = req.user;
  const userId = req.user.userId;
  const { email, storeId } = await User.findById(userId);
  // Find the suborder and ensure it belongs to the seller's store
  const subOrder = await SubOrder.findOne({
    _id: subOrderId,
    sellerStoreId: storeId,
  }).populate('buyerId');

  if (!subOrder) {
    throw new CustomError.NotFoundError(
      'Suborder not found or you are not authorized to update it'
    );
  }

  if (
    !['Fulfilled', 'Shipped', 'Delivered', 'Cancelled'].includes(
      fulfillmentStatus
    )
  ) {
    throw new CustomError.BadRequestError('Invalid fulfillment status');
  }

  // Check current status and ensure valid transition
  if (subOrder.fulfillmentStatus !== 'Shipped') {
    throw new CustomError.BadRequestError(
      'SubOrder must be in Shipped status to be marked as Delivered.'
    );
  }

  const order = await Order.findOne({ _id: subOrder.fullOrderId });

  if (!order) {
    throw new CustomError.NotFoundError('Order not found');
  }

  if (fulfillmentStatus === 'Delivered') {
    // Update status
    subOrder.fulfillmentStatus = 'Delivered';
    // Save changes
    await subOrder.save();
    // Update the fullOrder status
    updateOrderFulfillmentStatus(order, fulfillmentStatus);

    // Notify the buyer and seller that the order has been shipped

    await sendNotification({
      email: subOrder.buyerId.email,
      firstName: subOrder.buyerId.firstName,
      subject: `Your ${storeId} Order Delivered`,
      message: `Your order: ${subOrder._id} from store: ${storeId} was delivered.`,
    });
    await sendNotification({
      email,
      subject: 'Your Order Delivered',
      message: `Your order: ${subOrder._id} from your store: ${storeId} was delivered.`,
    });
  } else {
    throw new CustomError.BadRequestError(
      'Suborder cannot be marked as Delivered'
    );
  }

  // order.shipmentTracking = generateTrackingInfo();
  res.status(StatusCodes.OK).json({
    success: true,
    message: `Order updated to ${fulfillmentStatus}`,
    subOrder,
  });
};

const updateToCancelled = async (req, res) => {
  const { id: subOrderId } = req.params;
  const { fulfillmentStatus } = req.body; // 'Fulfilled'

  const userId = req.user.userId;
  const { email, storeId } = await User.findById(userId);
  // Find the suborder and ensure it belongs to the seller's store
  const subOrder = await SubOrder.findOne({
    _id: subOrderId,
    sellerStoreId: storeId,
  }).populate('buyerId');

  if (!subOrder) {
    throw new CustomError.NotFoundError(
      'Suborder not found or you are not authorized to update it'
    );
  }

  // Validate order status
  if (
    ['Fulfilled', 'Shipped', 'Delivered', 'Cancelled'].includes(
      subOrder.fulfillmentStatus
    )
  ) {
    throw new CustomError.BadRequestError(
      'Order cannot be canceled in its current status'
    );
  }

  if ('Cancelled' !== fulfillmentStatus) {
    throw new CustomError.BadRequestError('Invalid cancellation status');
  }

  const order = await Order.findOne({ _id: subOrder.fullOrderId });

  if (!order) {
    throw new CustomError.NotFoundError('Order not found');
  }

  //Refund logic for cancellations
  // if (fulfillmentStatus === 'Cancelled') {
  //   await processRefund(subOrder.paymentIntentId);
  // }

  // Restore inventory for each item
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: item.quantity },
    });
  }

  // // Update status and record cancellation reason
  subOrder.fulfillmentStatus = fulfillmentStatus;
  // subOrder.cancellationReason = reason; will add later
  // Save changes
  await subOrder.save();
  // Update the fullOrder status
  updateOrderFulfillmentStatus(order, fulfillmentStatus);

  // Notify the buyer and seller that the order has been shipped

  await sendNotification({
    email: subOrder.buyerId.email,
    firstName: subOrder.buyerId.firstName,
    subject: `Your ${storeId} Order Cancelled`,
    message: `Your order: ${subOrder._id} from store: ${storeId} was cancelled.`,
  });
  await sendNotification({
    email,
    subject: 'Your Order Cancelled',
    message: `Your order: ${subOrder._id} from your store: ${storeId} was cancelled.`,
  });
  // order.shipmentTracking = generateTrackingInfo();
  res.status(StatusCodes.OK).json({
    success: true,
    message: `Order updated to ${fulfillmentStatus}`,
    subOrder,
  });
};

const updateShippingInfo = async (req, res) => {
  const { id: subOrderId } = req.params;
  const {
    carrier,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
    shipmentStatus,
    shippingNotes,
  } = req.body;

  const userId = req.user.userId;
  const { storeId } = await User.findById(userId);
  // Find the suborder and ensure it belongs to the seller's store
  const subOrder = await SubOrder.findOne({
    _id: subOrderId,
    sellerStoreId: storeId,
  });

  if (!subOrder) {
    throw new CustomError.NotFoundError(
      'Suborder not found or you are not authorized to update it'
    );
  }

  // Update shipping details
  subOrder.shippingDetails = {
    carrier,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
    shipmentStatus,
    shippingNotes,
  };

  await subOrder.save();
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Shipping info updated',
    shippingDetails: subOrder.shippingDetails,
  });
};
const updateRevenueOnOrderPlaced = async (order) => {
  for (const subOrder of order.subOrders) {
    const { sellerId, totalAmount } = subOrder;
    const commissionRate = 0.1; // 10% platform commission
    const commission = totalAmount * commissionRate;
    const netEarnings = totalAmount - commission;

    let sellerRevenue = await SellerRevenue.findOne({ sellerId });

    if (!sellerRevenue) {
      sellerRevenue = new SellerRevenue({ sellerId });
    }

    sellerRevenue.totalSales += totalAmount;
    sellerRevenue.commissionDeducted += commission;
    sellerRevenue.netRevenue += netEarnings;
    sellerRevenue.pendingBalance += netEarnings;

    sellerRevenue.transactions.push({
      orderId: order._id,
      amount: netEarnings,
      type: 'sale',
      date: new Date(),
    });

    await sellerRevenue.save();
  }
};

/**
 *  Cancel a single order product
 * This function allows a buyer to cancel a single product from an order.
 * It checks the order and sub-order status, validates the cancellation quantity,
 * processes a refund if applicable, and updates the order and sub-order accordingly.
 *
 */
const cancelSingleOrderProduct = async (req, res) => {
  const { id: orderId, itemId: productId } = req.params;
  const userId = req.user.userId;
  const { quantity: cancelQuantity, reason: refundReason } = req.body;

  //check id, itemId, and quantity
  if (!orderId || !productId || !cancelQuantity) {
    throw new CustomError.BadRequestError(
      'Order ID, Product ID, and cancellation quantity are required.'
    );
  }

  // Find the order
  const order = await Order.findById(orderId).populate('buyerId');

  if (!order)
    throw new CustomError.NotFoundError(`No order with id: ${orderId}`);

  const subOrder = await SubOrder.findOne({
    fullOrderId: orderId,
    'products.productId': new ObjectId(productId),
  });
  if (!subOrder) {
    throw new CustomError.NotFoundError(
      `No sub-order found for order ${orderId} with product ${productId}`
    );
  }

  const user = await User.findById(userId);
  if (!user)
    throw new CustomError.UnauthorizedError(`No user with id: ${userId}`);

  // Authorization logic for individual vs seller buyers
  const isIndividualCustomer = !user.storeId; // True if buyer has no storeId (i.e., is a customer)
  if (isIndividualCustomer) {
    // Individual customer: must match order.buyerId._id
    if (String(order.buyerId._id) !== String(userId)) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to update this order'
      );
    }
  } else {
    // Seller: must match order.buyerStoreId
    if (String(order.buyerStoreId) !== String(user.storeId)) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to update this order'
      );
    }
  }

  // throw error if order or subOrder is not in 'Pending' fulfillment status
  if (
    order.fulfillmentStatus !== 'Pending' &&
    order.fulfillmentStatus !== 'Partially Cancelled'
  ) {
    throw new CustomError.BadRequestError(
      `Cannot cancel item with order status: '${order.fulfillmentStatus}'.`
    );
  }

  if (
    subOrder.fulfillmentStatus !== 'Pending' &&
    subOrder.fulfillmentStatus !== 'Partially Cancelled'
  ) {
    throw new CustomError.BadRequestError(
      `Cannot cancel item with sub-order status: '${order.fulfillmentStatus}'.`
    );
  }

  // Find the specific orderItem inside orderItems[]
  const orderItemIndex = order.orderItems.findIndex(
    (item) => String(item.product._id) === String(productId)
  );

  if (orderItemIndex === -1) {
    throw new CustomError.NotFoundError(`No order item with id: ${productId}`);
  }
  const orderItem = order.orderItems[orderItemIndex];

  // Calculate already cancelled quantity for this item
  const alreadyCancelled = orderItem.cancelledQuantity || 0;
  const remainingQuantity = orderItem.quantity - alreadyCancelled;

  // Handle: item already fully cancelled
  if (remainingQuantity <= 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'This order item has already been fully cancelled.',
      orderItemId: orderItem._id,
      orderId: orderId,
    });
  }

  // Validate the requested cancellation quantity
  if (cancelQuantity <= 0 || cancelQuantity > remainingQuantity) {
    throw new CustomError.BadRequestError(
      `Invalid cancellation quantity. Must be between 1 and ${remainingQuantity}.`
    );
  }

  let stripeRefundResponse = null; // Initialize to null
  let newRefund = null; // Initialize to null
  let refundStatus = 'N/A'; // Default status if no refund attempt is made (e.g., unpaid order)
  // --- For paid orders, do refund first ---
  if (order.paymentStatus === 'Paid') {
    try {
      // const refundAmount = orderItem.price * cancelQuantity; // Calculate actual amount to refund

      stripeRefundResponse = await processRefundUtil(
        orderId,
        productId,
        cancelQuantity,
        refundReason
      );

      if (stripeRefundResponse && stripeRefundResponse.refundId) {
        newRefund = await Refund.create({
          orderId: orderId,
          subOrderId: stripeRefundResponse.subOrderId,
          orderItemId: orderItem._id,
          productId: orderItem.product._id,
          refundAmount: stripeRefundResponse.refundedAmount,
          currency: order.currency || 'usd',
          refundReason: refundReason || 'Customer cancelled',
          sellerStoreId: orderItem.sellerStoreId, // Assuming this exists on orderItem
          buyerId: order.buyerId._id, // From the main order
          quantityRefunded: cancelQuantity,
          stripeRefundId: stripeRefundResponse.refundId, // Store Stripe's ID
          status: 'completed', // Directly mark as completed
        });
        refundStatus = 'completed'; // Update local status variable

        // Send refund email to buyer
        console.log('Sending refund email to buyer...');
        await sendBuyerPaymentRefundEmail({
          name: order.buyerId.firstName,
          email: order.buyerId.email,
          refundAmount: stripeRefundResponse.refundedAmount,
          refundQuantity: cancelQuantity,
          refundDate: new Date(),
          orderId: orderId,
          orderItemId: orderItem._id.toString(),
        });
        console.log('Refund email sent to buyer successfully');

        //send refund email to seller
        console.log('Sending refund email to seller...');
        await sendSellerItemCancellationNotificationEmail({
          sellerStoreId: orderItem.sellerStoreId,
          orderId: orderId,
          orderItemId: orderItem.product._id.toString(),
          cancelledQuantity: cancelQuantity,
          refundAmount: stripeRefundResponse.refundedAmount,
          refundReason: refundReason,
          refundDate: new Date(),
        });
        console.log('Refund email sent to sellers successfully');
      } else {
        // If Stripe call failed or didn't return a valid ID, we report failure without creating a Refund doc
        // (or you could create a 'failed' one here if you want a record of *attempted* refunds)
        console.error('Stripe refund failed or did not return a valid ID.');
        refundStatus = 'failed';
        // You might still want to return an error here, or decide if item cancellation can proceed without refund record.
        // For now, let's throw an error to prevent item cancellation if refund failed.
        throw new CustomError.BadRequestError(
          'Stripe refund failed. Cannot proceed with item cancellation.'
        );
      }
    } catch (err) {
      console.error('Error during Stripe refund processing:', err);
      if (
        err instanceof CustomError.BadRequestError ||
        err instanceof CustomError.NotFoundError ||
        err instanceof CustomError.UnauthorizedError ||
        err instanceof CustomError.UnauthenticatedError
      ) {
        return res
          .status(err.statusCode || 400)
          .json({ msg: err.message, refundStatus: 'failed' });
      } else {
        return res.status(500).json({
          msg: 'Refund failed',
          error: err.message,
          refundStatus: 'failed',
        });
      }
    }
  } else {
    // If order is not paid, no actual money refund
    refundStatus = 'N/A - Order Unpaid';
  }

  // --- Core Logic for Partial vs. Full Cancellation (Order Item Updates) ---
  // DO NOT modify orderItem.quantity directly. Only update cancelledQuantity and status.
  orderItem.cancelledQuantity = alreadyCancelled + cancelQuantity; // Accumulate cancelled quantity
  if (orderItem.cancelledQuantity === orderItem.quantity) {
    orderItem.status = 'Cancelled'; // Fully cancelled
    subOrder.fulfillmentStatus = 'Cancelled';
    console.log(`Order item fully cancelled: ${orderItem.title}.`);
  } else {
    // This implies orderItem.cancelledQuantity < orderItem.quantity
    orderItem.status = 'Partially Cancelled';
    subOrder.fulfillmentStatus = 'Partially Cancelled';
    console.log(
      `Order item partially cancelled: ${cancelQuantity} of ${orderItem.title} cancelled.`
    );
  }
  // Update overall order fulfillmentStatus
  const allCancelled = order.orderItems.every(
    (item) => item.status === 'Cancelled'
  );

  // Check if any item is partially cancelled OR has any outstanding quantity (not fully cancelled)
  const anyPartiallyCancelledOrOutstanding = order.orderItems.some(
    (item) =>
      item.status === 'Partially Cancelled' ||
      (item.quantity > (item.cancelledQuantity || 0) &&
        item.status !== 'Cancelled')
  );

  if (allCancelled) {
    order.fulfillmentStatus = 'Cancelled';
  } else if (anyPartiallyCancelledOrOutstanding) {
    // If we reach here, it means not all items are fully cancelled.
    // So, if there are any partially cancelled items OR items that still have quantity outstanding,
    // the overall order is partially cancelled.
    // We only set it to 'Partially Cancelled' if it's not already a more specific fulfillment status
    if (
      order.fulfillmentStatus !== 'Partially Shipped' &&
      order.fulfillmentStatus !== 'Shipped' &&
      order.fulfillmentStatus !== 'Delivered'
    ) {
      order.fulfillmentStatus = 'Partially Cancelled';
    }
  }

  // Save the sub-order and full order with updated fulfillment status
  await subOrder.save();
  await order.save();

  console.log(
    'Order item cancellation processed. Refund status:',
    refundStatus
  );

  res.status(StatusCodes.OK).json({
    msg: `Order item ${
      orderItem.status === 'Partially Cancelled' ? 'partially ' : ''
    }cancelled successfully`,
    fulfillmentStatus: order.fulfillmentStatus,
    orderItem: order.orderItems[orderItemIndex],
    refund: newRefund, // Will be null if no refund occurred or Stripe failed
    orderId: orderId,
    refundStatus: refundStatus, // Provide clear refund status in response
  });
};

/**
 * Cancels an entire order, processes refunds for each item, and updates order/item statuses.
 * This operation is wrapped in a MongoDB transaction for atomicity.
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Contains orderId.
 * @param {Object} req.user - Contains userId of the authenticated user.
 * @param {Object} res - Express response object.
 */
const cancelFullOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const userId = req.user.userId;

  if (!orderId) {
    throw new CustomError.BadRequestError('Order ID is required.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the order within the transaction session
    const order = await Order.findById(orderId)
      .populate('buyerId')
      .session(session);

    if (!order) {
      throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
    }

    // Check if the order is already fully cancelled
    if (order.fulfillmentStatus === 'Cancelled') {
      await session.abortTransaction();
      session.endSession();
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: 'This order has already been fully cancelled.',
        orderId: orderId,
      });
    }

    // Find the user performing the cancellation
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new CustomError.UnauthorizedError(`No user with id: ${userId}`);
    }

    // Authorization logic
    const isIndividualCustomer = !user.storeId;
    if (isIndividualCustomer) {
      if (String(order.buyerId._id) !== String(userId)) {
        throw new CustomError.UnauthorizedError(
          'Not authorized to cancel this order'
        );
      }
    } else {
      if (String(order.buyerStoreId) !== String(user.storeId)) {
        throw new CustomError.UnauthorizedError(
          'Not authorized to cancel this order'
        );
      }
    }

    // Throw error if order is not in 'Pending' or 'Partially Cancelled' fulfillment status
    if (
      order.fulfillmentStatus !== 'Pending' &&
      order.fulfillmentStatus !== 'Partially Cancelled'
    ) {
      throw new CustomError.BadRequestError(
        `Cannot fully cancel order with status: '${order.fulfillmentStatus}'.`
      );
    }

    let allRefunds = [];
    let refundStatusOverall = 'N/A - Order Unpaid';

    // Store refund details per seller for later email notification
    const sellerRefundSummaries = {};

    // Fetch all subOrders associated with this main order
    const subOrders = await SubOrder.find({ fullOrderId: orderId }).session(
      session
    );

    // Iterate through each order item for cancellation and potential refund
    for (const orderItem of order.orderItems) {
      const productId = orderItem.product._id;
      const alreadyCancelled = orderItem.cancelledQuantity || 0;
      const remainingQuantity = orderItem.quantity - alreadyCancelled;

      // Only attempt refund if there's quantity left to cancel and order is paid
      if (remainingQuantity > 0 && order.paymentStatus === 'Paid') {
        try {
          const stripeRefundResponse = await processRefundUtil(
            orderId,
            productId,
            remainingQuantity,
            req.body.reason || 'Full order cancellation'
          );

          if (stripeRefundResponse && stripeRefundResponse.refundId) {
            const newRefundDoc = await Refund.create(
              [
                {
                  orderId: orderId,
                  subOrderId: stripeRefundResponse.subOrderId,
                  orderItemId: orderItem._id,
                  productId: productId,
                  refundAmount: stripeRefundResponse.refundedAmount,
                  currency: order.currency || 'usd',
                  refundReason: req.body.reason || 'Full order cancellation',
                  sellerStoreId: orderItem.sellerStoreId,
                  buyerId: order.buyerId._id,
                  quantityRefunded: remainingQuantity,
                  stripeRefundId: stripeRefundResponse.refundId,
                  status: 'completed',
                },
              ],
              { session }
            );
            allRefunds.push(newRefundDoc[0]);
            refundStatusOverall = 'completed';

            // Aggregate refund details for seller email
            const sellerIdString = orderItem.sellerStoreId.toString();
            if (!sellerRefundSummaries[sellerIdString]) {
              sellerRefundSummaries[sellerIdString] = {
                refundDetails: [],
                totalRefundAmount: 0,
                sellerSubtotal: 0,
                sellerTax: 0,
                sellerShipping: 0,
              };
            }
            sellerRefundSummaries[sellerIdString].refundDetails.push({
              orderItemId: orderItem._id.toString(),
              refundedAmount: stripeRefundResponse.refundedAmount,
              refundedQuantity: remainingQuantity,
              title: orderItem.title,
              price: orderItem.price,
              taxRate: orderItem.taxRate,
            });
            sellerRefundSummaries[sellerIdString].totalRefundAmount +=
              stripeRefundResponse.refundedAmount;
          } else {
            console.error(
              `Stripe refund failed for product ${productId} in order ${orderId}.`
            );
            throw new CustomError.BadRequestError(
              `Stripe refund failed for product ${orderItem.title}. Entire order cancellation aborted.`
            );
          }
        } catch (err) {
          console.error(
            `Error during Stripe refund processing for product ${productId}:`,
            err
          );
          if (
            err instanceof CustomError.BadRequestError ||
            err instanceof CustomError.NotFoundError ||
            err instanceof CustomError.UnauthorizedError ||
            err instanceof CustomError.UnauthenticatedError
          ) {
            throw err;
          } else {
            throw new CustomError.InternalServerError(
              `Refund processing failed for product ${orderItem.title}. Error: ${err.message}`
            );
          }
        }
      }

      // Update orderItem status and cancelledQuantity regardless of payment status or refund success
      orderItem.cancelledQuantity = orderItem.quantity;
      orderItem.status = 'Cancelled';
    }

    // --- Clean way: update orderItems and fulfillment status, and save once ---
    order.fulfillmentStatus = 'Cancelled';
    order.markModified('orderItems');
    await order.save({ session });

    // Update fulfillment status for all related SubOrders
    for (const sub of subOrders) {
      sub.fulfillmentStatus = 'Cancelled';
      await sub.save({ session });
    }

    // --- Send Emails AFTER transaction commit ---
    const totalOrderRefundAmount = allRefunds.reduce(
      (sum, refund) => sum + refund.refundAmount,
      0
    );
    if (totalOrderRefundAmount > 0 || order.paymentStatus !== 'Paid') {
      await sendBuyerFullOrderRefundEmail({
        name: order.buyerId.firstName,
        email: order.buyerId.email,
        refundAmount: totalOrderRefundAmount,
        refundDate: new Date(),
        orderId: orderId,
      });
    }

    for (const sellerStoreIdString in sellerRefundSummaries) {
      const summary = sellerRefundSummaries[sellerStoreIdString];
      const buyerName = order.buyerId ? order.buyerId.firstName : 'A customer';
      const sellerOrderItems = order.orderItems.filter(
        (item) => item.sellerStoreId.toString() === sellerStoreIdString
      );
      await sendSellerFullOrderCancellationEmail({
        sellerStoreId: sellerStoreIdString,
        orderId: orderId,
        refundDetails: summary.refundDetails,
        buyerName: buyerName,
      });
    }

    if (order.paymentStatus !== 'Paid') {
      const uniqueSellerStoreIds = [
        ...new Set(
          order.orderItems.map((item) => item.sellerStoreId.toString())
        ),
      ];
      for (const sellerStoreIdString of uniqueSellerStoreIds) {
        if (!sellerRefundSummaries[sellerStoreIdString]) {
          const sellerOrderItems = order.orderItems.filter(
            (item) => item.sellerStoreId.toString() === sellerStoreIdString
          );
          await sendSellerFullOrderCancellationEmail({
            sellerStoreId: sellerStoreIdString,
            orderId: orderId,
            refundDetails: [],
            buyerName: order.buyerId ? order.buyerId.firstName : 'A customer',
            sellerOrderItems: sellerOrderItems,
          });
        }
      }
    }

    // Commit transaction (all changes are saved permanently)
    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({
      msg: 'Entire order cancelled successfully',
      fulfillmentStatus: order.fulfillmentStatus,
      orderId: orderId,
      refunds: allRefunds,
      refundStatus: refundStatusOverall,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error cancelling entire order:', error);

    if (
      error instanceof CustomError.BadRequestError ||
      error instanceof CustomError.NotFoundError ||
      error instanceof CustomError.UnauthorizedError ||
      error instanceof CustomError.UnauthenticatedError
    ) {
      return res.status(error.statusCode || 500).json({ msg: error.message });
    }
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Something went wrong, please try again.' });
  }
};

module.exports = {
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
};
