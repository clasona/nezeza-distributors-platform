const mongoose = require('mongoose');
const stripeModel = require('../models/stripeModel');
const User = require('../models/User');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const Store = require('../models/Store');
const SellerBalance = require('../models/sellerBalance');
const Address = require('../models/Address');
const path = require('path');
const createOrderUtil = require('../utils/order/createOrderUtil');
const { v4: uuidv4 } = require('uuid');
// utils imports
const getOrderDetails = require('../utils/order/getOrderDetails');
const {
  sendEmail,
  sendBuyerNotificationEmail,
  sendSellerNotificationEmail,
} = require('../utils');
const {
  sendBuyerPaymentConfirmationEmail,
  sendBuyerPaymentFailureEmail,
  sendBuyerPaymentRefundEmail,
} = require('../utils/buyerPaymentEmailUtils');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Unique webhook endpoint signing secret
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const webhookHandler = async (req, res) => {
  console.log('Entering Webhook ...');
  let event;
  // If endpoint secret provided, verify event signature and construct event from stripe
  if (endpointSecret) {
    const signature = req.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    console.log(
      `⚠️ No webhook endpoint secret provided, event signature won't be verified.`
    );
    event = req.body;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('PaymentIntent was successful!.....');
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        const orderItems = paymentIntent.metadata.orderItems;
        const buyerId = paymentIntent.metadata.buyerId;
        const customerEmail = paymentIntent.metadata.customerEmail;
        const customerFirstName = paymentIntent.metadata.customerFirstName;
        const totalAmount = paymentIntent.metadata.totalAmount;

        // Handle successful payment intent

        if (!paymentIntentId) {
          console.error('No payment intent id provided to the stripe webhook.');
          throw new CustomError.BadRequestError(
            'No payment intent id provided to the stripe webhook'
          );
        } else if (!orderItems || orderItems.length < 1) {
          console.error('No order items provided to the stripe webhook.');
          throw new CustomError.BadRequestError(
            'No order items provided to the stripe webhook'
          );
        } else {
          console.log('Creating the order....');
          const orderId = await createOrderUtil(
            orderItems,
            0, //TODO: Add shipping fee
            'credit_card', //TODO: Add payment method
            buyerId
          );
          console.log('Order created successfully.');
          // await confirmPayment(orderId, paymentIntentId); //contains all the functionality for updating order, payments, etc

          console.log('Sending confirmation email to buyer...');
          await sendBuyerPaymentConfirmationEmail({
            name: customerFirstName,
            email: customerEmail,
            orderId: orderId,
          });
          // await updateSellerBalances(order); // Call the update balances function
        }
        break;
      case 'payment_intent.failed':
        const paymentIntentForFailed = event.data.object;
        const paymentIntentIdForFailed = paymentIntentForFailed.id;
        const orderIdForFailed = paymentIntentForFailed.metadata.orderId;

        try {
          const order = await Order.findById(orderIdForFailed);
          if (order) {
            order.paymentStatus = 'Failed'; // Update order status
            await order.save();
            console.log(`Payment failed for order ${orderIdForFailed}.`);
          }
          //TODO: send email to buyer, using webhook?
        } catch (error) {
          console.error('Error updating order status on failure:', error);
        }
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        // Handle successful payment method attachment
        // await handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
};

create_stripe_connect_account = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const seller = await User.findOne({ email: email });
    //Create Stripe Express account
    const stripeAccount = await stripe.accounts.create({
      type: 'express',
      email,
      country: 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    //Create seller in database
    const id = '676b2cdfee63a00d05af0588';
    const stripeInfo = await stripeModel.create({
      sellerId: id,
      code: uuidv4(), // Generate unique code for stripe account
      email,
      stripeAccountId: stripeAccount.id,
    });
    // Generate Stripe onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${process.env.CLIENT_URL}/wholesaler`, //if it fails
      return_url: `${process.env.CLIENT_URL}/wholesaler`, //after successfull account creation
      type: 'account_onboarding',
    });

    res.status(200).json({ url: accountLink.url });
    //res.status(200).json({ message: 'Your account' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// End Method

active_stripe_connect_account = async (req, res) => {
  const { activeCode } = req.params;
  const { id } = req;

  try {
    const userStripeInfo = await stripeModel.findOne({ code: activeCode });

    if (userStripeInfo) {
      await sellerModel.findByIdAndUpdate(id, {
        payment: 'active',
      });
      res.status(StatusCodes.OK).json({ message: 'payment Active' });
    } else {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'payment Active Fails' });
    }
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Internal Server Error' });
  }
};
// End Method
// Create Payment Intent
const createPaymentIntent = async (req, res) => {
  const { orderItems } = req.body;
  let totalAmount = 0;

  const metadata = {
    customerEmail: '',
    customerFirstName: 'Customer',
  };

  if (!orderItems || orderItems.length < 1) {
    throw new CustomError.BadRequestError('No order items provided');
  }

  metadata.orderItems = JSON.stringify(
    orderItems.map((item) => ({
      productId: item.product._id || item.product,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
    }))
  );
  //calculate total amount
  for (const item of orderItems) {
    const price = item.price;
    const quantity = item.quantity;
    const taxAmount = item.taxAmount || 0; // Default to 0 if not provided
    // const shippingAmount = product.shippingAmount || 0; // Default to 0 if not provided
    const totalItemAmount = price * quantity + taxAmount; // + shippingAmount;
    totalAmount += totalItemAmount;
  }

  metadata.totalAmount = totalAmount;

  if (req.user && req.user.userId) {
    const user = await User.findById(req.user.userId);
    if (user) {
      metadata.customerFirstName = user.firstName || 'Customer';
      metadata.customerEmail = user.email;
      metadata.buyerId = user._id.toString();
    }
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // In cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: metadata,
    });
    console.log('Payment intent created successfully.');
    res
      .status(StatusCodes.OK)
      .json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating Payment Intent:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Failed to initiate payment', error: error.message });
  }
};

