const mongoose = require('mongoose');
const stripeModel = require('../models/stripeModel');
const User = require('../models/User');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const Store = require('../models/Store');
const SellerBalance = require('../models/sellerBalance');
const Transaction = require('../models/Transaction');
const Address = require('../models/Address');
const path = require('path');
const createOrderUtil = require('../utils/order/createOrderUtil');
const { v4: uuidv4 } = require('uuid');
const { calculateOrderFees, calculateMultiSellerOrderFees } = require('../utils/payment/feeCalculationUtil');
// utils imports
const getOrderDetails = require('../utils/order/getOrderDetails');
// const {
//   sendEmail,
//   sendBuyerNotificationEmail,
//   sendSellerNotificationEmail,
// } = require('../utils');

const {
  sendBuyerPaymentConfirmationEmail,
  sendBuyerPaymentFailureEmail,
  sendBuyerPaymentRefundEmail,
  sendBuyerFullOrderRefundEmail,
} = require('../utils/email/buyerPaymentEmailUtils');
const {
  sendSellerNewOrderNotificationEmail,
  sendSellerItemCancellationNotificationEmail,
  sendSellerFullOrderCancellationEmail,
} = require('../utils/email/sellerOrderEmailUtils');
const {
  sendOrderConfirmationEmailAndNotification,
  sendSellerNewOrderEmailAndNotification,
} = require('../utils/sendEmailAndNotification');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const TempOrderData = require('../models/TempOrderData');

