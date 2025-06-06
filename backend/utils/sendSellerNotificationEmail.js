const sendEmail = require('./sendEmail');
const sendSellerNotificationEmail = ({
  buyerName,
  orderId,
  orderItems,
  totalAmount,
  shippingMethod,
  shippingAddress,
  email,
}) => {
  const itemsList = orderItems
    .map(
      (item) =>
        `<li>${item.title} (Qty: ${item.quantity}) - $${item.price}</li>`
    )
    .join('');

  return sendEmail({
    to: email,
    subject: `New Order #${orderId} Received – Action Required`,
    html: `
      <h4>Dear Seller,</h4>
      <p>You have received a new order <strong>#${orderId}</strong> from <strong>${buyerName}</strong>. Please review the details below and process the order as soon as possible.</p>

      <h4>📦 Order Details:</h4>
      <p><strong>Buyer:</strong> ${buyerName}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <ul>${itemsList}</ul>

      <p><strong>💰 Total Amount:</strong> $${totalAmount}</p>
      <p><strong>🚚 Shipping Method:</strong> ${shippingMethod}</p>
       <p>${shippingAddress.street}</p>
      <p>${shippingAddress.apt ? `Apt #${shippingAddress.apt}` : ''}</p>
      <p>${shippingAddress.city}, ${shippingAddress.state} ${
      shippingAddress.zip
    }</p>

      <p>Please log in to your seller dashboard to confirm and fulfill the order:</p>
      <a href="https://nezeza.com/seller-dashboard">Go to Seller Dashboard</a>

      <p>If you have any questions, contact our support team at <a href="mailto:support@nezeza.com">support@nezeza.com</a>.</p>

      <p>Thank you for selling with Nezeza!</p>
      <strong>Nezeza Team</strong>
    `,
  });
};
module.exports = sendSellerNotificationEmail;
