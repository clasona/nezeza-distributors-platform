const mongoose = require('mongoose');
const CustomError = require('../../errors');
const Product = require('../../models/Product');
const User = require('../../models/User');
const Store = require('../../models/Store');
const Order = require('../../models/Order');
const Address = require('../../models/Address');
const { StatusCodes } = require('http-status-codes');

// Assuming these helper functions are also defined elsewhere
const checkWhoIsTheBuyer = require('../checkWhoIsTheBuyer');
const createPaymentIntentUtil = require('../payment/createPaymentIntentUtil');
const SubOrder = require('../../models/SubOrder');
const {
  groupProductsBySeller,
} = require('../../helpers/groupProductsBySeller');

/* 
  Create a new order, group items by seller,
  and create sub-orders for each seller
 */
const createSubOrders = async (fullOrder, session) => {
  // console.log(fullOrder);
  // Group products by seller and prepare sub-orders data
  try {
    const subOrdersGrouped = groupProductsBySeller(fullOrder); // Grouped seller data

    const subOrderData = Object.keys(subOrdersGrouped).map((sellerId) => {
      const subOrder = subOrdersGrouped[sellerId];

      // Calculate total amount including tax and shipping
      const totalAmount =
        subOrder.totalAmount + subOrder.totalTax + subOrder.totalShipping;

      // Add transaction fee (10% platform fee example)
      const transactionFee = subOrder.totalAmount * 0.1;
      return {
        ...subOrder,
        sellerId,
        totalAmount,
        transactionFee,
        fullOrderId: fullOrder._id, // Add reference to the main order
      };
    });

    // Insert all sub-orders in one go and extract their IDs
    const subOrders = await SubOrder.insertMany(subOrderData);
    const subOrderIds = subOrders.map((subOrder) => subOrder._id);

    return subOrderIds;
  } catch (error) {
    console.error('Error creating sub-orders:', error);
    throw error; // Ensure rollback is triggered in `createOrder`
  }
};

/**
 * Creates a new order in the database.
 * @param {object} orderData - The data required to create the order.
 * @param {Array<object>} orderData.cartItems - Array of cart items (each with product and quantity).
 * @param {number} orderData.shippingFee - The shipping fee for the order.
 * @param {string} orderData.paymentMethod - The payment method used.
 * @param {string} orderData.buyerId - The ID of the authenticated buyer.
 * @returns {Promise<{orderId: string}>} - The order ID.
 */
const createOrderUtil = async (
  cartItems,
  shippingFee,
  paymentMethod,
  buyerId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch buyer details including their store
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
      // Check for explicit 0 as well
      throw new CustomError.BadRequestError('Please provide shipping fee');
    }

    // Parse cartItems if it's a string (from payment intent metadata)
    if (typeof cartItems === 'string') {
      cartItems = JSON.parse(cartItems);
    }
    const productIds = cartItems.map(
      (item) =>
        item.productId || (item.product && item.product._id) || item.product
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
      // Determine the product ID for comparison
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
        quantity, // This is the stock quantity from the database
        storeId: sellerStoreId,
      } = dbProduct;

      // Check stock availability
      if (item.quantity > quantity) {
        // 'quantity' here is from dbProduct, 'item.quantity' is from cart
        throw new CustomError.BadRequestError(
          `Not enough stock for product: ${_id}, only ${quantity} available`
        );
      }

      const sellerStore = await Store.findById(sellerStoreId).session(session);

      // Validate buyer's store type can buy from this seller
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
      totalShipping += 0; // Assuming flat shipping is handled per item or order

      stockUpdates.push({ productId: _id, quantity: item.quantity });
    }

    const totalAmount = totalTax + totalShipping + subtotal;

    // IMPORTANT: For production, shippingAddress and billingAddress should come from the request
    // or from the buyer's saved addresses, not hardcoded.
    // This is just a placeholder to make the utility runnable.
    const address = await Address.create(
      [
        {
          street: '12345 Market St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94103',
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
          totalAmount, //TODO: replace with the paymentIntent.metadata.totalAmount ?
          totalTax,
          totalShipping,
          paymentMethod,
          shippingAddress: address[0]._id, // Use the ID of the created address
          billingAddress: address[0]._id, // TODO: get from paymentIntent? Use the ID of the created address (or a separate one)
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

    // Pass the created order document and session to createSubOrders
    const updatedSubOrders = await createSubOrders(order, session);
    order.subOrders = updatedSubOrders; // Assign the results back to the order document

    // const paymentIntent = await createPaymentIntentUtil(order);
    // order.paymentIntentId = paymentIntent.id;

    await order.save({ session }); // Save the order with paymentIntentId and updated subOrders

    await session.commitTransaction();
    session.endSession();

    return order._id;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in createOrder utility:', error);
    // Re-throw the error so the caller can handle it (e.g., send an appropriate HTTP response)
    throw error;
  }
};

module.exports = createOrderUtil;