// Unique webhook endpoint signing secret
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const webhookHandler = async (req, res) => {
  console.log('=== STRIPE WEBHOOK HANDLER CALLED ===');
  console.log('Request headers:', req.headers);
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
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
        
        // Handle both old and new metadata formats for backward compatibility
        let orderItems, shippingAddress, selectedShippingOptions, billingAddress;
        
        if (paymentIntent.metadata.orderItems) {
          // Old format - legacy support
          console.log('Using legacy metadata format');
          orderItems = JSON.parse(paymentIntent.metadata.orderItems);
          shippingAddress = JSON.parse(paymentIntent.metadata.shippingAddress);
          selectedShippingOptions = paymentIntent.metadata.selectedShippingOptions ?
            JSON.parse(paymentIntent.metadata.selectedShippingOptions) : null;
          billingAddress = paymentIntent.metadata.billingAddress ? 
            JSON.parse(paymentIntent.metadata.billingAddress) : null;
        } else if (paymentIntent.metadata.tempOrderDataId) {
          // New format - fetch from temp collection
          console.log('Using temp order data format');
          const tempOrderData = await TempOrderData.findById(paymentIntent.metadata.tempOrderDataId);
          if (!tempOrderData) {
            throw new CustomError.BadRequestError('Temp order data not found');
          }
          orderItems = tempOrderData.orderItems;
          shippingAddress = tempOrderData.shippingAddress;
          selectedShippingOptions = tempOrderData.selectedShippingOptions;
          billingAddress = tempOrderData.billingAddress;
          
          // Clean up temp data after successful retrieval
          await TempOrderData.findByIdAndDelete(paymentIntent.metadata.tempOrderDataId);
        } else {
          throw new CustomError.BadRequestError('No order data found in payment intent metadata');
        }
        
        const totalShipping = parseFloat(paymentIntent.metadata.totalShipping || '0');
        const totalTax = parseFloat(paymentIntent.metadata.totalTax || '0');
        const subtotal = parseFloat(paymentIntent.metadata.subtotal || '0');
        const buyerId = paymentIntent.metadata.buyerId;
        const customerEmail = paymentIntent.metadata.customerEmail;
        const customerFirstName = paymentIntent.metadata.customerFirstName;
        const totalAmount = parseFloat(paymentIntent.metadata.totalAmount);
        const paymentMethodId = paymentIntent.payment_method;

        // Handle successful payment intent

        if (!paymentIntentId) {
          console.error('❌ No payment intent id provided to the stripe webhook.');
          throw new CustomError.BadRequestError(
            'No payment intent id provided to the stripe webhook'
          );
        } else if (!orderItems || orderItems.length < 1) {
          console.error('❌ No order items provided to the stripe webhook.');
          throw new CustomError.BadRequestError(
            'No order items provided to the stripe webhook'
          );
        } else {
          console.log('=== WEBHOOK: Processing payment with new card ===');
          console.log('💳 Payment Intent ID:', paymentIntentId);
          console.log('👤 Customer:', customerFirstName, '(' + customerEmail + ')');
          console.log('🛒 Order Items Count:', orderItems.length);
          console.log('💰 Payment Amount:', `$${totalAmount.toFixed(2)}`);
          console.log('📦 Shipping Cost:', `$${totalShipping.toFixed(2)}`);
          console.log('🏷️ Tax Amount:', `$${totalTax.toFixed(2)}`);
          console.log('📍 Shipping to:', shippingAddress?.city, shippingAddress?.state);
          
          console.log('📝 Creating order from webhook...');
          const orderId = await createOrderUtil({
            cartItems: orderItems,
            shippingFee: totalShipping,
            selectedShippingOptions: selectedShippingOptions,
            paymentMethod: 'credit_card',
            buyerId: buyerId,
            shippingAddress: shippingAddress,
            billingAddress: billingAddress
          });
          console.log('✅ Order created successfully. Order ID:', orderId)
          
          // Save payment method for first-time users
          if (buyerId && paymentMethodId) {
            const user = await User.findById(buyerId);
            if (user) {
              // Create Stripe customer if missing
              if (!user.stripeAccountId) {
                const customer = await stripe.customers.create({
                  email: user.email,
                  name: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
                  metadata: {
                    nezezaUserId: user._id.toString(),
                  },
                });
                user.stripeAccountId = customer.id;
                console.log('Created Stripe customer and updated user.stripeAccountId:', customer.id);
              }
              
              // Save default payment method if not already set
              let shouldAttach = false;
              if (!user.stripeDefaultPaymentMethodId && paymentMethodId) {
                user.stripeDefaultPaymentMethodId = paymentMethodId;
                shouldAttach = true;
                console.log('Updated user with default payment method.');
              }
              await user.save();
              
              // Attach payment method to Stripe customer if needed
              if (shouldAttach && user.stripeAccountId && paymentMethodId) {
                try {
                  await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: user.stripeAccountId,
                  });
                  console.log('Attached payment method to Stripe customer:', user.stripeAccountId);
                  
                  // Set default payment method for invoices only after successful attachment
                  await stripe.customers.update(user.stripeAccountId, {
                    invoice_settings: { default_payment_method: paymentMethodId }
                  });
                  console.log('Set default payment method for Stripe customer:', user.stripeAccountId);
                } catch (err) {
                  console.error('Error attaching payment method to Stripe customer:', err.message);
                  // Don't try to set default payment method if attachment failed
                }
              } else if (user.stripeAccountId && paymentMethodId && user.stripeDefaultPaymentMethodId === paymentMethodId) {
                // If payment method is already set as default, try to update customer settings
                try {
                  await stripe.customers.update(user.stripeAccountId, {
                    invoice_settings: { default_payment_method: paymentMethodId }
                  });
                  console.log('Updated default payment method for existing Stripe customer:', user.stripeAccountId);
                } catch (err) {
                  console.error('Error updating default payment method for Stripe customer:', err.message);
                }
              }
            }
          }
          // Use the centralized confirmPayment function with detailed logging
          console.log('🔄 WEBHOOK: Calling confirmPayment to process order completion...');
          console.log('📊 Starting seller balance updates and email notifications...');
          await confirmPayment(orderId, paymentIntentId);
          console.log('🎉 WEBHOOK: Payment processing completed successfully!');
          console.log('======================================');
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
const createStripeConnectAccount = async (req, res) => {
  const { email } = req.body;

  // 1. Input Validation
  if (!email) {
    throw new CustomError.BadRequestError(
      'Please provide an email to create a Stripe account.'
    );
  }

  try {
    // Find the seller (user) by email
    const seller = await User.findOne({ email });
    if (!seller) {
      throw new CustomError.NotFoundError(
        `Seller with email ${email} not found.`
      );
    }

    // Check if seller already has a Stripe account to ensure idempotency
    // This prevents creating multiple Stripe accounts for the same seller
    if (seller.stripeAccountId) {
      // Option 1: Just return the existing onboarding link if they haven't completed it
      // This requires storing and retrieving the last generated accountLink or checking Stripe directly.
      // For simplicity, we'll just indicate it exists and potentially redirect to existing onboarding.
      // Option 2: Attempt to retrieve the existing account link or create a new one for onboarding
      const existingAccount = await stripe.accounts.retrieve(
        seller.stripeAccountId
      );
      if (!existingAccount.details_submitted) {
        // If details are not submitted, means onboarding is incomplete, generate a new link
        let sellerStoreType =
          (await Store.findOne({ ownerId: seller._id }))?.storeType ||
          'default';
        switch (sellerStoreType) {
          case 'retail':
            sellerStoreType = 'retailer';
            break;
          case 'wholesale':
            sellerStoreType = 'wholesaler';
            break;
          case 'manufacturing':
            sellerStoreType = 'manufacturer';
            break;
          default:
            sellerStoreType = 'default';
            break;
        }

        const accountLink = await stripe.accountLinks.create({
          account: seller.stripeAccountId,
          refresh_url: `${process.env.CLIENT_URL}/${sellerStoreType}`,
          return_url: `${process.env.CLIENT_URL}/${sellerStoreType}`,
          type: 'account_onboarding',
        });
        return res.status(StatusCodes.OK).json({
          url: accountLink.url,
          message:
            'Stripe account already exists, redirecting to complete onboarding.',
        });
      } else {
        // Account already exists and details are submitted (onboarding complete)
        return res.status(StatusCodes.OK).json({
          url: `${process.env.CLIENT_URL}/${sellerStoreType}`, // Redirect to seller's dashboard
          message: 'Stripe account already exists and is onboarded.',
          hasStripeAccount: true,
          isActive: true, // Assuming submitted details means active for this check
        });
      }
    }

    // Find the associated store
    const store = await Store.findOne({ ownerId: seller._id });
    if (!store) {
      throw new CustomError.NotFoundError(
        `Store not found for seller with email ${email}.`
      );
    }

    // Create Stripe Express account
    const stripeAccount = await stripe.accounts.create({
      type: 'express',
      email,
      country: 'US', // TODO: change this when onboarding sellers from other countries
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: store.businessType, // Or 'company' if applicable, ensure you collect this from user
      // business_profile: {
      //   mcc: '5734', // Merchant Category Code - e.g., '5734' for computer software stores
      //   url: store.website || 'https://yourdefaultwebsite.com', // Replace with actual store website
      // },
      // default_currency: 'usd', // Explicitly set if needed
    });

    // Save Stripe account ID to the User model
    seller.stripeAccountId = stripeAccount.id;
    await seller.save();

    // Create an entry in your stripeModel to record this
    // Note: The `code` field here is being used for a UUID.
    // If you intend for this to store the OAuth authorization code,
    // that typically comes *after* the user is redirected back from Stripe.
    // For this specific setup (initiating onboarding), UUID is fine as an internal tracking ID.

    console.log('Stripe account created successfully:', stripeAccount.id);
    const stripeInfo = await stripeModel.create({
      sellerId: seller._id,
      sellerEmail: email, // Store email for traceability
      storeId: store._id,
      code: uuidv4(), // Generate unique code for internal tracking
      stripeAccountId: stripeAccount.id,
      // You might also store `object: 'account_link'` or a status here.
    });

    let sellerStoreType = store.storeType;
    switch (sellerStoreType) {
      case 'retail':
        sellerStoreType = 'retailer';
        break;
      case 'wholesale':
        sellerStoreType = 'wholesaler';
        break;
      case 'manufacturing':
        sellerStoreType = 'manufacturer';
        break;
      default:
        sellerStoreType = 'seller'; // Fallback type, 'default' might conflict if that's a route
        break;
    }

    // Generate Stripe onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${process.env.CLIENT_URL}/sellers/stripe/onboarding-refresh`, // A dedicated refresh endpoint/page
      return_url: `${process.env.CLIENT_URL}/sellers/stripe/onboarding-success`, // A dedicated success endpoint/page
      type: 'account_onboarding',
      collect: 'eventually_due', // Recommended for Express accounts to collect all necessary info eventually
    });

    res.status(StatusCodes.OK).json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error); // Log the detailed error for debugging

    // Handle specific Stripe API errors
    if (error.type === 'StripeCardError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
    } else if (error.type === 'StripeInvalidRequestError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: error.param
          ? `Invalid parameter: ${error.param} - ${error.message}`
          : error.message,
      });
    } else if (error.type === 'StripeAPIError') {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        msg: `Stripe API error: ${error.message}`,
      });
    } else if (
      error instanceof CustomError.BadRequestError ||
      error instanceof CustomError.NotFoundError
    ) {
      // Re-throw custom errors which already have appropriate status codes
      throw error;
    }
    // Generic error fallback
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'An unexpected error occurred while creating your Stripe account.',
    });
  }
};

