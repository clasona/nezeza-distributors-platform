const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;
    const orderId = paymentIntent.metadata.orderId; // Get order ID from metadata

    try {
      const order = await Order.findById(orderId).populate('subOrders');

      if (!order) {
        console.error(
          `Order ${orderId} not found for payment intent ${paymentIntentId}`
        );
        return res.status(404).json({ error: 'Order not found' }); // Return error to stripe
      }

      order.paymentStatus = 'Paid';
      order.paymentIntentId = paymentIntentId;
      await order.save();

      await updateSellerBalances(order); // Call the update balances function

      // Distribute payment to each seller (as before)
      for (let suborder of order.subOrders) {
        const seller = await stripeModel.findOne({
          sellerId: suborder.sellerStoreId,
        });
        const amount = suborder.totalAmount * 100;

        await stripe.transfers.create({
          amount,
          currency: 'usd',
          destination: seller.stripeAccountId,
          transfer_group: orderId, // Use the same transfer group
        });
      }
      console.log(`Payment confirmed & payouts sent for order ${orderId}`);
    } catch (error) {
      console.error('Error processing payment intent:', error);
      return res.status(500).json({ error: 'Payment processing failed' }); // Return error to stripe
    }
  } else if (event.type === 'payment_intent.failed') {
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;
    const orderId = paymentIntent.metadata.orderId;

    try {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'Failed'; // Update order status
        await order.save();
        console.log(`Payment failed for order ${orderId}.`);
      }
    } catch (error) {
      console.error('Error updating order status on failure:', error);
    }
  }

  res.json({ received: true }); // Important: Acknowledge the webhook event
};
