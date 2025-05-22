const { ObjectId } = require('mongoose').Types;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/Order');
const SubOrder = require('../../models/SubOrder');
const CustomError = require('../../errors'); // Adjust path as needed
const { sendBuyerPaymentRefundEmail } = require('../buyerPaymentEmailUtils');

/**
 * Processes a partial refund for a specific product in an order.
 * @param {String} orderId - The main order ID.
 * @param {String} productId - The product ID to refund.
 * @param {Number} quantity - The quantity to refund.
 * @returns {Promise<{ refundId: string, refundedAmount: number }>}
 * @throws {CustomError|Error}
 */
const processRefundUtil = async (orderId, productId, quantity) => {
  console.log(
    'Processing refund for orderId:' +
      orderId +
      ' productId:' +
      productId +
      ' quantity:' +
      quantity
  );
  // Fetch the order
  const order = await Order.findById(orderId)
    .populate('subOrders')
    .populate('buyerId');
  if (!order) {
    throw new CustomError.NotFoundError('Order not found');
  }
  // Ensure order was paid before processing a refund
  if (order.paymentStatus !== 'Paid') {
    throw new CustomError.BadRequestError('Cannot refund an unpaid order');
  }
  // Find the suborder containing this product
  const subOrder = await SubOrder.findOne({
    fullOrderId: orderId,
    'products.productId': new ObjectId(productId),
  });
  if (!subOrder) {
    throw new CustomError.NotFoundError(
      'SubOrder not found for the selected product'
    );
  }
  // Locate the specific item in the orderItems array
  const orderItemIndex = order.orderItems.findIndex(
    (item) => item.product.toString() === productId
  );
  if (orderItemIndex === -1) {
    throw new CustomError.NotFoundError('Product not found in the suborder');
  }
  const orderItem = order.orderItems[orderItemIndex];
  // Ensure requested refund quantity does not exceed purchased quantity
  if (quantity > orderItem.quantity) {
    throw new CustomError.BadRequestError(
      'Requested refund quantity exceeds purchased quantity'
    );
  }

  // Calculate refund amount (price, proportional tax, and shipping)
  const itemPrice = orderItem.price * quantity;
  const itemTax = (orderItem.price * quantity * orderItem.taxRate) / 100;
  const itemShipping = subOrder.totalAmount
    ? (subOrder.totalShipping / subOrder.totalAmount) * itemPrice
    : 0;
  const totalRefundAmount = itemPrice + itemTax + itemShipping;

  // Process refund in Stripe
  let refund;
  if (order.paymentIntentId) {
    refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      amount: Math.round(totalRefundAmount * 100), // Convert to cents
    });
  } else {
    throw new CustomError.BadRequestError(
      'No payment intent attached on this order. Refund failed.'
    );
  }

  // If seller was paid, reverse the transfer
  if (subOrder.transferId) {
    await stripe.transfers.createReversal(subOrder.transferId, {
      amount: Math.round(
        (itemPrice + itemTax + itemShipping - subOrder.transactionFee) * 100
      ),
    });
  }

  // Update the item in orderItems
  if (orderItem.quantity === quantity) {
    // If all items are refunded, remove the product from orderItems
    order.orderItems.splice(orderItemIndex, 1);
  } else {
    // If partially refunded, update the remaining quantity
    orderItem.quantity -= quantity;
  }
  // Deduct the refunded amount from suborder totals
  subOrder.totalAmount -= totalRefundAmount;
  subOrder.totalTax -= itemTax;
  subOrder.totalShipping -= itemShipping;

  // If all items in the suborder are refunded, update status
  if (order.orderItems.length === 0) {
    subOrder.paymentStatus = 'Refunded';
  }

  subOrder.refundId = refund.id;
  order.refundId = refund.id;

  await subOrder.save();
  await order.save();
  console.log('Refund processed successfully:', refund);

  // Send refund email to buyer
  console.log('Sending refund email to buyer...');
  await sendBuyerPaymentRefundEmail({
    name: order.buyerId.firstName,
    email: order.buyerId.email,
    refundAmount: totalRefundAmount,
    refundDate: new Date(),
    orderId: orderId,
    // refundId: refund.id,
    // refundedAmount: totalRefundAmount,
  });
  console.log('Refund email sent successfully');
  return {
    refundId: refund.id,
    refundedAmount: totalRefundAmount,
  };
};

module.exports = processRefundUtil;
