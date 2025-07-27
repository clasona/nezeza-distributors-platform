// backend/utils/emailUtils.js

const sendEmail = require('../sendEmail');
const moment = require('moment');
const { formatOrderItems, formatShippingAddress } = require('../formatUtils');
const User = require('../../models/User');
const Store = require('../../models/Store');
const Order = require('../../models/Order');
const SubOrder = require('../../models/SubOrder'); // To get suborder details for full cancellation

const client_url = process.env.CLIENT_URL || 'http://localhost:3000';

const sendSellerNewOrderNotificationEmail = async ({
  sellerStoreId,
  orderId,
  sellerOrderItems,
  sellerSubtotal,
  sellerTax,
  sellerShipping,
}) => {
  const sellerStore = await Store.findById(sellerStoreId);
  if (!sellerStore || !sellerStore.email) {
    console.error(
      `Seller store not found for storeId: ${sellerStoreId}. Cannot send new order email.`
    );
    return;
  }

  const order = await Order.findById(orderId).populate('buyerId');
  if (!order) {
    console.error(
      `Main Order not found for new seller order email. OrderID: ${orderId}`
    );
    return;
  }
  let storeType = 'seller'; // default
  if (sellerStore && sellerStore.storeType) {
    switch (sellerStore.storeType) {
      case 'retail':
        storeType = 'retailer';
        break;
      case 'wholesale':
        storeType = 'wholesaler';
        break;
      case 'manufacturing':
        storeType = 'manufacturer';
        break;
      default:
        storeType = 'seller';
    }
  }
  const orderDate = moment(order.createdAt).format('MMMM D, YYYY');
  const buyerName = order.buyerId
    ? `${order.buyerId.firstName} ${order.buyerId.lastName}`.trim()
    : 'A customer';

  const itemsList = sellerOrderItems
    .map(
      (item) =>
        `<li>${item.title} (Qty: ${item.quantity}) - $${item.price.toFixed(
          2
        )}</li>`
    )
    .join('');

  const totalAmount = (sellerSubtotal + sellerTax + sellerShipping).toFixed(2);

  const shippingAddress = formatShippingAddress(order.shippingAddress);
  const shippingMethod = order.shippingMethod || 'Standard Shipping';

  // Enhanced shipping and order details
  const estimatedDeliveryDate = moment(order.createdAt).add(5, 'days').format('MMMM D, YYYY');
  const buyerContactInfo = order.buyerId ? (
    order.buyerId.email ? `<p><strong>Buyer Email:</strong> ${order.buyerId.email}</p>` : ''
  ) : '';
  const shippingAddressFormatted = formatShippingAddress(order.shippingAddress);
  
  // Enhanced order summary with shipping details
  const orderDetailsSection = `
    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">📦 Order Information</h3>
      <p><strong>Order Date:</strong> ${orderDate}</p>
      <p><strong>Buyer:</strong> ${buyerName}</p>
      ${buyerContactInfo}
      <p><strong>Order Status:</strong> <span style="color: #28a745;">New Order - Action Required</span></p>
    </div>
  `;
  
  const itemsSection = `
    <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">📋 Your Items in This Order</h3>
      <ul style="margin-bottom: 20px; padding-left: 20px;">${itemsList}</ul>
      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin-top: 15px;">
        <p style="margin: 0; font-size: 18px;"><strong>💰 Total Amount (Your Items): $${totalAmount}</strong></p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Subtotal: $${sellerSubtotal.toFixed(2)} | Tax: $${sellerTax.toFixed(2)} | Shipping: $${sellerShipping.toFixed(2)}</p>
      </div>
    </div>
  `;
  
  const shippingSection = `
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">🚚 Shipping & Delivery Information</h3>
      <p><strong>Shipping Method:</strong> ${shippingMethod}</p>
      <p><strong>Estimated Delivery Date:</strong> ${estimatedDeliveryDate}</p>
      <p><strong>Customer Shipping Address:</strong></p>
      <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; font-family: monospace;">
        ${shippingAddressFormatted}
      </div>
      <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin-top: 15px;">
        <p style="margin: 0; color: #0c5460;"><strong>⚠️ Important:</strong> Please ensure items are packaged securely and shipped using the specified method. Update the tracking information in your dashboard once the package is dispatched.</p>
      </div>
    </div>
  `;
  
  const actionSection = `
    <div style="background-color: #fff2cc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <h3 style="color: #333; margin-top: 0;">🎯 Next Steps</h3>
      <p>Please log in to your seller dashboard to:</p>
      <ul style="text-align: left; display: inline-block;">
        <li>Confirm the order and update inventory</li>
        <li>Print shipping labels and packing slips</li>
        <li>Update order status and tracking information</li>
        <li>Communicate with the customer if needed</li>
      </ul>
      <a href="${client_url}/${storeType}" style="display: inline-block; background-color: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">Go to Seller Dashboard</a>
    </div>
  `;


  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎉 New Order Received!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order #${orderId} from ${buyerName}</p>
      </div>
      
      <div style="padding: 0 20px;">
        <p style="font-size: 16px; color: #333; margin: 20px 0;">You have received a new order! Please review the details below and process the order as soon as possible to ensure timely delivery to your customer.</p>
        
        ${orderDetailsSection}
        ${itemsSection}
        ${shippingSection}
        ${actionSection}
        <div style="background: #ffebcc; padding: 15px; border-radius: 5px;">
          <h4 style="margin: 0;">🚚 Next Steps:</h4>
          <ul>
            <li>Confirm the order to move it into processing.</li>
            <li>Ship items using the specified method.</li>
            <li>Update the order status to inform the buyer.</li>
          </ul>
        </div>
        
        <hr style="border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #666; font-size: 14px;">If you have any questions or need assistance, contact our support team at <a href="mailto:support@vesoko.com" style="color: #FF9800;">support@vesoko.com</a>.</p>
        
        <footer style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #888;">
          <p style="margin: 0;">Thank you for selling with VeSoko!</p>
          <p style="margin: 5px 0 0 0; font-weight: bold;">VeSoko Team</p>
        </footer>
      </div>
    </div>
  `;
  return sendEmail({
    to: sellerStore.email,
    subject: `New Order #${orderId} Received – Action Required`,
    html,
  });
};

