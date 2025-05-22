// models imports
const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const SubOrder = require('../models/SubOrder');
const Product = require('../models/Product');
const Address = require('../models/Address');
const { createOrderUtil } = require('../utils/order/createOrderUtil');
const processRefundUtil  = require('../utils/payment/refunds');

// utils imports
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  checkPermissions,
  checkWhoIsTheBuyer,
  updateOrderFulfillmentStatus,
  sendNotification,
  cancelFullOrder,
} = require('../utils');

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
 * Return a single product from an order and process its refund.
 */
const cancelSingleOrderProduct = async (req, res) => {
  const { id: orderId, itemId: productId } = req.params;
  const userId = req.user.userId;
  const { quantity } = req.body;

  // Find the order
  const order = await Order.findById(orderId);
  
  if (!order)
    throw new CustomError.NotFoundError(`No order with id: ${orderId}`);

  const user = await User.findById(userId);
  if (!user)
    throw new CustomError.UnauthorizedError(`No user with id: ${userId}`);

  // Authorization logic for individual vs seller buyers
  const isIndividualCustomer = !user.storeId; // True if buyer has no storeId (i.e., is a customer)
  if (isIndividualCustomer) {
    // Individual customer: must match order.buyerId
    if (String(order.buyerId) !== String(userId)) {
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

  // Find the specific orderItem inside orderItems[]
  const orderItemIndex = order.orderItems.findIndex(
    (item) => String(item.product._id) === String(productId)
  );

  if (orderItemIndex === -1) {
    throw new CustomError.NotFoundError(`No order item with id: ${productId}`);
  }

  // Handle: item already cancelled
  if (order.orderItems[orderItemIndex].status === 'Cancelled') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'This order item has already been cancelled.',
      orderItemId: order.orderItems[orderItemIndex]._id,
      orderId: orderId,
    });
  }

  // --- For paid orders, do refund first ---
  let refundResult = null;
  if (order.paymentStatus === 'Paid') {
    try {
      refundResult = await processRefundUtil(orderId, productId, quantity);
    } catch (err) {
      console.error('Return/refund error:', err);
      if (err instanceof CustomError) {
        return res.status(err.statusCode || 400).json({ msg: err.message });
      } else {
        return res
          .status(500)
          .json({ msg: 'Refund failed', error: err.message });
      }
    }
  }

  // Mark the item as cancelled
  order.orderItems[orderItemIndex].status = 'Cancelled';
  //TODO: In the future, allow just reducing the item quantity and update item status accordingly

  // Update fulfillmentStatus
  const allCancelled = order.orderItems.every(
    (item) => item.status === 'Cancelled'
  );
  order.fulfillmentStatus = allCancelled ? 'Cancelled' : 'Partially Cancelled';

  
  await order.save();

  console.log('Order item cancelled:', order.orderItems[orderItemIndex]._id);

  res.status(StatusCodes.OK).json({
    msg: 'Order item cancelled successfully',
    fulfillmentStatus: order.fulfillmentStatus,
    orderItem: order.orderItems[orderItemIndex],
    refund: refundResult,
    orderId: orderId,
  });
};




// TODO: Implement cancelFullOrder
// const cancelFullOrder = async (req, res) => { }
  
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
};
