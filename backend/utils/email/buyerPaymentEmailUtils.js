const sendEmail = require('../sendEmail');
const moment = require('moment');
// const getOrderDetails = require('./order/getOrderDetails');
const { formatOrderItems, formatShippingAddress } = require('../formatUtils');
const Order = require('../../models/Order');

// Payment confirmation email
const sendBuyerPaymentConfirmationEmail = async ({ name, email, orderId }) => {
  // const order = await getOrderDetails(orderId);
  const order = await Order.findById(orderId);

  if (!order) throw new Error('Order not found for confirmation email');

  const orderSummary = `
    <p><strong>Order Date:</strong> ${moment(order.createdAt).format(
      'MMMM D, YYYY'
    )}</p>
    <p><strong>Order Status:</strong> ${order.fulfillmentStatus}</p>
    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
    <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
    <p><strong>Shipping Address:</strong> ${formatShippingAddress(
      order.shippingAddress
    )}</p>
    <p><strong>Items:</strong></p>
    ${formatOrderItems(order.orderItems)}
  `;

  const paymentSummary = `
    <p><strong>Subtotal:</strong> $${(
      order.totalAmount -
      order.totalTax -
      order.totalShipping
    ).toFixed(2)}</p>
    <p><strong>Tax:</strong> $${order.totalTax.toFixed(2)}</p>
    <p><strong>Shipping:</strong> $${order.totalShipping.toFixed(2)}</p>
    <p><strong>Grand Total:</strong> $${order.totalAmount.toFixed(2)}</p>
  `;

  const message = `
    <p>Thank you for your payment! Your order has been successfully confirmed.</p>
    ${orderSummary}
    <p><strong>--- Payment Summary ---</strong></p>
    ${paymentSummary}
    <p>If you have any questions or need assistance with your order, please contact us.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Nezeza Order Confirmation',
    html: `<h4>Dear ${name},</h4>${message}`,
  });
};

// Payment failure email
const sendBuyerPaymentFailureEmail = async ({
  name,
  email,
  supportEmail,
  orderId,
}) => {
  const order = await Order.findById(orderId);

  let orderSummary = '';
  if (order) {
    orderSummary = `
      <p><strong>Order Date:</strong> ${moment(order.createdAt).format(
        'MMMM D, YYYY'
      )}</p>
      <p><strong>Items:</strong></p>
      ${formatOrderItems(order.orderItems)}
    `;
  }

  const message = `
    <p>We apologize, but your payment could not be processed. Please review your payment details and try again, or contact our support team for assistance.</p>
    ${orderSummary}
    <p>For help, reach out to us at: <a href="mailto:${supportEmail}">${supportEmail}</a></p>
  `;

  return sendEmail({
    to: email,
    subject: 'Payment Issue',
    html: `<h4>Dear ${name},</h4>${message}`,
  });
};

// Payment refund email
const sendBuyerPaymentRefundEmail = async ({
  name,
  email,
  refundAmount,
  refundQuantity,
  refundDate,
  orderId,
  orderItemId,
}) => {
  const order = await Order.findById(orderId);
  const orderItem = order.orderItems.find(
    (item) => item._id.toString() === orderItemId
  );

  //Update with the refunded quantity
  if (orderItem) {
    orderItem.quantity = refundQuantity;
  }

  let orderSummary = '';
  if (order) {
    orderSummary = `
      <p><strong>Order Date:</strong> ${moment(order.createdAt).format(
        'MMMM D, YYYY'
      )}</p>
      <p><strong>Items:</strong></p>
      ${formatOrderItems([orderItem])}
    `;
  }

  const formattedRefundDate = refundDate
    ? moment(refundDate).format('MMMM D, YYYY')
    : 'shortly';

  const message = `
    <p>This email confirms that your order has been cancelled and a refund of <strong>$${refundAmount.toFixed(
      2
    )}</strong> has been processed on <strong>${formattedRefundDate}</strong>.</p>
    ${orderSummary}
    <p>The refunded amount should appear in your account within a few business days. Please allow for bank processing time.</p>
    <p>If you have any questions regarding this refund, please contact our support team.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Nezeza Refund Confirmation',
    html: `<h4>Dear ${name},</h4>${message}`,
  });
};

const sendBuyerFullOrderRefundEmail = async ({
  name,
  email,
  refundAmount, // This is the total refund amount for the entire order
  refundDate,
  orderId,
}) => {
  const order = await Order.findById(orderId);

  // If order not found, log and return (or throw)
  if (!order) {
    console.error(`Order not found for full refund email. OrderID: ${orderId}`);
    return;
  }

  const formattedRefundDate = refundDate
    ? moment(refundDate).format('MMMM D, YYYY')
    : 'shortly';

  const message = `
    <p>This email confirms that your entire order (Order ID: <strong>${orderId}</strong>) has been cancelled, and a refund of <strong>$${refundAmount.toFixed(
    2
  )}</strong> has been processed on <strong>${formattedRefundDate}</strong>.</p>
    <p><strong>Order Details:</strong></p>
    <p><strong>Order Date:</strong> ${moment(order.createdAt).format(
      'MMMM D, YYYY'
    )}</p>
    <p><strong>All Items in this Order:</strong></p>
    ${formatOrderItems(order.orderItems)}
    <p>The total refunded amount should appear in your account within a few business days. Please allow for bank processing time.</p>
    <p>If you have any questions regarding this refund, please contact our support team.</p>
  `;

  return sendEmail({
    to: email,
    subject: `Nezeza Full Order Cancellation & Refund - Order #${orderId}`, // Clear subject
    html: `<h4>Dear ${name},</h4>${message}`,
  });
};

// Payment reminder email
const sendBuyerPaymentReminderEmail = async ({
  name,
  email,
  amount,
  dueDate,
  paymentLink,
  orderId,
}) => {
  const order = await Order.findById(orderId);

  let orderSummary = '';
  if (order) {
    orderSummary = `
      <p><strong>Order Date:</strong> ${moment(order.createdAt).format(
        'MMMM D, YYYY'
      )}</p>
      <p><strong>Items:</strong></p>
      ${formatOrderItems(order.orderItems)}
    `;
  }

  const formattedDueDate = moment(dueDate).format('MMMM D, YYYY');

  const message = `
    <p>This is a reminder that your payment of <strong>$${amount.toFixed(
      2
    )}</strong> is due by <strong>${formattedDueDate}</strong> to complete your order.</p>
    ${orderSummary}
    <p>Please complete your payment using the link below:</p>
    <p><a href="${paymentLink}">Make Payment</a></p>
    <p>If you have already made the payment, please disregard this email.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Payment Reminder',
    html: `<h4>Dear ${name},</h4>${message}`,
  });
};

module.exports = {
  sendBuyerPaymentConfirmationEmail,
  sendBuyerPaymentFailureEmail,
  sendBuyerPaymentRefundEmail,
  sendBuyerFullOrderRefundEmail,
  sendBuyerPaymentReminderEmail,
};