const getStripeConnectAccount = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!id) {
    throw new CustomError.BadRequestError(
      'Please provide a user ID in the URL path to retrieve Stripe account information.'
    );
  }
  try {
    const stripeInfo = await stripeModel.findOne({ sellerId: user._id });
    if (!stripeInfo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: `No Stripe account found for user with ID '${id}'.`,
      });
    }
    res.status(StatusCodes.OK).json(stripeInfo);
  } catch (error) {
    console.error('Error retrieving Stripe account:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Internal Server Error while retrieving Stripe account information.',
    });
  }
};

const hasActiveStripeAccount = async (req, res) => {
  // Destructure id and email directly from req.params
  const { id, email } = req.params;

  if (!id && !email) {
    throw new CustomError.BadRequestError(
      'Please provide either a user ID or email in the URL path to check for Stripe account.'
    );
  }

  let user = null;

  // Find the user based on ID or email from parameters
  if (id) {
    user = await User.findById(id);
    if (!user) {
      throw new CustomError.NotFoundError(`User with ID '${id}' not found.`);
    }
  } else if (email) {
    // This block will run if 'id' is falsy and 'email' is truthy
    user = await User.findOne({ email: email });
    if (!user) {
      throw new CustomError.NotFoundError(
        `User with email '${email}' not found.`
      );
    }
  }

  try {
    let hasStripeAccount = false;
    let isActive = false;

    console.log('Checking Stripe account for user:', user);

    if (user.stripeAccountId) {
      hasStripeAccount = true;

      // Check your stripeModel for the 'code' associated with this user
      // Assuming 'sellerId' in stripeModel links to user._id
      const stripeInfo = await stripeModel.findOne({ sellerId: user._id });

      // An account is considered 'active' if it has a Stripe account ID
      // AND a corresponding entry in your stripeModel with a 'code'
      // (which typically indicates a completed OAuth flow).
      if (stripeInfo && stripeInfo.code) {
        isActive = true;
      }
    }

    // Return the status with account ID if available
    res.status(StatusCodes.OK).json({
      hasStripeAccount: hasStripeAccount,
      isActive: isActive,
      stripeAccountId: user.stripeAccountId || null,
      msg: isActive
        ? 'User has a linked and active Stripe account.'
        : hasStripeAccount
        ? 'User has a linked Stripe account, but it may not be fully active (e.g., activation code not found).'
        : 'User does not have a Stripe account linked.',
    });
  } catch (error) {
    console.error('Error in hasActiveStripeAccount:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Internal Server Error while checking Stripe account status.',
    });
  }
};

