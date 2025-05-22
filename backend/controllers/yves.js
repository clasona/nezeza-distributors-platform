const mongoose = require('mongoose');
const CustomError = require('../../errors');
const Product = require('../../models/Product');
const User = require('../../models/User');
const Store = require('../../models/Store');
const Order = require('../../models/Order');
const Address = require('../../models/Address');
const checkWhoIsTheBuyer = require('../checkWhoIsTheBuyer');
const SubOrder = require('../../models/SubOrder');
const {
  groupProductsBySeller,
} = require('../../helpers/groupProductsBySeller');

const createSubOrders = async (fullOrder, session) => {
  try {
    const subOrdersGrouped = groupProductsBySeller(fullOrder);
    const subOrderData = Object.keys(subOrdersGrouped).map((sellerId) => {
      const subOrder = subOrdersGrouped[sellerId];
      const totalAmount =
        subOrder.totalAmount + subOrder.totalTax + subOrder.totalShipping;
      const transactionFee = subOrder.totalAmount * 0.1;
      return {
        ...subOrder,
        sellerId,
        totalAmount,
        transactionFee,
        fullOrderId: fullOrder._id,
      };
    });
    const subOrders = await SubOrder.insertMany(subOrderData);
    const subOrderIds = subOrders.map((subOrder) => subOrder._id);
    return subOrderIds;
  } catch (error) {
    console.error('Error creating sub-orders:', error);
    throw error;
  }
};

// Refactored function to take parameters directly
const createOrderUtil = async (
  cartItems,
  shippingFee,
  paymentMethod,
  buyerId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const buyer = await User.findById(buyerId)
      .populate('storeId')
      .session(session);

    if (!buyer) {
      throw new CustomError.NotFoundError('The buyer does not exist.');
    }

    const isIndividualCustomer = !buyer.storeId;
    let buyerStore = isIndividualCustomer ? buyer : buyer.storeId;

    if (!cartItems || cartItems.length < 1) {
      throw new CustomError.BadRequestError('No cart items provided');
    }

    if (!shippingFee && shippingFee !== 0) {
      throw new CustomError.BadRequestError('Please provide shipping fee');
    }

    // parse cartItems if it's a string (from payment intent metadata)
    if (typeof cartItems === 'string') {
      cartItems = JSON.parse(cartItems);
    }

    const productIds = cartItems.map(
      (item) =>
        item.productId ||
        (item.product && (item.product._id || item.product)) ||
        item.product
    );

    const dbProducts = await Product.find({ _id: { $in: productIds } }).session(
      session
    );

    let orderItems = [];
    let subtotal = 0;
    let totalTax = 0;
    let totalShipping = 0;
    const stockUpdates = [];

    for (const item of cartItems) {
      const itemProductId =
        item.productId ||
        (item.product && (item.product._id || item.product)) ||
        item.product;

      const dbProduct = dbProducts.find(
        (product) => product._id.toString() === itemProductId.toString()
      );

      if (!dbProduct) {
        throw new CustomError.NotFoundError(
          `No product with id : ${itemProductId}`
        );
      }

      const {
        title,
        price,
        image,
        _id,
        taxRate,
        quantity,
        storeId: sellerStoreId,
      } = dbProduct;

      if (item.quantity > quantity) {
        throw new CustomError.BadRequestError(
          `Not enough stock for product: ${_id}, only ${quantity} available`
        );
      }

      const sellerStore = await Store.findById(sellerStoreId).session(session);

      checkWhoIsTheBuyer(buyerStore, sellerStore);

      const itemTax = (price * taxRate) / 100;

      const singleOrderItem = {
        quantity: item.quantity,
        title,
        price,
        image,
        product: _id,
        taxRate,
        sellerStoreId,
        taxAmount: itemTax * item.quantity,
      };
      orderItems.push(singleOrderItem);

      subtotal += item.quantity * price;
      totalTax += itemTax * item.quantity;
      totalShipping += 0;

      stockUpdates.push({ productId: _id, quantity: item.quantity });
    }

    const totalAmount = totalTax + totalShipping + subtotal;

    // Placeholder address creation
    const address = await Address.create(
      [
        {
          street: '12345 Market St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          country: 'USA',
          phone: '8608084545',
        },
      ],
      { session }
    );

    const [order] = await Order.create(
      [
        {
          orderItems,
          totalAmount,
          totalTax,
          totalShipping,
          paymentMethod,
          shippingAddress: address[0]._id,
          billingAddress: address[0]._id,
          buyerId,
          buyerStoreId: buyerStore._id,
          subOrders: [],
        },
      ],
      { session }
    );

    if (stockUpdates.length > 0) {
      const bulkOps = stockUpdates.map(({ productId, quantity }) => ({
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { stock: -quantity } },
        },
      }));
      await Product.bulkWrite(bulkOps, { session });
    }

    const updatedSubOrders = await createSubOrders(order, session);
    order.subOrders = updatedSubOrders;

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order._id;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in createOrder utility:', error);
    throw error;
  }
};

module.exports = createOrderUtil;
