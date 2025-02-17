const stripeModel = require('../models/stripeModel');
const User = require('../models/User');
const Order = require('../models/Order');
const SellerBalance = require('../models/sellerBalance');
const { v4: uuidv4 } = require('uuid');
// utils imports
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const stripe = require('stripe')(
  'sk_test_51QMcsrAxKdIEzUUeZL5HR9RWnIS6W5wSa9bJJqCKI4wFRAE1UT6qkXLYE5fMFVPDUSJmmJL8dU50htNVSpN5dk3p00o8AeCxBO'
);

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
    // //Create seller in database
    const id = '674a2964f51a81ec936d060d';
    const stripeInfo = await stripeModel.create({
      sellerId: id,
      code: uuidv4(), // Generate unique code for stripe account
      email,
      stripeAccountId: stripeAccount.id,
    });
    // Generate Stripe onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: 'http://localhost:5173/',
      return_url: 'http://localhost:5173/seller-dashboard',
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
  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.total * 100, // In cents
    currency: 'usd',
    payment_method_types: ['card'],
    transfer_group: order._id.toString(), // Group all transfers
    metadata: { orderId: order._id.toString() },
  });
  //console.log(paymentIntent);
  return paymentIntent;
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
  const { orderId, paymentIntentId } = req.body;
  const order = await Order.findById(orderId).populate('subOrders');

  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.paymentStatus = 'Paid';
  order.paymentIntentId = paymentIntentId;
  await order.save();

  const suborders = order.subOrders;
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

  ///res.json({ message: 'Payment confirmed & payouts sent', order });

  res.json({ message: 'Payment confirmed', order });
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

module.exports = {
  create_stripe_connect_account,
  active_stripe_connect_account,
  createPaymentIntent,
  confirmPayment,
  sellerRequestPayOut,
  updateSellerBalances,
  sellerRequestPayOut,
};