const sendSellerItemCancellationNotificationEmail = async ({
  sellerStoreId, // ID of the seller's store
  orderId,
  orderItemId,
  cancelledQuantity, // How many units of this item were cancelled
  refundAmount, // Amount refunded for this specific item
  refundReason, // Reason for cancellation
  refundDate,
}) => {
  // Fetch the Order and SubOrder for context
  const order = await Order.findById(orderId);
  const subOrder = await SubOrder.findOne({
    fullOrderId: orderId,
    sellerStoreId: sellerStoreId,
  });

  if (!order || !subOrder) {
    console.error(
      `Order or SubOrder not found for seller cancellation email. OrderID: ${orderId}, SellerStoreID: ${sellerStoreId}`
    );
    return; // Don't send email if critical data is missing
  }

  // Find the specific order item being cancelled from the main order's items
  const cancelledOrderItem = order.orderItems.find(
    (item) => item.product._id.toString() === orderItemId
  );

  if (!cancelledOrderItem) {
    console.error(
      `Cancelled order item not found for email. ItemID: ${orderItemId}`
    );
    return;
  }

  // Fetch the seller's store details (email and name)
  const sellerStore = await Store.findById(sellerStoreId);
  if (!sellerStore || !sellerStore.email) {
    console.error(`Seller store not found for storeId: ${sellerStoreId}`);
    return;
  }

  // Create a temporary item object for formatting with the cancelled quantity
  const itemForEmail = {
    ...cancelledOrderItem.toObject(),
    quantity: cancelledQuantity,
  };

  const formattedRefundDate = refundDate
    ? moment(refundDate).format('MMMM D, YYYY')
    : 'N/A'; // For cases where no refund might occur (e.g., unpaid)

  const message = `
    <p>This is to notify you that an item in Order ID: <strong>${
      subOrder._id
    }</strong> has been cancelled.</p>
    <p><strong>Cancellation Details:</strong></p>
    ${formatOrderItems([itemForEmail])}
    <p><strong>Reason for cancellation:</strong> ${refundReason}</p>
    <p><strong>Refund Amount:</strong> ${
      refundAmount !== undefined
        ? `$${refundAmount.toFixed(2)}`
        : 'N/A (No refund processed or order was unpaid)'
    }</p>
    <p><strong>Refund Date:</strong> ${formattedRefundDate}</p>
    <p>The status of this item has been updated in your order management system.</p>
    <p>A refund has been initiated for this item, and the corresponding amount will be deducted from your account in accordance with our seller policy. Please ensure you review the order and refund details in your seller dashboard for full transparency.</p>
    <p>Please review the order details in your seller dashboard for more information.</p>
  `;

  return sendEmail({
    to: sellerStore.email,
    subject: `Item Cancellation Notification - Order #${orderId}`,
    html: `<h4>Dear ${sellerStore.name || 'Seller'},</h4>${message}`,
  });
};