const activeStripeConnectAccount = async (req, res) => {
  const { activeCode } = req.params;
  const { id } = req;

  try {
    const userStripeInfo = await stripeModel.findOne({ code: activeCode });

    if (userStripeInfo) {
      await sellerModel.findByIdAndUpdate(id, {
        payment: 'active',
      });
      res.status(StatusCodes.OK).json({ msg: 'payment Active' });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ msg: 'payment Active Fails' });
    }
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Internal Server Error' });
  }
};
// End Method
// Create Payment Intent
const createPaymentIntent = async (req, res) => {
  const { orderItems, shippingAddress, selectedShippingOptions } = req.body;
  let totalAmount = 0;
  let totalShipping = 0;
  let totalTax = 0;
  // console.log('shipping options:', selectedShippingOptions);

  const metadata = {
    customerEmail: '',
    customerFirstName: 'Customer',
  };

  if (!orderItems || orderItems.length < 1) {
    throw new CustomError.BadRequestError('No order items provided');
  }

  if (!selectedShippingOptions || Object.keys(selectedShippingOptions).length === 0) {
    throw new CustomError.BadRequestError('No shipping options selected');
  }

  // Calculate total amount including items, tax, and shipping first
  for (const item of orderItems) {
    const price = item.price;
    const quantity = item.quantity;
    const itemSubtotal = price * quantity;
    totalAmount += itemSubtotal;
    
    // Calculate tax for each item
    const rawTaxRate = item.product?.taxRate || 0;
    const itemTaxRate = rawTaxRate <= 1 ? rawTaxRate : rawTaxRate / 100;
    const itemTax = itemSubtotal * itemTaxRate;
    totalTax += itemTax;
  }
  
  // Add shipping costs from selected options
  if (req.body.shippingTotal) {
    totalShipping = parseFloat(req.body.shippingTotal);
  }
  
  // Calculate comprehensive fee breakdown using our new system
  // Group items by seller to properly handle multi-seller fee calculations
  const itemsBySeller = {};
  
  for (const item of orderItems) {
    const rawStoreId = item.product?.storeId;
    if (!rawStoreId) continue;
    
    // Extract string ID from populated object or use directly if it's already a string
    const storeId = typeof rawStoreId === 'object' && rawStoreId._id 
      ? rawStoreId._id.toString() 
      : rawStoreId.toString();
    
    if (!itemsBySeller[storeId]) {
      itemsBySeller[storeId] = {
        items: [],
        subtotal: 0,
        tax: 0,
        store: null
      };
    }
    
    const itemSubtotal = item.price * item.quantity;
    const rawTaxRate = item.product?.taxRate || 0;
    const itemTaxRate = rawTaxRate <= 1 ? rawTaxRate : rawTaxRate / 100;
    const itemTax = itemSubtotal * itemTaxRate;
    
    itemsBySeller[storeId].items.push(item);
    itemsBySeller[storeId].subtotal += itemSubtotal;
    itemsBySeller[storeId].tax += itemTax;
  }
  
  let feeBreakdown;
  const sellerIds = Object.keys(itemsBySeller);
  
  if (sellerIds.length === 1) {
    // Single seller order
    const sellerId = sellerIds[0];
    const sellerData = itemsBySeller[sellerId];
    const store = await Store.findById(sellerId);
    
    feeBreakdown = calculateOrderFees({
      productSubtotal: sellerData.subtotal,
      taxAmount: sellerData.tax,
      shippingCost: totalShipping,
      grossUpFees: true,
      store: store
    });
  } else {
    // Multi-seller order
    const suborders = [];
    for (const sellerId of sellerIds) {
      const sellerData = itemsBySeller[sellerId];
      const store = await Store.findById(sellerId);
      
      suborders.push({
        storeId: sellerId,
        productSubtotal: sellerData.subtotal,
        taxAmount: sellerData.tax,
        shippingCost: 0, // Shipping handled separately per seller
        store: store
      });
    }
    
    feeBreakdown = calculateMultiSellerOrderFees({
      suborders,
      totalShippingCost: totalShipping,
      grossUpFees: true
    });
  }
  
  // console.log('Fee breakdown:', {
  //   customerPays: feeBreakdown.customerTotal,
  //   sellerReceives: feeBreakdown.sellerReceives,
  //   platformGets: feeBreakdown.platformRevenue,
  //   stripeFee: feeBreakdown.stripeFee,
  //   processingFee: feeBreakdown.breakdown.processingFee
  // });

  // Get user information
  let user = null;
  if (req.user && req.user.userId) {
    user = await User.findById(req.user.userId);
    if (user) {
      metadata.customerFirstName = user.firstName || 'Customer';
      metadata.customerEmail = user.email;
      metadata.buyerId = user._id.toString();
    }
  }
  
  // Store full order data in temporary collection and reference by ID in metadata
  // This avoids Stripe's 500-character limit per metadata value
  const tempOrderData = await TempOrderData.create({
    orderItems,
    shippingAddress,
    billingAddress: req.body.billingAddress || null,
    selectedShippingOptions,
    buyerId: user?._id,
    shippingTotal: totalShipping,
    totalTax,
    subtotal: totalAmount,
    totalAmount: feeBreakdown.customerTotal, // Use calculated total with fees
    customerEmail: user?.email || '',
    customerFirstName: user?.firstName || 'Customer',
    feeBreakdown: feeBreakdown // Store fee breakdown for reference
  });
  
  // Store only the temp order data ID in metadata
  metadata.tempOrderDataId = tempOrderData._id.toString();
  metadata.totalAmount = feeBreakdown.customerTotal; // Customer pays this total
  metadata.subtotal = totalAmount;
  metadata.totalTax = totalTax;
  metadata.totalShipping = totalShipping;
  metadata.processingFee = feeBreakdown.breakdown.processingFee;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(feeBreakdown.customerTotal * 100), // Use grossed-up total
      currency: 'usd',
      payment_method_types: ['card'],
      setup_future_usage: 'off_session', // This saves the card
      metadata: metadata,
    });
    
    // console.log('Payment intent created successfully:', {
    //   customerTotal: feeBreakdown.customerTotal,
    //   originalSubtotal: totalAmount + totalTax + totalShipping,
    //   processingFee: feeBreakdown.breakdown.processingFee,
    //   paymentIntentId: paymentIntent.id
    // });
    
    res
      .status(StatusCodes.OK)
      .json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        feeBreakdown: feeBreakdown // Send fee breakdown to frontend
      });
  } catch (error) {
    console.error('Error creating Payment Intent:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Failed to initiate payment', error: error.message });
  }
};

