const sendEmail = require('./sendEmail');
const Notification = require('../models/Notification');
const User = require('../models/User');


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
 * @param {string} params.fullOrderId - Full order ID for customer context (optional)
 * @param {string} params.subOrderId - SubOrder ID for specific part of order (optional)
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
  fullOrderId = null,
  subOrderId = null,
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
      html: htmlContent || body,
    });
    results.emailSent = true;
    console.log(`Email sent successfully to ${recipientEmail}`);
  } catch (error) {
    console.error(`Failed to send email to ${recipientEmail}:`, error.message);
    results.emailError = error.message;
  }

  // Create notification
  try {
    const notificationData = {
      title,
      body,
      priority,
      recipientId,
      senderId,
      read: false,
    };
    
    // Add order context if provided
    if (fullOrderId) {
      notificationData.fullOrderId = fullOrderId;
    }
    if (subOrderId) {
      notificationData.subOrderId = subOrderId;
    }
    
    const notification = await Notification.create(notificationData);
    results.notificationCreated = true;
    // console.log(`Notification created successfully for user ${recipientId}`);
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

  const title = `Order #${orderId} Placed`;
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
  buyerId,
  orderId, // This is currently the subOrderId
  fullOrderId = null, // Add fullOrderId parameter
  status,
  trackingInfo = null,
  storeName = '',
  subOrderItems = [] // Add subOrderItems parameter
}) => {
  const buyer = await User.findById(buyerId);
  if (!buyer) {
    throw new Error('Buyer not found');
  }
  const { firstName: buyerName, email: buyerEmail } = buyer;
  
  // Create item list description
  let itemsDescription = '';
  if (subOrderItems && subOrderItems.length > 0) {
    const itemsList = subOrderItems
      .map(item => `• ${item.title} (Qty: ${item.quantity})`)
      .join('\n');
    itemsDescription = `\n\nItems in this shipment:\n${itemsList}`;
  }
  
  // Create contextual order description
  let orderDescription;
  if (fullOrderId && fullOrderId !== orderId) {
    orderDescription = storeName 
      ? `items from ${storeName} in your order #${fullOrderId}` 
      : `items in your order #${fullOrderId}`;
  } else {
    orderDescription = storeName 
      ? `your order #${orderId} from ${storeName}` 
      : `your order #${orderId}`;
  }
  
  const statusMessages = {
    'Processing': {
      title: `Order Update: Processing Started`,
      body: `Dear ${buyerName},\n\nGreat news! Your ${orderDescription} is now being processed. We'll prepare your items for shipment shortly.${itemsDescription}\n\nYou will receive another notification once your order is ready to ship.`,
      priority: 'medium',
    },
    'Awaiting Shipment': {
      title: `Order Update: Ready to Ship`,
      body: `Dear ${buyerName},\n\nYour ${orderDescription} is packaged and ready to ship!${itemsDescription}\n\n${trackingInfo && trackingInfo.trackingNumber ? `Tracking Number: ${trackingInfo.trackingNumber}\nCarrier: ${trackingInfo.carrier}\n\nYou can track your package using the tracking number above.` : 'Tracking information will be provided once the order ships.'}`,
      priority: 'medium',
    },
    'Shipped': {
      title: `Order Update: Package Shipped`,
      body: `Dear ${buyerName},\n\nYour ${orderDescription} is on its way!${itemsDescription}\n\n${trackingInfo && trackingInfo.trackingNumber ? `Tracking Number: ${trackingInfo.trackingNumber}\nCarrier: ${trackingInfo.carrier}\n\nYou can track your package using the tracking number above.` : 'Tracking information will be updated shortly.'}`,
      priority: 'high',
    },
    'Delivered': {
      title: `Order Update: Package Delivered`,
      body: `Dear ${buyerName},\n\nYour ${orderDescription} has been delivered!${itemsDescription}\n\nWe hope you're satisfied with your purchase. If you have any issues, please don't hesitate to contact us.\n\nThank you for shopping with VeSoko!`,
      priority: 'medium',
    },
    'Cancelled': {
      title: `Order Update: Package Cancelled`,
      body: `Dear ${buyerName},\n\nYour ${orderDescription} has been cancelled.${itemsDescription}\n\nIf you were charged for this order, you will receive a full refund within 5-7 business days.\n\nIf you have any questions, please contact us at support@vesoko.com.`,
      priority: 'high',
    },
  };
  
  const messageData = statusMessages[status] || statusMessages['Processing'];
  
  return await sendEmailAndNotification({
    recipientEmail: buyerEmail,
    recipientId: buyerId,
    subject: `${messageData.title} - VeSoko`,
    title: messageData.title,
    body: messageData.body,
    priority: messageData.priority,
    fullOrderId: fullOrderId,
    subOrderId: orderId, // orderId is actually the subOrderId
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

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
      <h2 style="color: #2c5aa0;">New Order Received</h2>
      <p>Dear <strong>${sellerName}</strong>,</p>
      <p>You have received a new order <strong>#${orderId}</strong> from <strong>${buyerName}</strong>.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">📦 Order Details</h3>
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
      </div>

      <p>Please log in to your seller dashboard to confirm and fulfill this order.</p>
      <p>If you have any questions, feel free to contact us at <a href="mailto:support@vesoko.com">support@vesoko.com</a>.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666;">
        Thank you for choosing VeSoko!<br>
        <strong>VeSoko Team</strong>
      </p>
    </div>
  `;

  return await sendEmailAndNotification({
    recipientEmail: sellerEmail,
    recipientId: sellerId,
    subject: `New Order #${orderId} Received – Action Required`,
    title,
    body,
    priority: 'high',
    htmlContent,
  });
};

module.exports = {
  sendEmailAndNotification,
  sendOrderConfirmationEmailAndNotification,
  sendOrderStatusUpdateEmailAndNotification,
  sendSellerNewOrderEmailAndNotification,
};
