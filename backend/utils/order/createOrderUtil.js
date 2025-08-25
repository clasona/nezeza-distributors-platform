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
const { calculateOrderFees, calculateMultiSellerOrderFees } = require('../payment/feeCalculationUtil');
const { errorLoggingMiddleware } = require('../../controllers/admin/adminSystemMonitoringController');
const calculateEstimatedDelivery = require('./calculateEstimatedDelivery');
const { getEarliestDeliveryDate } = require('../shipping/extractDeliveryDateFromRate');

/* 
  Create a new order, group items by seller,
  and create sub-orders for each seller
 */
const createSubOrders = async (fullOrder, selectedShippingOptions, groupedItems, session) => {
  // console.log(fullOrder);
  // Use the pre-calculated grouped items instead of recalculating
  // console.log('Creating sub-orders for full order:', fullOrder);
  try {
    const subOrdersGrouped = groupedItems; // Use pre-calculated grouped seller data

    const subOrderData = Object.keys(subOrdersGrouped).map((sellerId) => {
    const subOrder = subOrdersGrouped[sellerId];

    // Calculate fee breakdown for this suborder
    const feeBreakdown = calculateOrderFees({
      productSubtotal: subOrder.totalAmount, // This is the seller's product subtotal
      taxAmount: subOrder.totalTax,
      shippingCost: subOrder.totalShipping || 0,
      grossUpFees: false, // Gross-up is handled at the main order level
      store: subOrder.store, // Pass store for grace period check
    });

    return {
      ...subOrder,
      sellerId,
      totalAmount: feeBreakdown.breakdown.productSubtotal, // Store subtotal here
      taxRate: subOrder.avgTaxRate, // Use pre-calculated average tax rate
      totalTax: feeBreakdown.breakdown.tax, // Store tax separately
      totalShipping: feeBreakdown.breakdown.shipping, // Store shipping separately
      transactionFee: feeBreakdown.platformBreakdown.commission, // Platform commission
      fullOrderId: fullOrder._id, // Add reference to the main order
      buyerId: fullOrder.buyerId, // Reference to the buyer
      buyerStoreId: fullOrder.buyerStoreId, // Reference to the buyer's store
      clientSecret: fullOrder.clientSecret, // Reference to the client's secret
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Placed', // Set initial status to Placed
      shippingDetails: {
        rateId: subOrder.selectedRateId, // Use pre-calculated rateId
        carrier: 'TBD',
        trackingNumber: '',
        trackingUrl: '',
        estimatedDeliveryDate: fullOrder.estimatedDeliveryDate,
        shipmentStatus: 'Pending',
        shippingAddress: fullOrder.shippingAddress,
      },
      selectedRateId: subOrder.selectedRateId,
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

      if (item.quantity > dbProduct.quantity) {
        throw new CustomError.BadRequestError(
          `Not enough stock for product: ${dbProduct._id}, only ${dbProduct.quantity} available`
        );
      }

      stockUpdates.push({ productId: dbProduct._id, quantity: item.quantity });
    }

    const groupedItems = groupProductsBySeller({ orderItems: cartItems, selectedShippingOptions });
    // console.log('Grouped items:', groupedItems);

    // Calculate the total amount using the fee calculation utility for consistency
    const feeBreakdown = calculateMultiSellerOrderFees({
      suborders: Object.values(groupedItems).map(sellerData => ({
        store: sellerData.store,
        productSubtotal: sellerData.totalAmount,
        taxAmount: sellerData.totalTax,
        shippingCost: sellerData.totalShipping || 0,
      })),
      totalShippingCost: shippingFee,
      grossUpFees: true // Gross up fees
    });

    // console.log('Fee breakdown for the entire order:', feeBreakdown);

    const totalAmount = feeBreakdown.customerTotal;

    // Use the actual delivery date selected by the user instead of recalculating
    let estimatedDeliveryDate;
    
    if (selectedShippingOptions && Object.keys(selectedShippingOptions).length > 0) {
      // Find the earliest delivery date from user's selected shipping options
      let earliestDate = null;
      
      for (const sellerId in selectedShippingOptions) {
        const shippingOption = selectedShippingOptions[sellerId];
        
        // Use the exact deliveryTime selected by the user
        if (shippingOption.deliveryTime) {
          // If it's a string date like '2025-08-25', append time to avoid timezone issues
          let dateInput = shippingOption.deliveryTime;
          if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
            dateInput = dateInput + 'T12:00:00.000Z'; // Set to noon UTC to avoid timezone conversion issues
          }
          
          const deliveryDate = new Date(dateInput);
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

    // console.log('cartItems:', cartItems);

    const [order] = await Order.create(
      [
        {
          orderItems: cartItems.map(item => ({ ...item, taxRate: item.product.taxRate, taxAmount: (item.price * item.quantity * (item.product.taxRate / 100)) || 0 })),
          totalAmount, //TODO: replace with the paymentIntent.metadata.totalAmount ?
          totalTax: feeBreakdown.summary.totalTax,
          totalShipping: feeBreakdown.summary.totalShipping,
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

    // Pass the created order document, session, and grouped items to createSubOrders
    const updatedSubOrders = await createSubOrders(order, selectedShippingOptions, groupedItems, session);
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
