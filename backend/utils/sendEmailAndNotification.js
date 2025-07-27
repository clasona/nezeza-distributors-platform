const sendEmail = require('./sendEmail');
const Notification = require('../models/Notification');

/**
 * Send email and create notification for a user
 * @param {Object} params - Parameters for email and notification
 * @param {string} params.recipientEmail - Recipient's email address
 * @param {string} params.recipientId - Recipient's user ID
 * @param {string} params.senderId - Sender's user ID (optional)
 * @param {string} params.subject - Email subject
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification/email body content
 * @param {string} params.priority - Notification priority ('high', 'medium', 'low')
 * @param {string} params.htmlContent - HTML content for email (optional, will use body if not provided)
 * @returns {Object} Result of both operations
 */
const sendEmailAndNotification = async ({
  recipientEmail,
  recipientId,
  senderId = null,
  subject,
  title,
  body,
  priority = 'medium',
  htmlContent = null,
}) => {
  const results = {
    emailSent: false,
    notificationCreated: false,
    emailError: null,
    notificationError: null,
  };

  // Send email
  try {
    await sendEmail({
      to: recipientEmail,
      subject,
      html: htmlContent || `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3 style="color: #333;">${title}</h3>
        <div style="margin: 20px 0;">
          ${body.replace(/\n/g, '<br>')}
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          Best regards,<br>
          <strong>VeSoko Team</strong>
        </p>
      </div>`,
    });
    results.emailSent = true;
    console.log(`Email sent successfully to ${recipientEmail}`);
  } catch (error) {
    console.error(`Failed to send email to ${recipientEmail}:`, error.message);
    results.emailError = error.message;
  }

  // Create notification
  try {
    const notification = await Notification.create({
      title,
      body,
      priority,
      recipientId,
      senderId,
      read: false,
    });
    results.notificationCreated = true;
    console.log(`Notification created successfully for user ${recipientId}`);
  } catch (error) {
    console.error(`Failed to create notification for user ${recipientId}:`, error.message);
    results.notificationError = error.message;
  }

  return results;
};

/**
 * Send order confirmation email and notification to buyer
 */
const sendOrderConfirmationEmailAndNotification = async ({
  buyerEmail,
  buyerId,
  buyerName,
  orderId,
  orderItems,
  totalAmount,
  shippingAddress,
  estimatedDeliveryDate,
}) => {
  const itemsList = orderItems
    .map(item => `• ${item.title} (Qty: ${item.quantity}) - $${item.price}`)
    .join('\n');

  const title = `Order #${orderId} Confirmed`;
  const body = `Dear ${buyerName},

Thank you for shopping with us! Your order #${orderId} has been successfully placed.

Order Summary:
${itemsList}

Total Amount: $${totalAmount}
Estimated Delivery: ${estimatedDeliveryDate}

Shipping Address:
${shippingAddress.street1}
${shippingAddress.street2 ? shippingAddress.street2 + '\n' : ''}${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}

You will receive updates as your order progresses. You can track your order in your account.

If you have any questions, feel free to contact us at support@vesoko.com.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
      <h2 style="color: #2c5aa0;">Order Confirmation</h2>
      <p>Dear <strong>${buyerName}</strong>,</p>
      <p>Thank you for shopping with us! Your order <strong>#${orderId}</strong> has been successfully placed.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">📦 Order Summary</h3>
        <ul style="list-style: none; padding: 0;">
          ${orderItems.map(item => `<li style="padding: 5px 0; border-bottom: 1px solid #eee;">
            ${item.title} (Qty: ${item.quantity}) - <strong>$${item.price}</strong>
          </li>`).join('')}
        </ul>
        <p style="font-size: 18px; font-weight: bold; color: #2c5aa0; margin: 15px 0 0 0;">
          💰 Total Amount: $${totalAmount}
        </p>
      </div>

      <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #333; margin-top: 0;">🚚 Shipping Information</h4>
        <p style="margin: 5px 0;"><strong>${buyerName}</strong></p>
        <p style="margin: 5px 0;">${shippingAddress.street1}</p>
        ${shippingAddress.street2 ? `<p style="margin: 5px 0;">${shippingAddress.street2}</p>` : ''}
        <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}</p>
        <p style="margin: 15px 0 5px 0;"><strong>🕒 Estimated Delivery:</strong> ${estimatedDeliveryDate}</p>
      </div>

      <p>You will receive an update once your order has been shipped. You can also track your order in your account.</p>
      <p>If you have any questions, feel free to contact us at <a href="mailto:support@vesoko.com">support@vesoko.com</a>.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666;">
        Thank you for choosing VeSoko!<br>
        <strong>VeSoko Team</strong>
      </p>
    </div>
  `;

  return await sendEmailAndNotification({
    recipientEmail: buyerEmail,
    recipientId: buyerId,
    subject: `Your Order #${orderId} Has Been Placed Successfully!`,
    title,
    body,
    priority: 'high',
    htmlContent,
  });
};

