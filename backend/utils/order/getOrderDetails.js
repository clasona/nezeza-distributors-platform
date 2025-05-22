const Order = require('../../models/Order');
const Address = require('../../models/Address');
const User = require('../../models/User');
const Store = require('../../models/Store');
const mongoose = require('mongoose');
const CustomError = require('../../errors');
const SubOrder = require('../../models/SubOrder');


const getOrderDetails = async (orderId) => {
  try {
    if (orderId) {
      const order = await Order.findById(orderId);
      const buyer = await User.findById(order.buyerId);
      const sellerStore = await Store.findById(order.sellerStoreId);
      const shippingAddress = await Address.findById(order.shippingAddress._id);

      if (order) {
        return {
          totalAmount: order.totalAmount,
          totalTax: order.totalTax,
          totalShipping: order.totalShipping,
          transactionFee: order.transactionFee,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          fulfillmentStatus: order.fulfillmentStatus,
          shippingAddress: shippingAddress,
          createdAt: order.createdAt,
          subOrders: order.subOrders.map((subOrder) => ({
            totalAmount: subOrder.totalAmount,
            totalTax: subOrder.taxRate,
            totalShipping: subOrder.totalShipping,
            transactionFee: subOrder.transactionFee,
            sellerStoreId: subOrder.sellerStoreId,
          })),
          orderItems: order.orderItems.map((item) => ({
            title: item.title,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
            taxRate: item.tax,
            taxAmount: item.taxAmount,

            // about product
            product: item.product,

            // about seller
            sellerStoreId: sellerStore._id,
            sellerStoreName: sellerStore.name,
            sellerStoreEmail: sellerStore.email,
            sellerStoreOwnerId: sellerStore.ownerId,
            sellerStoreType: sellerStore.storeType,
          })),

          // about buyer
          buyerId: buyer._id,
          buyerFirstName: buyer.firstName,
          buyerLastName: buyer.lastName,
          buyerEmail: buyer.email,
          buyerStoreId: order.buyerStoreId,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
};

module.exports = getOrderDetails;
