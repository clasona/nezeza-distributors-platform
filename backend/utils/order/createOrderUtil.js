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
const {
  errorLoggingMiddleware,
} = require('../../controllers/admin/adminSystemMonitoringController');
const calculateEstimatedDelivery = require('./calculateEstimatedDelivery');
const { getEarliestDeliveryDate } = require('../shipping/extractDeliveryDateFromRate');

/* 
  Create a new order, group items by seller,
  and create sub-orders for each seller
 */
const createSubOrders = async (fullOrder, selectedShippingOptions, session) => {
  // console.log(fullOrder);
  // Group products by seller and prepare sub-orders data
  try {
    const subOrdersGrouped = groupProductsBySeller(fullOrder); // Grouped seller data

    const subOrderData = Object.keys(subOrdersGrouped).map((sellerId) => {
      const subOrder = subOrdersGrouped[sellerId];
      
      // Use the calculated values from groupProductsBySeller directly
      // These already include proper totals per seller
      const subtotal = subOrder.totalAmount; // This is the product subtotal for this seller
      const sellerTax = subOrder.totalTax; // Tax for this seller's products
      const sellerShipping = subOrder.totalShipping || 0; // Shipping for this seller (if any)
      
      // Final total amount for this suborder (subtotal only, tax and shipping are separate fields)
      const finalTotalAmount = subtotal;
      
      // Add transaction fee (10% platform fee on subtotal)
      const transactionFee = subtotal * 0.1;
      
      // Calculate average tax rate for this seller's products
      const avgTaxRate = subOrder.products.length > 0 ? 
        subOrder.products.reduce((sum, product) => sum + (product.taxRate || 0), 0) / subOrder.products.length : 0;
      
      // Get the selected shipping option for this seller
      const selectedShippingOption = selectedShippingOptions ? selectedShippingOptions[sellerId] : null;
      const selectedRateId = selectedShippingOption ? 
        (selectedShippingOption.rateId || selectedShippingOption) : null;
      
      return {
        ...subOrder,
        sellerId,
        totalAmount: finalTotalAmount, // Store subtotal here
        taxRate: avgTaxRate, // Store average tax rate for this seller
        totalTax: sellerTax, // Store tax separately
        totalShipping: sellerShipping, // Store shipping separately
        transactionFee,
        fullOrderId: fullOrder._id, // Add reference to the main order
        paymentStatus: 'Paid',
        fulfillmentStatus: 'Placed', // Set initial status to Placed
        shippingDetails: {
          rateId: selectedRateId, // Store the selected shipping rate ID
          carrier: 'TBD', // Will be set when label is created
          trackingNumber: '', // Will be set when label is created
          trackingUrl: '',
          estimatedDeliveryDate: fullOrder.estimatedDeliveryDate,
          shipmentStatus: 'Pending',
          shippingAddress: fullOrder.shippingAddress,
        },
        // Also store the rateId at the suborder level for easy access
        selectedRateId: selectedRateId,
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
 * @param {object} orderData.shippingAddress - The shipping address for the order.
 * @param {object} orderData.billingAddress - The billing address for the order (optional, defaults to shipping address).
 * @returns {Promise<{orderId: string}>} - The order ID.
 */
const createOrderUtil = async ({
  cartItems,
  shippingFee = 0,
  selectedShippingOptions = {},
  paymentMethod,
  buyerId,
  shippingAddress,
  billingAddress,
}) => {
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

    // Validate shipping fee (allow 0 for free shipping)
    if (shippingFee === null || shippingFee === undefined) {
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
      // Shipping is calculated separately and passed as shippingFee parameter

      stockUpdates.push({ productId: _id, quantity: item.quantity });
    }

    // Use actual shipping fee instead of hardcoded 0
    totalShipping = shippingFee;
    const totalAmount = totalTax + totalShipping + subtotal;

    // Use the actual delivery date selected by the user instead of recalculating
    let estimatedDeliveryDate;
    
    if (selectedShippingOptions && Object.keys(selectedShippingOptions).length > 0) {
      // Find the earliest delivery date from user's selected shipping options
      let earliestDate = null;
      
      for (const sellerId in selectedShippingOptions) {
        const shippingOption = selectedShippingOptions[sellerId];
        
        // Use the exact deliveryTime selected by the user
        if (shippingOption.deliveryTime) {
          const deliveryDate = new Date(shippingOption.deliveryTime);
          if (!isNaN(deliveryDate.getTime())) {
            if (!earliestDate || deliveryDate < earliestDate) {
              earliestDate = deliveryDate;
            }
          }
        }
      }
      
      estimatedDeliveryDate = earliestDate || calculateEstimatedDelivery(new Date(), 5);
    } else {
      // Fallback if no shipping options provided
      estimatedDeliveryDate = calculateEstimatedDelivery(new Date(), 5);
    }
    
    console.log(`✅ Using selected delivery date: ${estimatedDeliveryDate.toISOString()} from user's shipping choice:`, selectedShippingOptions);

    // Validate and process addresses
    if (!shippingAddress) {
      throw new CustomError.BadRequestError('Shipping address is required');
    }

    // Parse addresses if they come as strings (from payment intent metadata)
    let parsedShippingAddress = shippingAddress;
    let parsedBillingAddress = billingAddress || shippingAddress; // Default billing to shipping

    if (typeof shippingAddress === 'string') {
      try {
        parsedShippingAddress = JSON.parse(shippingAddress);
      } catch (error) {
        throw new CustomError.BadRequestError('Invalid shipping address format');
      }
    }

    if (typeof billingAddress === 'string') {
      try {
        parsedBillingAddress = JSON.parse(billingAddress);
      } catch (error) {
        throw new CustomError.BadRequestError('Invalid billing address format');
      }
    }

    const [order] = await Order.create(
      [
        {
          orderItems,
          totalAmount, //TODO: replace with the paymentIntent.metadata.totalAmount ?
          totalTax,
          totalShipping,
          paymentMethod,
          shippingAddress: parsedShippingAddress,
          billingAddress: parsedBillingAddress,
          buyerId,
          buyerStoreId: buyerStore._id,
          subOrders: [],
          estimatedDeliveryDate,
          paymentStatus: 'Paid',
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
    const updatedSubOrders = await createSubOrders(order, selectedShippingOptions, session);
    order.subOrders = updatedSubOrders; // Assign the results back to the order document

    // const paymentIntent = await createPaymentIntentUtil(order);
    // order.paymentIntentId = paymentIntent.id;

    await order.save({ session }); // Save the order with paymentIntentId and updated subOrders

    await session.commitTransaction();
    session.endSession();

    return order._id;
  } catch (error) {
    errorLoggingMiddleware(error);
    await session.abortTransaction();
    session.endSession();
    console.error('Error in createOrder utility:', error);
    // Re-throw the error so the caller can handle it (e.g., send an appropriate HTTP response)
    throw error;
  }
};

module.exports = createOrderUtil;
