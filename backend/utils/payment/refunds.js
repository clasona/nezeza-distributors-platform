const { ObjectId } = require('mongoose').Types;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/Order');
const SubOrder = require('../../models/SubOrder');
const CustomError = require('../../errors');
const {
  sendBuyerPaymentRefundEmail,
} = require('../email/buyerPaymentEmailUtils');
const {
  sendSellerItemCancellationNotificationEmail,
} = require('../email/sellerOrderEmailUtils');

/**
 * Processes a partial refund for a specific product in an order via Stripe
 * and handles associated transfer reversals.
 * This utility does NOT modify the Order or SubOrder documents directly.
 * @param {String} orderId - The main order ID.
 * @param {String} productId - The product ID to refund.
 * @param {Number} quantity - The quantity to refund.
 * @returns {Promise<{ refundId: string, refundedAmount: number }>} - Returns Stripe's refund ID and the amount refunded.
 * @throws {CustomError|Error}
 */
const processRefundUtil = async (
  orderId,
  productId,
  quantity,
  refundReason
) => {
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
  // We need this to identify the specific seller's portion and transferId
  const subOrder = await SubOrder.findOne({
    fullOrderId: orderId,
    'products.productId': new ObjectId(productId),
  });
  if (!subOrder) {
    throw new CustomError.NotFoundError(
      'SubOrder not found for the selected product'
    );
  }

  // Locate the specific item in the main order's orderItems array
  // This is used to get the original price and tax rate of the item
  const orderItemIndex = order.orderItems.findIndex(
    (item) => item.product.toString() === String(productId)
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
  const itemTax = (orderItem.taxRate / 100) * itemPrice;
  const itemShipping = subOrder.totalAmount
    ? (subOrder.totalShipping / subOrder.totalAmount) * itemPrice
    : 0;
  const totalRefundAmount = itemPrice + itemTax + itemShipping;

  // Process refund in Stripe
  let refund;
  try {
    if (order.paymentIntentId) {
      refund = await stripe.refunds.create({
        payment_intent: order.paymentIntentId,
        amount: Math.round(totalRefundAmount * 100), // Convert to cents
        // Optionally add metadata for traceability in Stripe
        metadata: {
          orderId: orderId.toString(),
          subOrderId: subOrder._id.toString(),
          productId: productId.toString(),
          quantityRefunded: quantity,
        },
      });
    } else {
      throw new CustomError.BadRequestError(
        'No payment intent attached to this order. Refund failed.'
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

    // // Update the item in orderItems
    // if (orderItem.quantity === quantity) {
    //   // If all items are refunded, remove the product from orderItems
    //   order.orderItems.splice(orderItemIndex, 1);
    // } else {
    //   // If partially refunded, update the remaining quantity
    //   orderItem.quantity -= quantity;
    // }
    // Deduct the refunded amount from suborder totals
    // subOrder.totalAmount -= totalRefundAmount;
    // subOrder.totalTax -= itemTax;
    // subOrder.totalShipping -= itemShipping;

    // If all items in the suborder are refunded, update status
    // if (order.orderItems.length === 0) {
    //   subOrder.paymentStatus = 'Refunded';
    // }

    // subOrder.refundId = refund.id;
    // order.refundId = refund.id;

    // await subOrder.save();
    // await order.save();
    console.log('Refund processed successfully...');
  } catch (error) {
    // Log the real Stripe error for debugging
    console.error('Error during Stripe refund processing:', error);

    // Show a generic error to the customer
    throw new CustomError.BadRequestError(
      "We couldn't process your refund. Please contact customer support."
    );
  }
  // // Send refund email to buyer
  // console.log('Sending refund email to buyer...');
  // await sendBuyerPaymentRefundEmail({
  //   name: order.buyerId.firstName,
  //   email: order.buyerId.email,
  //   refundAmount: totalRefundAmount,
  //   refundQuantity: quantity,
  //   refundDate: new Date(),
  //   orderId: orderId,
  //   orderItemId: orderItem._id.toString(),
  // });
  // console.log('Refund email sent to buyer successfully');

  // //send refund email to seller
  // console.log('Sending refund email to seller...');
  // await sendSellerItemCancellationNotificationEmail({
  //   sellerStoreId: subOrder.sellerStoreId,
  //   orderId: orderId,
  //   orderItemId: orderItem.product._id.toString(),
  //   cancelledQuantity: quantity,
  //   refundAmount: totalRefundAmount,
  //   refundReason: refundReason,
  //   refundDate: new Date(),
  // });

  return {
    refundId: refund.id,
    refundedAmount: totalRefundAmount,
    subOrderId: subOrder._id.toString(),
  };
};

module.exports = processRefundUtil;