const updateSellerBalances = async (order) => {
  console.log('Updating seller balances with new fee calculation system...');
  
  for (const subOrder of order.subOrders) {
    try {
      // Get the seller store to find the actual seller (owner)
      const sellerStore = await Store.findById(subOrder.sellerStoreId);
      if (!sellerStore) {
        console.error(`Seller store not found for suborder ${subOrder._id}`);
        continue;
      }
      
      const sellerId = sellerStore.ownerId; // This is the actual seller user ID
      console.log(`Processing seller balance for store ${sellerStore.name} (${subOrder.sellerStoreId}) owned by ${sellerId}`);
      
      // Calculate proper fee breakdown for this suborder using centralized utility
      const productSubtotal = subOrder.totalAmount; // subOrder.totalAmount is already the product subtotal
      const feeBreakdown = calculateOrderFees({
        productSubtotal: productSubtotal,
        taxAmount: subOrder.totalTax || 0,
        shippingCost: 0, // Seller doesn't get shipping, platform keeps it
        grossUpFees: false, // Don't gross up at suborder level
        store: sellerStore // Pass store for grace period check
      });
      
      console.log(`Seller ${sellerId} fee breakdown:`, {
        productSubtotal: productSubtotal,
        sellerReceives: feeBreakdown.sellerReceives,
        platformCommission: feeBreakdown.platformBreakdown.commission,
        stripeFee: feeBreakdown.stripeFee
      });
      
      // Update seller's balance with proper amounts
      const updatedBalance = await SellerBalance.findOneAndUpdate(
        { sellerId: sellerId },
        {
          $inc: {
            totalSales: feeBreakdown.sellerReceives, // What seller actually receives
            pendingBalance: feeBreakdown.sellerReceives, // Add to pending
            commissionDeducted: feeBreakdown.platformBreakdown.commission, // Track commission
            netRevenue: feeBreakdown.sellerReceives // Net after all deductions
          }
        },
        { upsert: true, new: true }
      );
      
      console.log(`Updated seller balance for ${sellerId}:`, {
        totalSales: updatedBalance.totalSales,
        pendingBalance: updatedBalance.pendingBalance,
        commissionDeducted: updatedBalance.commissionDeducted
      });
      
      // Create or update stripe record if it doesn't exist
      const existingStripeRecord = await stripeModel.findOne({ sellerId: sellerId });
      if (!existingStripeRecord) {
        console.log(`No Stripe record found for seller ${sellerId}, they need to connect their Stripe account`);
        // We don't create a stripe record here because it needs proper onboarding
      } else {
        console.log(`Stripe record exists for seller ${sellerId}:`, existingStripeRecord.stripeAccountId);
      }
      
    } catch (error) {
      console.error(`Error updating seller balance for suborder ${subOrder._id}:`, error);
      // Continue processing other suborders even if one fails
    }
  }
};

