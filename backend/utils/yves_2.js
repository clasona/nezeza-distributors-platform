const { ObjectId } = require('mongoose').Types;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/Order');
const SubOrder = require('../../models/SubOrder');
const CustomError = require('../../errors'); // Adjust path as needed
const { sendBuyerPaymentRefundEmail } = require('../buyerPaymentEmailUtils');

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
const processRefundUtil = async (orderId, productId, quantity) => {
  // Fetch the order
  const order = await Order.findById(orderId)
    .populate('subOrders') // Still needed for transferId
    .populate('buyerId'); // Still needed for email
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
  const orderItem = order.orderItems.find(
    (item) => item.product.toString() === productId
  );
  if (!orderItem) {
    throw new CustomError.NotFoundError(
      'Product not found in the main order items'
    );
  }

  // Ensure requested refund quantity does not exceed purchased quantity
  // This is a crucial check before attempting any refund
  if (quantity > orderItem.quantity) {
    // Using orderItem.quantity as original purchase quantity
    throw new CustomError.BadRequestError(
      'Requested refund quantity exceeds purchased quantity'
    );
  }

  // Calculate refund amount (item price, proportional tax, and proportional shipping)
  // These calculations are done based on the original order item and suborder details.
  const itemPrice = orderItem.price * quantity;
  const itemTax = (orderItem.taxRate / 100) * itemPrice; // Calculate tax on the itemPrice
  // Calculate proportional shipping based on the item's contribution to the suborder's total amount
  const itemShipping = subOrder.totalAmount
    ? (subOrder.totalShipping / subOrder.totalAmount) * itemPrice
    : 0; // If subOrder.totalAmount is 0, shipping is 0
  const totalRefundAmount = itemPrice + itemTax + itemShipping;

  // Process refund in Stripe
  let refund;
  if (order.paymentIntentId) {
    refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      amount: Math.round(totalRefundAmount * 100), // Convert to cents
      // Optionally add metadata for traceability in Stripe
      metadata: {
        orderId: orderId.toString(),
        productId: productId.toString(),
        quantityRefunded: quantity,
      },
    });
  } else {
    throw new CustomError.BadRequestError(
      'No payment intent attached to this order. Refund failed.'
    );
  }

  // If seller was paid (via Stripe Connect transfer), reverse the transfer for the refunded amount
  if (subOrder.transferId) {
    // Calculate the amount to reverse from the seller.
    // This should reflect the money the seller received for the portion of items being refunded.
    // It should include the item price, tax, and shipping, less any transaction fees *on that portion*.
    // This calculation can be complex depending on your fee structure.
    // For simplicity, here, let's assume we're reversing the same proportional amount as refunded to buyer.
    // You might need to adjust this calculation based on how you handle fees and payouts.
    const amountToReverseFromSeller = itemPrice + itemTax + itemShipping; // Adjust as per your fee logic

    // Ensure you don't attempt to reverse more than what was transferred
    if (amountToReverseFromSeller > 0) {
      // Only reverse if there's an amount to reverse
      await stripe.transfers.createReversal(subOrder.transferId, {
        amount: Math.round(amountToReverseFromSeller * 100), // Convert to cents
        // Optionally add metadata
        metadata: {
          orderId: orderId.toString(),
          productId: productId.toString(),
          quantityRefunded: quantity,
          subOrderId: subOrder._id.toString(),
        },
      });
    }
  }

  // Send refund email to buyer (This can remain here or be moved to the controller if preferred)
  console.log('Sending refund email to buyer...');
  await sendBuyerPaymentRefundEmail({
    name: order.buyerId.firstName,
    email: order.buyerId.email,
    refundAmount: totalRefundAmount,
    refundDate: new Date(),
    orderId: orderId,
  });
  console.log('Refund email sent successfully');

  // Return key refund details
  return {
    stripeRefundId: refund.id, // Renamed for clarity in the controller
    refundedAmount: totalRefundAmount,
  };
};

module.exports = { processRefundUtil }; // Export as an object if there are other utils