const updateSellerBalances = async (order) => {
  for (const subOrder of order.subOrders) {
    const sellerId = subOrder.sellerId;
    const sellerEarnings = subOrder.amount; // Amount belonging to seller
    await SellerBalance.findOneAndUpdate(
      { sellerId },
      { $inc: { pendingBalance: sellerEarnings } }, // Add funds to pending balance
      { upsert: true }
    );
  }
};

const confirmPayment = async (req, res) => {
  // console.log(req.body);
  console.log('Enterting confirm payment...');
  const { orderId, paymentIntentId } = req.body;
  const session = await mongoose.startSession(); // Start MongoDB session
  session.startTransaction(); // Begin transaction
  try {
    const order = await Order.findById(orderId)
      .populate('subOrders')
      .session(session);

    if (!order) {
      throw new CustomError.BadRequestError(
        `No order found with id: ${orderId}.`
      );
    }
    console.log('order status updated');
    order.paymentStatus = 'Paid';
    order.paymentIntentId = paymentIntentId;
    await order.save({ session });

    const suborders = order.subOrders;

    //console.log(suborders);
    // const buyer = await User.findById(order.buyerId);
    // const shippingAddress = await Address.findById(order.shippingAddress._id);

    // const buyerEmailDetails = {
    //   email: buyer.email,
    //   buyerName: buyer.firstName,
    //   orderId: order._id,
    //   orderItems: order.orderItems,
    //   totalAmount: order.totalAmount,
    //   shippingMethod: 'Standard Ground Shipping',
    //   shippingAddress: shippingAddress,
    //   estimatedDeliveryDate: 'March 22, 2025',
    // };

    // //const sendEmail = await sendBuyerNotificationEmail(buyerEmailDetails);
    // const sellerEmailDetails = {
    //   buyerName: buyer.firstName,
    //   orderItems: [],
    //   shippingAddress,
    //   shippingMethod: 'Standard Ground Shipping',
    //   email: ['abotgeorge1@gmail.com'],
    // };
    //TODO: Uncomment
    //Distribute payment to each seller
    for (let suborder of suborders) {
      const sellerStore = await Store.findById(suborder.sellerStoreId);
      const seller = await stripeModel.findOne({
        sellerId: sellerStore._id,
      });
      // update suborders payment status
      suborder.paymentStatus = 'Paid';
      await suborder.save();

      // Calculate and deduct application fee from seller's balance
      const applicationFee = Math.round(suborder.totalAmount * 0.1 * 100);
      const amountToTransfer =
        Math.round(suborder.totalAmount * 100) - applicationFee;

      // Update seller's balance
      await SellerBalance.findOneAndUpdate(
        { sellerId: seller.sellerId },
        {
          $inc: {
            pendingBalance: amountToTransfer,
            commissionDeducted: applicationFee,
            totalSales: amountToTransfer,
          },
        }, // Add funds to pending balance
        { upsert: true },
        { session }
      );
      // Transfer funds to seller's account after commission deduction
      // const transfer = await stripe.transfers.create({
      //   amount: amountToTransfer,
      //   currency: 'usd',
      //   destination: seller.stripeAccountId,
      //   transfer_group: orderId,
      // });
      // // Store the transferId for potential reversal
      // suborder.transferId = transfer.id;
      const store = await Store.findById(suborder.sellerStoreId);
      // sellerEmailDetails.orderId = suborder._id;
      // sellerEmailDetails.totalAmount = suborder.totalAmount;
      // sellerEmailDetails.email.push(store.email);
      // sellerEmailDetails.orderItems = suborder.products;

      await suborder.save({ session });
    }
    const orderInfo = getOrderDetails(orderId);

    console.log('Sending email to buyer...');

    await sendBuyerPaymentConfirmationEmail({
      name: orderInfo.buyerFirstName,
      email: orderInfo.buyerEmail,
      orderId: orderInfo._id,
    });

    // TODO: Send email to the seller
    // const sendSellerEmail = await sendSellerNotificationEmail(
    //   sellerEmailDetails
    // );
    ///return order;
    res.status(200).json({ message: 'Payment confirmed', order });
    //return order;
  } catch (error) {
    await session.abortTransaction(); // Rollback if any error occurs
    session.endSession();
    console.error('Error creating order:', error);
    res
      .status(500)
      .json({ msg: 'Order confirmation failed', error: error.message });
    //return { message: error.message };
  }
};
const sellerRequestPayOut = async (req, res) => {
  const { sellerId, amount } = req.body;

  // Check seller balance
  const balance = await SellerBalance.findOne({ sellerId });
  console.log(balance);
  if (!balance || balance.availableBalance < amount) {
    return res
      .status(400)
      .json({ message: 'Insufficient balance for withdrawal.' });
  }

  // Create payout request (for admin to approve later)
  await SellerBalance.findOneAndUpdate(
    { sellerId },
    { $inc: { availableBalance: -amount }, $inc: { pendingBalance: amount } }
  );

  res.json({ message: 'Payout request sent. Awaiting admin approval.' });
};

