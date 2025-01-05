const stripeModel = require('../models/stripeModel');
const User = require('../models/User');
const Order = require('../models/Order');
const SellerBalance = require('../models/sellerBalance');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
// utils imports
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
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    console.log(
      `⚠️  No webhook endpoint secret provided, event signature won't be verified.`
    );
    event = req.body;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        const orderId = paymentIntent.metadata.orderId;
        
        // Handle successful payment intent
        if (!paymentIntentId) {
          console.error('No payment intent id provided to the stripe webhook.');
          throw new CustomError.BadRequestError(
            'No payment intent id provided to the stripe webhook'
          );
        } else if (!orderId) {
          console.error('No order ID provided to the stripe webhook.');
          throw new CustomError.BadRequestError(
            'No order ID provided to the stripe webhook'
          );
        } else {
          console.log('Invoking confirm payment function...');
          await confirmPayment(orderId, paymentIntentId); //contains all the functionality for updating order, payments, etc

          //TODO: send email to buyer, using webhook?

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
      refresh_url: 'http://localhost:3000/wholesaler', //if it fails
      return_url: 'http://localhost:3000/wholesaler', //after successfull account creation
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
const createPaymentIntent = async (order) => {
  if (order && order.totalAmount) {
    if (order.totalAmount) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalAmount * 100, // In cents
        currency: 'usd',
        payment_method_types: ['card'],
        transfer_group: order._id.toString(), // Group all transfers
        metadata: { orderId: order._id.toString() },
      });

      //console.log(paymentIntent);
      return paymentIntent;
    } else {
      throw new CustomError.BadRequestError(
        "Order 'totalAmount' is required to create paymentIntent."
      );
    }
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

const confirmPayment = async (orderId, paymentIntentId) => {
  const order = await Order.findById(orderId).populate('subOrders');

  if (!order) {
    throw new CustomError.BadRequestError(
      `No order found with id: ${orderId}.`
    );
    return;
  }

  order.paymentStatus = 'Paid';
  order.paymentIntentId = paymentIntentId;
  await order.save();

  const suborders = order.subOrders;
  console.log(suborders);

  //TODO: Uncomment
  //Distribute payment to each seller
  for (let suborder of suborders) {
    const seller = await stripeModel.findOne({
      sellerId: suborder.sellerStoreId,
    });
    const amount = suborder.totalAmount * 100;

    //const sellerEarnings = subOrder.amount; // Amount belonging to seller
    await SellerBalance.findOneAndUpdate(
      { sellerId: seller.sellerId },
      { $inc: { pendingBalance: suborder.totalAmount } }, // Add funds to pending balance
      { upsert: true }
    );
    await stripe.transfers.create({
      amount,
      currency: 'usd',
      destination: seller.stripeAccountId,
      transfer_group: orderId,
    });
  }

  return order;
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

module.exports = {
  webhookHandler,
  create_stripe_connect_account,
  active_stripe_connect_account,
  createPaymentIntent,
  confirmPayment,
  sellerRequestPayOut,
  updateSellerBalances,
  sellerRequestPayOut,
  createCustomerSession,
};
