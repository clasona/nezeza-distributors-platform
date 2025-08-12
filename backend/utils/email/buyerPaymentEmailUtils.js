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

  // Enhanced shipping information
  const shippingMethod = order.shippingMethod || 'Standard Shipping';
  const estimatedDeliveryDate = moment(order.estimatedDeliveryDate).format('MMMM D, YYYY');
  
  const orderSummary = `
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">📦 Order Information</h3>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Order Date:</strong> ${moment(order.createdAt).format('MMMM D, YYYY')}</p>
      <p><strong>Order Status:</strong> <span style="color: #28a745;">${order.fulfillmentStatus}</span></p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
      <p><strong>Payment Status:</strong> <span style="color: #28a745;">${order.paymentStatus}</span></p>
      <p><strong>Estimated Delivery Date:</strong> ${estimatedDeliveryDate}</p>
    </div>
    
    <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">🚚 Shipping Information</h3>
      <p><strong>Shipping Method:</strong> ${shippingMethod}</p>
      <p><strong>Shipping Address:</strong></p>
      ${formatShippingAddress(order.shippingAddress)}
    </div>
    
    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">📋 Order Items</h3>
      ${formatOrderItems(order.orderItems)}
    </div>
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
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #4CAF50;">Thank you for your payment!</h2>
      <p>Your order has been successfully confirmed.</p>
      ${orderSummary}
      <h3 style="margin-top: 20px;">Payment Summary</h3>
      ${paymentSummary}
      <hr style="border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #555;">If you have any questions or need assistance with your order, please contact us.</p>
      <footer style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; text-align: center; color: #888;">
        VeSoko Team<br>
        <a href="mailto:support@vesoko.com" style="color: #4CAF50;">support@vesoko.com</a>
      </footer>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'VeSoko Order Confirmation',
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
    subject: 'VeSoko Refund Confirmation',
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
    subject: `VeSoko Full Order Cancellation & Refund - Order #${orderId}`, // Clear subject
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