const getSellerRevenue = async (req, res) => {
  const { sellerId } = req.params;
  const sellerStore = await Store.findById(sellerId);
  if (!sellerStore) {
    throw new CustomError.BadRequestError('No store found for this seller');
  }
  console.log(req.user.userId);
  console.log(sellerStore.ownerId);
  if (sellerStore.ownerId.toString() !== req.user.userId) {
    throw new CustomError.UnauthorizedError(
      'Not  authorized to view the dashboard'
    );
  }
  const sellerRevenue = await SellerBalance.findOne({ sellerId });

  if (!sellerRevenue) {
    throw new CustomError.BadRequestError('No revenue generated yet.');
  }

  res.json(sellerRevenue);
};

const processRefund = async (req, res) => {
  const { orderId, productId, quantity } = req.body;

  try {
    // Fetch the order
    const order = await Order.findById(orderId).populate('subOrders');

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: 'Order not found.' });
    }
    // Ensure order was paid before processing a refund
    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ msg: 'Cannot refund an unpaid order' });
    }
    // Find the suborder containing this product
    const subOrder = await SubOrder.findOne({
      fullOrderId: orderId,
      'products.productId': new ObjectId(productId),
    });
    console.log(subOrder);

    if (!subOrder) {
      throw new Error('SubOrder not found for the selected product');
    }

    // Locate the specific item in the orderItems array
    const orderItemIndex = order.orderItems.findIndex(
      (item) => item.product.toString() === productId
    );
    console.log(orderItemIndex);

    if (orderItemIndex === -1) {
      throw new CustomError.NotFoundError('Product not found in the suborder');
    }

    const orderItem = order.orderItems[orderItemIndex];
    console.log(orderItem);
    // Ensure requested refund quantity does not exceed purchased quantity
    if (quantity > orderItem.quantity) {
      throw new new CustomError.BadRequestError(
        'Requested refund quantity exceeds purchased quantity'
      )();
    }

    // Calculate refund amount (price, proportional tax, and shipping)
    const itemPrice = orderItem.price * quantity;
    const itemTax = (orderItem.price * quantity * orderItem.taxRate) / 100;
    const itemShipping =
      (subOrder.totalShipping / subOrder.totalAmount) * itemPrice;
    const totalRefundAmount = itemPrice + itemTax + itemShipping;

    // Process refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      amount: Math.round(totalRefundAmount * 100), // Convert to cents
    });

    // If seller was paid, reverse the transfer
    if (subOrder.transferId) {
      await stripe.transfers.createReversal(subOrder.transferId, {
        amount: Math.round(
          (itemPrice + itemTax + itemShipping - subOrder.transactionFee) * 100
        ),
      });
    }

    // Update the item in orderItems
    if (orderItem.quantity === quantity) {
      // If all items are refunded, remove the product from orderItems
      order.orderItems.splice(orderItemIndex, 1);
    } else {
      // If partially refunded, update the remaining quantity
      orderItem.quantity -= quantity;
    }
    // Deduct the refunded amount from suborder totals
    subOrder.totalAmount -= totalRefundAmount;
    subOrder.totalTax -= itemTax;
    subOrder.totalShipping -= itemShipping;

    // If all items in the suborder are refunded, update status
    if (order.orderItems.length === 0) {
      subOrder.paymentStatus = 'refunded';
    }

    await subOrder.save();

    res.status(200).json({
      message: 'Partial refund processed successfully',
      refundId: refund.id,
      refundedAmount: totalRefundAmount,
    });
  } catch (err) {
    console.error(`❌ Refund Error: ${err.message}`);
    res.status(500).json({ msg: 'Refund failed', error: err.message });
  }
};