const confirmPayment = async (orderId, paymentIntentId) => {
  console.log('Confirming payment for order:', orderId, 'paymentIntent:', paymentIntentId);
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const order = await Order.findById(orderId)
      .populate('subOrders')
      .session(session);

    if (!order) {
      throw new CustomError.BadRequestError(
        `No order found with id: ${orderId}.`
      );
    }
    
    // Get the original fee breakdown from temp order data or payment intent metadata
    let originalFeeBreakdown = null;
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const tempOrderDataId = paymentIntent.metadata.tempOrderDataId;
      if (tempOrderDataId) {
        const tempOrderData = await TempOrderData.findById(tempOrderDataId);
        if (tempOrderData && tempOrderData.feeBreakdown) {
          originalFeeBreakdown = tempOrderData.feeBreakdown;
          console.log('📊 Retrieved original fee breakdown from temp order data:', {
            customerTotal: originalFeeBreakdown.customerTotal,
            sellerReceives: originalFeeBreakdown.sellerReceives,
            platformRevenue: originalFeeBreakdown.platformRevenue
          });
        }
      }
    } catch (error) {
      console.log('⚠️ Could not retrieve original fee breakdown, will recalculate:', error.message);
    }
    
    // Update order payment status
    order.paymentStatus = 'Paid';
    order.fulfillmentStatus = 'Placed';
    order.paymentIntentId = paymentIntentId;
    await order.save({ session });
    console.log('Order status updated successfully');

    const suborders = order.subOrders;

    // Process each suborder
    for (let suborder of suborders) {
      console.log(`🔄 Processing suborder ${suborder._id} for seller store ${suborder.sellerStoreId}`);
      
      const sellerStore = await Store.findById(suborder.sellerStoreId);
      if (!sellerStore) {
        console.error(`❌ Seller store not found for suborder ${suborder._id}`);
        continue;
      }
      
      console.log(`📊 Found seller store: ${sellerStore.name} (${sellerStore._id}) owned by ${sellerStore.ownerId}`);
      
      // Get the correct seller ID from store owner, not store ID
      const sellerId = sellerStore.ownerId;
      
      // Check if seller has a Stripe account
      const seller = await stripeModel.findOne({ sellerId: sellerId });
      console.log(`💳 Stripe account for seller ${sellerId}:`, seller ? `Found: ${seller.stripeAccountId}` : 'Not found');
      
      // Update suborder payment status
      suborder.paymentStatus = 'Paid';
      await suborder.save({ session });
      console.log(`✅ Updated suborder ${suborder._id} payment status to Paid`);

      console.log(`💰 Suborder amounts:`, {
        totalAmount: suborder.totalAmount,
        totalTax: suborder.totalTax,
        totalShipping: suborder.totalShipping
      });
      
      // Use the original fee breakdown if available, otherwise recalculate
      let feeBreakdown;
      console.log(`🔍 Suborder count: ${suborder.length}`);
      console.log(`Original fee breakdown:`, originalFeeBreakdown);
      if (originalFeeBreakdown && suborders.length === 1) {
        // Single suborder - use the original fee breakdown directly
        feeBreakdown = {
          sellerReceives: originalFeeBreakdown.sellerReceives,
          platformBreakdown: {
            commission: originalFeeBreakdown.platformBreakdown?.commission || 0
          }
        };
        console.log(`✅ Using original fee breakdown for single suborder:`, {
          sellerReceives: feeBreakdown.sellerReceives,
          platformCommission: feeBreakdown.platformBreakdown.commission
        });
      } else {
        // Multiple suborders or no original breakdown - use centralized fee calculation
        const productSubtotal = suborder.totalAmount; // suborder.totalAmount already excludes tax and shipping
        const taxAmount = suborder.totalTax || 0;
        
        const suborderFeeBreakdown = calculateOrderFees({
          productSubtotal: productSubtotal,
          taxAmount: taxAmount,
          shippingCost: 0, // Shipping is handled separately
          grossUpFees: false, // Don't gross up at suborder level, already done at main order
          store: sellerStore
        });
        
        feeBreakdown = {
          sellerReceives: suborderFeeBreakdown.sellerReceives,
          platformBreakdown: {
            commission: suborderFeeBreakdown.platformBreakdown?.commission || 0
          }
        };
        
        console.log(`🔄 Calculated fee breakdown for suborder using utility:`, {
          sellerReceives: feeBreakdown.sellerReceives,
          platformCommission: feeBreakdown.platformBreakdown.commission
        });
      }

      // Update seller's balance with proper amounts from fee calculation  
      const updatedBalance = await SellerBalance.findOneAndUpdate(
        { sellerId: sellerId },
        {
          $inc: {
            totalSales: feeBreakdown.sellerReceives,
            pendingBalance: feeBreakdown.sellerReceives,
            commissionDeducted: feeBreakdown.platformBreakdown?.commission || 0,
            netRevenue: feeBreakdown.sellerReceives
          },
        },
        { upsert: true, session, new: true }
      );
      
      console.log(`✅ Updated seller balance for seller ${sellerId}:`, {
        totalSales: updatedBalance.totalSales,
        pendingBalance: updatedBalance.pendingBalance,
        commissionDeducted: updatedBalance.commissionDeducted
      });
      
      // Create transaction record for tracking
      try {
        const transaction = await Transaction.create({
          order: order._id,
          seller: sellerId,
          grossAmount: suborder.totalAmount, // Full suborder amount
          netAmount: feeBreakdown.sellerReceives, // What seller actually gets
          commission: feeBreakdown.platformBreakdown?.commission || 0, // Platform commission
          stripeTransferId: suborder.transferId || null, // Will be null initially
          status: 'paid'
        });
        
        console.log(`💳 Created transaction record for seller ${sellerId}:`, {
          transactionId: transaction._id,
          grossAmount: transaction.grossAmount,
          netAmount: transaction.netAmount,
          commission: transaction.commission
        });
      } catch (transactionError) {
        console.error(`❌ Failed to create transaction record for seller ${sellerId}:`, transactionError.message);
        // Don't fail the entire process if transaction record creation fails
      }
    }
    
    await session.commitTransaction();
    console.log('Payment confirmation completed successfully');
    
    // Send emails after successful transaction
    try {
      // Get order details for emails
      const buyer = await User.findById(order.buyerId);
      
      // Only send email if buyer exists and has email
      if (buyer && buyer.email) {
        await sendBuyerPaymentConfirmationEmail({
          name: buyer.firstName || 'Customer',
          email: buyer.email,
          orderId: orderId,
        });
        console.log('Buyer confirmation email sent successfully');
      } else {
        console.log('Buyer not found or email missing, skipping confirmation email');
      }
      
      // Send emails to sellers
      for (const subOrder of suborders) {
        try {
          await sendSellerNewOrderNotificationEmail({
            sellerStoreId: subOrder.sellerStoreId,
            orderId: orderId,
            sellerOrderItems: subOrder.products,
            sellerSubtotal: subOrder.totalAmount,
            sellerTax: subOrder.totalTax,
            sellerShipping: subOrder.totalShipping,
          });
          console.log(`Seller notification email sent for store ${subOrder.sellerStoreId}`);
        } catch (emailError) {
          console.error(`Failed to send seller notification email for store ${subOrder.sellerStoreId}:`, emailError.message);
        }
      }
    } catch (emailError) {
      console.error('Failed to send emails:', emailError.message);
      // Don't fail the entire confirmation if email fails
    }
    
    return { success: true, orderId, paymentIntentId };
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Error confirming payment:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// HTTP endpoint wrapper for confirmPayment
const confirmPaymentEndpoint = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    
    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ 
        msg: 'orderId and paymentIntentId are required' 
      });
    }
    
    const result = await confirmPayment(orderId, paymentIntentId);
    res.status(200).json({ 
      msg: 'Payment confirmed successfully', 
      ...result 
    });
    
  } catch (error) {
    console.error('Error in confirmPayment endpoint:', error);
    res.status(500).json({ 
      msg: 'Payment confirmation failed', 
      error: error.message 
    });
  }
};
const sellerRequestPayOut = async (req, res) => {
  try {
    const { sellerId, amount } = req.body;

    if (!sellerId || !amount) {
      return res
        .status(400)
        .json({ msg: 'Seller ID and amount are required.' });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ msg: 'Amount must be greater than 0.' });
    }

    // Check seller balance
    const balance = await SellerBalance.findOne({ sellerId });
    console.log('Current balance:', balance);
    
    if (!balance) {
      return res
        .status(400)
        .json({ msg: 'No balance found for this seller.' });
    }

    if (balance.availableBalance < amount) {
      return res
        .status(400)
        .json({ msg: 'Insufficient balance for withdrawal.' });
    }

    // Create payout request record
    const payoutRequest = {
      amount: amount,
      requestedAt: new Date(),
      status: 'pending',
      requestId: `payout_${Date.now()}_${sellerId}`
    };

    // Update seller balance - move from available to pending and add to payouts array
    const updatedBalance = await SellerBalance.findOneAndUpdate(
      { sellerId },
      {
        $inc: {
          availableBalance: -amount,
          pendingBalance: amount
        },
        $push: {
          payouts: payoutRequest
        }
      },
      { new: true }
    );

    console.log('Updated balance:', updatedBalance);

    res.status(200).json({ 
      msg: 'Payout request sent. Awaiting admin approval.',
      success: true,
      data: {
        requestId: payoutRequest.requestId,
        amount: amount,
        remainingAvailableBalance: updatedBalance.availableBalance
      }
    });
  } catch (error) {
    console.error('Error processing payout request:', error);
    res
      .status(500)
      .json({ msg: 'Internal server error while processing payout request.' });
  }
};