/**
 * Send order status update email and notification
 */
const sendOrderStatusUpdateEmailAndNotification = async ({
  buyerEmail,
  buyerId,
  buyerName,
  orderId,
  status,
  storeName,
  trackingNumber = null,
}) => {
  const statusMessages = {
    'Fulfilled': {
      title: `Order #${orderId} Fulfilled`,
      body: `Dear ${buyerName},

Great news! Your order #${orderId} from ${storeName} has been fulfilled and is being prepared for shipment.

You will receive another notification once your order has been shipped with tracking information.`,
      priority: 'medium'
    },
    'Shipped': {
      title: `Order #${orderId} Shipped`,
      body: `Dear ${buyerName},

Your order #${orderId} from ${storeName} has been shipped!

${trackingNumber ? `Tracking Number: ${trackingNumber}\n\nYou can track your package using this tracking number.` : 'You will receive tracking information shortly.'}

Your order should arrive soon!`,
      priority: 'high'
    },
    'Delivered': {
      title: `Order #${orderId} Delivered`,
      body: `Dear ${buyerName},

Your order #${orderId} from ${storeName} has been delivered!

We hope you're satisfied with your purchase. If you have any issues, please don't hesitate to contact us.

Thank you for shopping with VeSoko!`,
      priority: 'medium'
    },
    'Cancelled': {
      title: `Order #${orderId} Cancelled`,
      body: `Dear ${buyerName},

Your order #${orderId} from ${storeName} has been cancelled.

If you were charged for this order, you will receive a full refund within 5-7 business days.

If you have any questions, please contact us at support@vesoko.com.`,
      priority: 'high'
    }
  };

  const messageData = statusMessages[status];
  if (!messageData) {
    throw new Error(`Unknown order status: ${status}`);
  }

  return await sendEmailAndNotification({
    recipientEmail: buyerEmail,
    recipientId: buyerId,
    subject: `${messageData.title} - VeSoko`,
    title: messageData.title,
    body: messageData.body,
    priority: messageData.priority,
  });
};

/**
 * Send seller new order notification
 */
const sendSellerNewOrderEmailAndNotification = async ({
  sellerEmail,
  sellerId,
  sellerName,
  buyerName,
  orderId,
  orderItems,
  totalAmount,
  shippingAddress,
}) => {
  const itemsList = orderItems
    .map(item => `• ${item.title} (Qty: ${item.quantity}) - $${item.price}`)
    .join('\n');

  const title = `New Order #${orderId} Received`;
  const body = `Dear ${sellerName},

You have received a new order #${orderId} from ${buyerName}.

Order Details:
${itemsList}

Total Amount: $${totalAmount}

Shipping Address:
${shippingAddress.street1}
${shippingAddress.street2 ? shippingAddress.street2 + '\n' : ''}${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}

Please log in to your seller dashboard to confirm and fulfill this order.`;

  return await sendEmailAndNotification({
    recipientEmail: sellerEmail,
    recipientId: sellerId,
    subject: `New Order #${orderId} Received – Action Required`,
    title,
    body,
    priority: 'high',
  });
};

module.exports = {
  sendEmailAndNotification,
  sendOrderConfirmationEmailAndNotification,
  sendOrderStatusUpdateEmailAndNotification,
  sendSellerNewOrderEmailAndNotification,
};