const createCustomerSession = async (req, res) => {
  try {
    // const { customerId } = req.body;

    // if (!customerId) {
    //   return res.status(400).json({ message: 'Customer ID is required' });
    // }

    const userId = req.user.userId;

    // Fetch user once instead of twice
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError.UnauthorizedError(
        `User with ID ${userId} not found.`
      );
    }

    // If user has no Stripe customer ID, create one and save it
    if (!user.stripeAccountId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name, // Optional
      });

      user.stripeAccountId = customer.id;
      await user.save();
    }

    // Create a Customer Session for Payment Element
    const customerSession = await stripe.customerSessions.create({
      customer: user.stripeAccountId, //stripe customer id
      components: {
        payment_element: {
          enabled: true,
          features: {
            payment_method_redisplay: 'enabled',
            payment_method_save: 'enabled',
            payment_method_save_usage: 'on_session', // Save for future use
            payment_method_remove: 'enabled',
          },
        },
      },
    });

    res.json({
      customer_session_client_secret: customerSession.client_secret,
    });
  } catch (error) {
    console.error('Error creating customer session:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};
// const refundTest = async (req, res) => {
//   console.log('Refund test initiated');
//   const paymentIntent = await stripe.paymentIntents.retrieve(
//     'pi_3R3MwuIxvdd0pNY40Igxxa1L'
//   );
//   console.log(paymentIntent.status);
//   res.json({ msg: paymentIntent });
// };

const refundTest = async (req, res) => {
  await createOrderUtil({
    cartItems: [
      {
        product: '67c399a2ebe0870201a6d4af',
        title: 'Test Product',
        quantity: 2,
        price: 100,
      },
    ],
    shippingFee: 0,
    paymentMethod: 'credit_card',
    buyerId: '6799927a2bc90813c9b7ebfb',
  });
  console.log('Refund test finalized');
};

//confirmPayment('67d894391232d717c78f476e', 'pi_3R3lE2Ixvdd0pNY40k7n6MnT');

module.exports = {
  webhookHandler,
  create_stripe_connect_account,
  active_stripe_connect_account,
  createPaymentIntent,
  confirmPayment,
  sellerRequestPayOut,
  updateSellerBalances,
  getSellerRevenue,
  sellerRequestPayOut,
  processRefund,
  createCustomerSession,
  refundTest,
};