const getSellerRevenue = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const sellerStore = await Store.findById(sellerId);
    if (!sellerStore) {
      throw new CustomError.BadRequestError('No store found for this seller');
    }
    if (sellerStore.ownerId.toString() !== req.user.userId) {
      throw new CustomError.UnauthorizedError(
        'Not  authorized to view the dashboard'
      );
    }
    const sellerRevenue = await SellerBalance.findOne({ sellerId });

    // Handle case when no revenue has been generated yet
    if (!sellerRevenue) {
      // Return a default empty revenue structure instead of throwing an error
      const emptyRevenue = {
        sellerId: sellerId,
        totalRevenue: 0,
        availableBalance: 0,
        pendingBalance: 0,
        totalCommissionPaid: 0,
        totalStripeFeesPaid: 0,
        payouts: [],
        lastUpdated: new Date(),
        message: 'No revenue generated yet. Start selling to see your earnings here!'
      };
      return res.status(200).json(emptyRevenue);
    }

    res.status(200).json(sellerRevenue);
  } catch (error) {
    console.error('Error fetching seller revenue:', error);
    res.status(500).json({ 
      msg: 'Internal server error while fetching seller revenue',
      error: error.message 
    });
  }
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
    //   return res.status(400).json({ msg: 'Customer ID is required' });
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
      .json({ msg: 'Internal Server Error', error: error.message });
  }
};

// controllers/subscriptionController.js

//const User = require('../models/User');
///const asyncHandler = require('express-async-handler');

