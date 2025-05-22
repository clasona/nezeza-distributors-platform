const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CustomError = require('../../errors');
const mongoose = require('mongoose');
const Order = require('../../models/Order'); // Assuming your Order model path

const createPaymentIntentUtil = async (order) => {
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

module.exports = createPaymentIntentUtil;
