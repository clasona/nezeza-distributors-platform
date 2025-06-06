const sendEmail = require('./sendEmail');
const sendBuyerNotificationEmail = async ({
  buyerName,
  orderId,
  orderItems,
  totalAmount,
  shippingMethod,
  shippingAddress,
  estimatedDeliveryDate,
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
    subject: `Your Order #${orderId} Has Been Placed Successfully!`,
    html: `
      <h4>Dear ${buyerName},</h4>
      <p>Thank you for shopping with us! Your order <strong>#${orderId}</strong> has been successfully placed. Below are your order details:</p>
      
      <h4>📦 Order Summary:</h4>
      <ul>${itemsList}</ul>

      <p><strong>💰 Total Amount:</strong> $${totalAmount}</p>
      <p><strong>🚚 Shipping Method:</strong> ${shippingMethod}</p>
      <p><strong>${buyerName}</strong></p>
      <p>${shippingAddress.street}</p>
      <p>${shippingAddress.apt ? `Apt #${shippingAddress.apt}` : ''}</p>
      <p>${shippingAddress.city}, ${shippingAddress.state} ${
      shippingAddress.zip
    }</p>
      <p><strong>🕒 Estimated Delivery:</strong> ${estimatedDeliveryDate}</p>

      <p>You will receive an update once your order has been shipped. You can also track your order in your account.</p>

      <p>If you have any questions, feel free to contact us at <a href="mailto:support@nezeza.com">support@nezeza.com</a>.</p>

      <p>Thank you for choosing Nezeza!</p>
      <strong>Nezeza Team</strong>
    `,
  });
};

module.exports = sendBuyerNotificationEmail;