// New function for full order cancellation notification to seller
const sendSellerFullOrderCancellationEmail = async ({
  sellerStoreId,
  orderId,
  refundDetails,
  buyerName,
}) => {
  // Fetch the Order (needed for its items and order date)
  const order = await Order.findById(orderId);

  const sellerStore = await Store.findById(sellerStoreId);

  // Basic validation to ensure we have enough data to send the email
  if (!order || !sellerStore || !sellerStore.email) {
    console.error(
      `Missing data for full order cancellation email. OrderID: ${orderId}, SellerStoreID: ${sellerStoreId}.`
    );
    return; // Don't send email if critical data is missing
  }

  // Filter the main order's items to get only those belonging to this specific seller
  const itemsFromThisSeller = order.orderItems.filter(
    (item) =>
      item.sellerStoreId &&
      item.sellerStoreId.toString() === sellerStoreId.toString()
  );

  // Calculate total refund amount for THIS seller's items
  const totalSellerRefundAmount = refundDetails.reduce(
    (sum, detail) => sum + detail.refundedAmount,
    0
  );

  // Format refund details for email. This will show specific refunded items.
  let refundedItemsHtml = '';
  if (refundDetails && refundDetails.length > 0) {
    refundedItemsHtml = refundDetails
      .map((detail) => {
        // Find the original order item from the main order for full details
        const originalOrderItem = order.orderItems.find(
          (item) => item._id.toString() === detail.orderItemId
        );
        if (originalOrderItem) {
          // Create a temporary object for formatting with the specific refunded quantity
          const itemForEmail = {
            ...originalOrderItem.toObject(),
            quantity: detail.refundedQuantity, // Use the refunded quantity here
          };
          return `
                  <li>
                      ${formatOrderItems([itemForEmail])}
                      <p>Refunded: $${
                        detail.refundedAmount
                          ? detail.refundedAmount.toFixed(2)
                          : '0.00'
                      }</p>
                  </li>
              `;
        }
        return '';
      })
      .join('');
    refundedItemsHtml = `<ul>${refundedItemsHtml}</ul>`;
  } else {
    refundedItemsHtml =
      '<p>No refunds processed for your items (order was unpaid or refund failed).</p>';
  }

  const message = `
    <p>This is to notify you that Order ID: <strong>${orderId}</strong>, placed by ${
    buyerName || 'a customer'
  }, has been entirely cancelled.</p>
    <p><strong>Order Cancellation Details:</strong></p>
    <p><strong>Order Date:</strong> ${moment(order.createdAt).format(
      'MMMM D,YYYY'
    )}</p>
    <p><strong>Items from your store in this order:</strong></p>
    ${formatOrderItems(itemsFromThisSeller)}
    <p><strong>Refund Summary for your items:</strong></p>
    ${refundedItemsHtml}
    <p><strong>Total Amount Refunded (from your items):</strong> $${totalSellerRefundAmount.toFixed(
      2
    )}</p>
    <p>All items in this order have been marked as cancelled. The corresponding refunds have been processed (if applicable).</p>
    <p>Please review the order details in your seller dashboard for more information.</p>
  `;

  return sendEmail({
    to: sellerStore.email,
    subject: `Full Order Cancellation Notification - Order #${orderId}`,
    html: `<h4>Dear ${sellerStore.name || 'Seller'},</h4>${message}`,
  });
};

module.exports = {
  sendSellerNewOrderNotificationEmail,
  sendSellerItemCancellationNotificationEmail,
  sendSellerFullOrderCancellationEmail,
};
