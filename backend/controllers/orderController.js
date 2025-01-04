// models imports
const User = require('../models/User');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const SubOrder = require('../models/SubOrder');
const Product = require('../models/Product');

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
  Create a new order, group items by seller,
  and create sub-orders for each seller
 */
const createSubOrders = async (fullOrder) => {
  // Group products by seller and prepare sub-orders data
  const subOrdersGrouped = groupProductsBySeller(fullOrder); // Grouped seller data

  const subOrderData = Object.keys(subOrdersGrouped).map((sellerId) => {
    const subOrder = subOrdersGrouped[sellerId];

    // Calculate total amount including tax and shipping
    const totalAmount =
      subOrder.totalAmount + subOrder.totalTax + subOrder.totalShipping;

    // Add transaction fee (10% platform fee example)
    const transactionFee = totalAmount * 0.1;

    return {
      ...subOrder,
      sellerId,
      totalAmount,
      transactionFee,
      fullOrderId: fullOrder._id, // Add reference to the main order
    };
  });

  // Insert all sub-orders in one go and extract their IDs
  const subOrders = await SubOrder.insertMany(subOrderData);
  const subOrderIds = subOrders.map((subOrder) => subOrder._id);

  return subOrderIds;
};

/* 
   Create a new order and group items by seller,
   and create sub-orders for each seller.
   Then, create a payment intent using the fake Stripe API().
   Finally, return the created order and payment intent.
   TODOs: integrate with actual payment processing (like Stripe)
 */
const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee, paymentMethod } = req.body;

  const buyerId = req.user.userId; // authenticated buyer's id

  // Fetch buyer details including their store
  const buyer = await User.findById(buyerId).populate('storeId');
  if (!buyer || !buyer.storeId) {
    throw new CustomError.NotFoundError('The buyer store does not exist.');
  }

  const buyerStore = buyer.storeId; // Store associated with the buyer

  // Check if cart items exist
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }

  // Ensure tax and shipping fee are provided
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      'Please provide tax and shipping fee'
    );
  }

  // Get product IDs from cart and fetch all products at once
  const productIds = cartItems.map((item) => item.product);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  // Initialize order details
  let orderItems = [];
  let subtotal = 0;
  let totalTax = 0;
  let totalShipping = 0;

  // Prepare stock updates to be applied later
  const stockUpdates = [];

  // Loop over cart items and prepare order
  for (const item of cartItems) {
    const dbProduct = dbProducts.find(
      (product) => product._id.toString() === item.product
    );
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No product with id : ${item.product}`
      );
    }

    const {
      title,
      price,
      image,
      _id,
      stock,
      storeId: sellerStoreId,
    } = dbProduct;

    // Check stock availability
    if (item.amount > stock) {
      throw new CustomError.BadRequestError(
        `Not enough stock for product: ${_id}, only ${stock} available`
      );
    }

    // Fetch seller's store
    const sellerStore = await Store.findById(sellerStoreId);

    // Validate buyer's store type can buy from this seller
    checkWhoIsTheBuyer(buyerStore, sellerStore);

    // Add the product as an order item
    const singleOrderItem = {
      quantity: item.amount,
      title,
      price,
      image,
      product: _id,
      sellerStoreId,
    };
    orderItems.push(singleOrderItem);

    // Calculate subtotal, tax, and shipping
    subtotal += item.amount * price;
    totalTax += price * 0.1; // Example 10% tax
    totalShipping += 10; // flat shipping

    // Prepare stock update
    stockUpdates.push({ productId: _id, quantity: item.amount });
  }

  // Calculate total
  const totalPrice = totalTax + totalShipping + subtotal;

  // getting client secret from payment API
  const paymentIntent = await fakeStripeAPI({
    amount: totalPrice,
    currency: 'usd',
  });

  // Create full order
  const order = await Order.create({
    orderItems,
    totalPrice,
    totalTax,
    totalShipping,
    paymentMethod,
    transactionFee: totalPrice * 0.1, // Example platform fee
    shippingAddress: '12345 Airport Blvd Blvd', // Mock data
    billingAddress: '12345 Airport Blvd', // Mock data
    clientSecret: paymentIntent.client_secret,
    buyerId,
    buyerStoreId: buyerStore._id,
    subOrders: [], // SubOrders will be created in the next step
  });

  // Bulk update stock levels for products
  await Promise.all(
    stockUpdates.map(async ({ productId, quantity }) => {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity },
      });
    })
  );

  // Create suborders
  const fullOrder = await createSubOrders(order);
  order.subOrders = fullOrder;
  await order.save();
  console.log('Suborders created:', fullOrder);
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: fullOrder.clientSecret });
};

/* 
  Get all orders for the authenticated user
  implement filtering and pagination as well
   TODOs: Implement filtering and pagination
 */
const getAllOrders = async (req, res) => {
  const userId = req.user.userId; // Retrieve authenticated user
  const user = await User.findById(userId);
  console.log(user);
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
    limit = 10, // Default limit
    offset = 0, // Default offset
  } = req.query;

  const storeId = user.storeId;

  // Retrieve suborders for the seller’s store
  const subOrders = await SubOrder.find({ sellerStoreId: storeId })
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

  console.log(queryObject);
  // Execute the query with pagination
  const filteredOrders = await SubOrder.find(queryObject)
    .skip(parseInt(offset))
    .limit(parseInt(limit));
  console.log(filteredOrders);
  if (filteredOrders.length < 1) {
    return res
      .status(StatusCodes.OK)
      .json({ orders: subOrders, count: subOrders.length });
  }
  res
    .status(StatusCodes.OK)
    .json({ filteredOrders, count: filteredOrders.length });
};

/* 
  Get a single order for the authenticated user(Seller or Buyer)
  Implement filtering and pagination as well
   TODOs: Implement filtering and pagination

 */
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params; // The order ID from the URL params
  const userId = req.user.userId; // get the user ID attached to the request after authentication

  const { storeId } = await User.findById(userId);

  if (!storeId) {
    throw new CustomError.UnauthorizedError('Not authorized to view order');
  }
  const order = await Order.findOne({ _id: orderId })
    .select('-subOrders')
    .populate('buyerId', '-password')
    .populate('buyerStoreId')
    .exec(); //Find the full order by ID
  ///console.log(order);
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  const buyerStoreId = order.buyerStoreId._id.toString(); // if buyer is requesting, get buyer ID from the order
  console.log(buyerStoreId);
  console.log(storeId.toString());
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
  console.log(order);
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
  const userId = req.user.userId; // Retrieve authenticated user
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError.UnauthorizedError('Not authorized to view orders');
  }

  const orders = await Order.find({ buyerStoreId: user.storeId });
  if (!orders || orders.length < 1) {
    throw new CustomError.NotFoundError(`No Orders at the moment`);
  }
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
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
  console.log(subOrder.fulfillmentStatus);

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

module.exports = {
  getAllOrders,
  getSingleOrder,
  getSellerSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  updateSubOrder,
  updateToFulfilled,
  updateToShipped,
  updateToDelivered,
  updateToCancelled,
  updateShippingInfo,
};