const createSubscription = async (req, res) => {
  const { sellerId, paymentMethodId } = req.body;

  // Fetch seller from database
  const seller = await stripeModel.findOne({ sellerId: sellerId });
  console.log(seller.stripeCustomerId);
  if (!seller || !seller.stripeCustomerId) {
    throw new Error('Seller not found or not connected to Stripe');
  }

  const existingSubscriptions = await stripe.subscriptions.list({
    customer: seller.stripeCustomerId,
    status: 'active', // Only fetch active subscriptions
  });

  if (existingSubscriptions.data.length > 0) {
    return res.status(400).json({
      message: 'Customer already has an active subscription.',
    });
  }

  try {
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: seller.stripeCustomerId,
    });
    // Set default payment method on the customer
    await stripe.customers.update(seller.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    // Create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: seller.stripeCustomerId,
      trial_period_days: 60, // trial period
      items: [{ price: 'price_1ROrRfIxvdd0pNY4DoSTBU5s' }], // Monthly plan price ID
      expand: ['latest_invoice.payment_intent'],
    });
    // Save the subscription ID in the database
    seller.subscriptionId = subscription.id;
    await seller.save();

    res.status(200).json({
      success: true,
      message: 'Subscription created successfully',
      subscription,
    });
  } catch (error) {
    console.error('Error creating subscription:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  const { subscriptionId } = req.body;

  try {
    await stripe.subscriptions.cancel(subscriptionId);
    res
      .status(200)
      .json({ success: true, message: 'Subscription canceled successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const refundTest = async (req, res) => {
  //sample data

    try {
    const stripeInfo = await stripeModel.create({
      sellerId: seller._id,
      sellerEmail: email, // Store email for traceability
      storeId: store._id,
      code: uuidv4(), // Generate unique code for internal tracking
      stripeAccountId: stripeAccount.id,
      // You might also store `object: 'account_link'` or a status here.
    });

    return res.status(200).json({ msg: 'Success.' });
  } catch (error) {
    console.error('Failed ', error);
    return res.status(500).json({ msg: 'Failed to retrieve.' });
  }
};
// Get user payment methods
const getUserPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.stripeAccountId) {
      return res.json({ methods: [] });
    }
    const methods = await stripe.paymentMethods.list({
      customer: user.stripeAccountId,
      type: 'card',
    });
    res.json({ methods: methods.data });
  } catch (error) {
    console.error('Error fetching user payment methods:', error);
    res.status(500).json({ error: error.message });
  }
};

// Confirm payment with saved card
const confirmWithSavedCard = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user || !user.stripeAccountId || !user.stripeDefaultPaymentMethodId) {
      return res.status(400).json({ error: 'No saved payment method or Stripe customer.' });
    }

    await stripe.paymentIntents.update(paymentIntentId, {
      payment_method: user.stripeDefaultPaymentMethodId,
      customer: user.stripeAccountId,
    });

    // Confirm payment intent with saved card
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: user.stripeDefaultPaymentMethodId,
    });
    
    if (paymentIntent.status === 'succeeded') {
      console.log('Payment confirmed with saved card, creating order...');
      
      // Since we bypassed the webhook, manually create the order
      try {
        // Handle both old and new metadata formats for backward compatibility
        let orderItems, shippingAddress, selectedShippingOptions, billingAddress;
        
        if (paymentIntent.metadata.orderItems) {
          // Old format - legacy support
          console.log('Using legacy metadata format');
          orderItems = JSON.parse(paymentIntent.metadata.orderItems);
          shippingAddress = JSON.parse(paymentIntent.metadata.shippingAddress);
          selectedShippingOptions = paymentIntent.metadata.selectedShippingOptions ?
            JSON.parse(paymentIntent.metadata.selectedShippingOptions) : null;
          billingAddress = paymentIntent.metadata.billingAddress ? 
            JSON.parse(paymentIntent.metadata.billingAddress) : null;
        } else if (paymentIntent.metadata.tempOrderDataId) {
          // New format - fetch from temp collection
          console.log('Using temp order data format');
          const tempOrderData = await TempOrderData.findById(paymentIntent.metadata.tempOrderDataId);
          if (!tempOrderData) {
            throw new CustomError.BadRequestError('Temp order data not found');
          }
          orderItems = tempOrderData.orderItems;
          shippingAddress = tempOrderData.shippingAddress;
          selectedShippingOptions = tempOrderData.selectedShippingOptions;
          billingAddress = tempOrderData.billingAddress;
          
          // Clean up temp data after successful retrieval
          await TempOrderData.findByIdAndDelete(paymentIntent.metadata.tempOrderDataId);
        } else {
          throw new CustomError.BadRequestError('No order data found in payment intent metadata');
        }
        
        const totalShipping = parseFloat(paymentIntent.metadata.totalShipping || '0');
        const totalTax = parseFloat(paymentIntent.metadata.totalTax || '0');
        const subtotal = parseFloat(paymentIntent.metadata.subtotal || '0');
        const buyerId = paymentIntent.metadata.buyerId;
        const customerEmail = paymentIntent.metadata.customerEmail;
        const customerFirstName = paymentIntent.metadata.customerFirstName;
        const totalAmount = parseFloat(paymentIntent.metadata.totalAmount);
        const paymentMethodId = paymentIntent.payment_method;

        // Create the order
        const orderId = await createOrderUtil({
          cartItems: orderItems,
          shippingFee: totalShipping,
          selectedShippingOptions: selectedShippingOptions,
          paymentMethod: 'credit_card',
          buyerId: buyerId,
          shippingAddress: shippingAddress,
          billingAddress: billingAddress
        });
        
        console.log('Order created successfully. Order ID:', orderId);
        const order = await Order.findById(orderId).populate('subOrders');
        
        order.paymentStatus = 'Paid';
        order.fulfillmentStatus = 'Placed';
        order.paymentIntentId = paymentIntentId;
        
        await order.save();
        console.log(`Order updated successfully - paymentIntentId: ${order.paymentIntentId}, status: ${order.fulfillmentStatus}`);
        
        // Send confirmation emails (same as webhook)
        try {
          await sendBuyerPaymentConfirmationEmail({
            name: customerFirstName,
            email: customerEmail,
            orderId: orderId,
          });
          console.log('Buyer confirmation email sent successfully.');
        } catch (emailError) {
          console.error('Failed to send buyer confirmation email:', emailError.message);
        }

        // Use the centralized confirmPayment function to handle seller balances
        console.log('Calling confirmPayment to process seller balances...');
        try {
          await confirmPayment(orderId, paymentIntentId);
          console.log('✅ Payment confirmation and seller balance updates completed successfully');
        } catch (confirmError) {
          console.error('❌ Error in confirmPayment (seller balances may not be updated):', confirmError.message);
          // Don't fail the entire process since the order was created successfully
        }
        
        return res.json({ success: true, orderId: orderId });
        
      } catch (orderError) {
        console.error('Error creating order after payment confirmation:', orderError);
        // Payment succeeded but order creation failed - this is a critical error
        return res.status(500).json({ 
          error: 'Payment processed but order creation failed. Please contact support.', 
          paymentIntentId: paymentIntentId 
        });
      }
      
    } else {
      return res.status(400).json({ error: 'Payment failed', status: paymentIntent.status });
    }
  } catch (error) {
    console.error('Error confirming payment with saved card:', error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  webhookHandler,
  createStripeConnectAccount,
  getStripeConnectAccount,
  hasActiveStripeAccount,
  createPaymentIntent,
  confirmPayment, // Export the utility function for testing
  confirmPaymentEndpoint, // Export the HTTP endpoint wrapper
  updateSellerBalances,
  getSellerRevenue,
  sellerRequestPayOut,
  processRefund,
  createCustomerSession,
  createSubscription,
  cancelSubscription,
  refundTest,
  getUserPaymentMethods,
  confirmWithSavedCard,
};
