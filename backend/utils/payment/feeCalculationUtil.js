// Get fee constants from environment variables
const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '0.10'); // Default 10%
const STRIPE_PERCENTAGE_FEE = parseFloat(process.env.STRIPE_PERCENTAGE_FEE || '0.029'); // Default 2.9%
const STRIPE_FIXED_FEE = parseFloat(process.env.STRIPE_FIXED_FEE || '0.30'); // Default $0.30
const PLATFORM_FEE_GRACE_PERIOD_DAYS = parseInt(process.env.PLATFORM_FEE_GRACE_PERIOD_DAYS || '60'); // Default 60 days

/**
 * Check if a store is within its grace period (no platform fees)
 * @param {Object} store - Store object with grace period dates
 * @returns {boolean} True if store is within grace period
 */
function isStoreInGracePeriod(store) {
  if (!store || !store.gracePeriodStart || !store.gracePeriodEnd) {
    return false;
  }
  
  const now = new Date();
  return now >= store.gracePeriodStart && now <= store.gracePeriodEnd;
}

/**
 * Calculate days remaining in grace period
 * @param {Object} store - Store object with grace period dates
 * @returns {number} Days remaining in grace period (0 if expired)
 */
function getGracePeriodDaysRemaining(store) {
  if (!store || !store.gracePeriodEnd || !isStoreInGracePeriod(store)) {
    return 0;
  }
  
  const now = new Date();
  const timeDiff = store.gracePeriodEnd.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(0, daysRemaining);
}

/**
 * Initialize grace period for a new store
 * @param {Date} activationDate - Date when store becomes active
 * @returns {Object} Grace period dates
 */
function initializeGracePeriod(activationDate = new Date()) {
  const gracePeriodStart = new Date(activationDate);
  const gracePeriodEnd = new Date(activationDate);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + PLATFORM_FEE_GRACE_PERIOD_DAYS);
  
  return {
    gracePeriodStart,
    gracePeriodEnd,
    gracePeriodNotificationSent: false,
    platformFeesActive: false
  };
}

/**
 * Calculate comprehensive fee breakdown for an order
 * NEW MODEL: Platform fees are included in seller's listing price
 * @param {Object} params - Calculation parameters
 * @param {number} params.productSubtotal - Total product cost (price * quantity) - INCLUDES platform fee
 * @param {number} params.taxAmount - Tax amount (calculated from product subtotal)
 * @param {number} params.shippingCost - Shipping cost for this order/suborder
 * @param {boolean} params.grossUpFees - Whether to gross up fees (default: true)
 * @param {Object} params.store - Store object to check grace period (optional)
 * @returns {Object} Complete fee breakdown
 */
function calculateOrderFees({
  productSubtotal,
  taxAmount,
  shippingCost,
  grossUpFees = true,
  store = null
}) {
  // Validate inputs
  if (productSubtotal < 0 || taxAmount < 0 || shippingCost < 0) {
    throw new Error('All amounts must be non-negative');
  }

  // Check if store is in grace period (no platform fees)
  const inGracePeriod = store ? isStoreInGracePeriod(store) : false;
  const gracePeriodDaysRemaining = store ? getGracePeriodDaysRemaining(store) : 0;
  
  // NEW MODEL: Platform fee is already included in the product subtotal
  // BUT if in grace period, seller gets the full amount
  let platformCommission, sellerNetRevenue, sellerReceives;
  
  if (inGracePeriod) {
    // During grace period: seller gets full product price, no commission deducted
    platformCommission = 0;
    sellerNetRevenue = productSubtotal;
    sellerReceives = productSubtotal + taxAmount;
    console.log('Store in grace period - no platform fees applied');
  } else {
    // After grace period: normal fee calculation
    platformCommission = productSubtotal * PLATFORM_FEE_PERCENTAGE; // 10% of listed price
    sellerNetRevenue = productSubtotal - platformCommission; // What seller actually gets from product sale
    sellerReceives = sellerNetRevenue + taxAmount; // Seller gets net product revenue + tax
  }
  
  const platformShippingRevenue = shippingCost; // Platform keeps all shipping fees

  // Calculate customer total before Stripe fees
  const customerSubtotal = productSubtotal + taxAmount + shippingCost;
  
  let customerTotal;
  let processingFee = 0; // Only used in gross-up model
  let stripeFee;
  let platformRevenue;
  let netSellerReceives;

  if (grossUpFees) {
    // Gross-up model: Calculate total needed to cover ALL costs (seller payout + platform costs + stripe fees)
    // Total costs that need to be covered after Stripe fees are deducted:
    const totalCostsNeeded = sellerReceives + platformShippingRevenue + platformCommission;
    console.log('Platform commission:', platformCommission);
    console.log('Platform shipping revenue:', platformShippingRevenue);
    console.log('Seller receives:', sellerReceives);
    console.log('Seller net product revenue:', sellerNetRevenue);
    console.log('Total costs needed:', totalCostsNeeded);

    // We need to find X where: X - (X * 0.029 + 0.30) = totalCostsNeeded
    // Solving for X: X = (totalCostsNeeded + 0.30) / (1 - 0.029)
    customerTotal = (totalCostsNeeded + STRIPE_FIXED_FEE) / (1 - STRIPE_PERCENTAGE_FEE);
    processingFee = customerTotal - totalCostsNeeded; // This is the gross-up fee added to customer total
    stripeFee = (customerTotal * STRIPE_PERCENTAGE_FEE) + STRIPE_FIXED_FEE;

    console.log('Gross-up model:');
    console.log('Total costs needed:', totalCostsNeeded);
    console.log('Customer total:', customerTotal);
    console.log('Processing fee (gross-up):', processingFee);
    console.log('Stripe fee:', stripeFee);
    
    // Platform gets: commission + shipping (all costs are covered)
    platformRevenue = platformCommission + platformShippingRevenue;
    netSellerReceives = sellerReceives; // Seller protected from fees
    
  } else {
    // Absorb model: Platform absorbs Stripe fees in commission
    customerTotal = customerSubtotal;
    stripeFee = (customerTotal * STRIPE_PERCENTAGE_FEE) + STRIPE_FIXED_FEE;
    
    // Platform gets: commission + shipping - stripe fees
    platformRevenue = platformCommission + platformShippingRevenue - stripeFee;
    netSellerReceives = sellerReceives; // Seller still protected
  }

  // Round all monetary values to 2 decimal places
  const roundMoney = (amount) => Math.round(amount * 100) / 100;

  return {
    // Customer perspective
    customerTotal: roundMoney(customerTotal),
    customerSubtotal: roundMoney(customerSubtotal),
    breakdown: {
      productSubtotal: roundMoney(productSubtotal),
      tax: roundMoney(taxAmount),
      shipping: roundMoney(shippingCost),
      processingFee: grossUpFees ? roundMoney(processingFee) : 0
    },
    
    // Seller perspective
    sellerReceives: roundMoney(netSellerReceives),
    sellerBreakdown: {
      listedProductPrice: roundMoney(productSubtotal), // What customer sees/pays
      platformCommissionDeducted: roundMoney(platformCommission), // Platform's cut
      netProductRevenue: roundMoney(sellerNetRevenue), // What seller gets from product sale
      taxCollected: roundMoney(taxAmount), // Tax seller receives
      totalEarnings: roundMoney(netSellerReceives) // Net revenue + tax
    },
    
    // Platform perspective
    platformRevenue: roundMoney(platformRevenue),
    platformBreakdown: {
      commission: roundMoney(platformCommission),
      shippingRevenue: roundMoney(platformShippingRevenue),
      stripeFeesCovered: roundMoney(stripeFee),
      netRevenue: roundMoney(platformRevenue)
    },
    
    // Stripe perspective
    stripeFee: roundMoney(stripeFee),
    stripeBreakdown: {
      percentageFee: roundMoney(customerTotal * STRIPE_PERCENTAGE_FEE),
      fixedFee: STRIPE_FIXED_FEE,
      totalFee: roundMoney(stripeFee)
    },
    
    // Calculation metadata
    feeModel: grossUpFees ? 'gross-up' : 'absorb',
    platformFeePercentage: PLATFORM_FEE_PERCENTAGE,
    stripeFeePercentage: STRIPE_PERCENTAGE_FEE,
    stripeFixedFee: STRIPE_FIXED_FEE
  };
}

/**
 * Calculate fees for multiple items (full order with suborders)
 * @param {Array} suborders - Array of suborder objects
 * @param {boolean} grossUpFees - Whether to gross up fees
 * @returns {Object} Aggregated fee breakdown
 */
function calculateMultiSellerOrderFees(suborders, grossUpFees = true) {
  const aggregated = {
    customerTotal: 0,
    customerSubtotal: 0,
    totalSellerPayouts: 0,
    totalPlatformRevenue: 0,
    totalStripeFees: 0,
    suborderBreakdowns: [],
    summary: {
      totalProducts: 0,
      totalTax: 0,
      totalShipping: 0,
      totalProcessingFee: 0,
      totalCommission: 0
    }
  };

  for (const suborder of suborders) {
    const fees = calculateOrderFees({
      productSubtotal: suborder.productSubtotal,
      taxAmount: suborder.taxAmount,
      shippingCost: suborder.shippingCost,
      grossUpFees
    });

    // Aggregate totals
    aggregated.customerTotal += fees.customerTotal;
    aggregated.customerSubtotal += fees.customerSubtotal;
    aggregated.totalSellerPayouts += fees.sellerReceives;
    aggregated.totalPlatformRevenue += fees.platformRevenue;
    aggregated.totalStripeFees += fees.stripeFee;
    
    // Aggregate summary
    aggregated.summary.totalProducts += fees.breakdown.productSubtotal;
    aggregated.summary.totalTax += fees.breakdown.tax;
    aggregated.summary.totalShipping += fees.breakdown.shipping;
    aggregated.summary.totalProcessingFee += fees.breakdown.processingFee;
    aggregated.summary.totalCommission += fees.platformBreakdown.commission;

    // Store individual suborder breakdown
    aggregated.suborderBreakdowns.push({
      sellerId: suborder.sellerId,
      sellerName: suborder.sellerName,
      fees: fees
    });
  }

  // Round aggregated values
  const roundMoney = (amount) => Math.round(amount * 100) / 100;
  
  Object.keys(aggregated).forEach(key => {
    if (typeof aggregated[key] === 'number') {
      aggregated[key] = roundMoney(aggregated[key]);
    }
  });

  Object.keys(aggregated.summary).forEach(key => {
    aggregated.summary[key] = roundMoney(aggregated.summary[key]);
  });

  return aggregated;
}

/**
 * Display-friendly fee breakdown for frontend
 * @param {Object} feeCalculation - Result from calculateOrderFees
 * @returns {Object} Frontend-friendly fee breakdown
 */
function getFrontendFeeDisplay(feeCalculation) {
  return {
    subtotal: feeCalculation.breakdown.productSubtotal,
    tax: feeCalculation.breakdown.tax,
    shipping: feeCalculation.breakdown.shipping,
    processingFee: feeCalculation.breakdown.processingFee,
    total: feeCalculation.customerTotal,
    
    // Additional info for transparency
    feeExplanation: {
      platformCommission: `Platform fee (${(feeCalculation.platformFeePercentage * 100)}%) already included in listed price`,
      processingFee: feeCalculation.feeModel === 'gross-up' 
        ? 'Payment processing fee to cover transaction costs' 
        : 'Processing fee included',
      shippingNote: 'Shipping handled by platform',
      pricingNote: 'Listed prices include platform fees - sellers receive the net amount after platform commission'
    }
  };
}

/**
 * Calculate estimated delivery date
 * @param {Date} orderDate - Order creation date
 * @param {number} businessDays - Number of business days for delivery
 * @returns {Date} Estimated delivery date
 */
function calculateEstimatedDelivery(orderDate, businessDays = 5) {
  const deliveryDate = new Date(orderDate);
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
      daysAdded++;
    }
  }
  
  return deliveryDate;
}

module.exports = {
  calculateOrderFees,
  calculateMultiSellerOrderFees,
  getFrontendFeeDisplay,
  calculateEstimatedDelivery,
  isStoreInGracePeriod,
  getGracePeriodDaysRemaining,
  initializeGracePeriod,
  PLATFORM_FEE_PERCENTAGE,
  STRIPE_PERCENTAGE_FEE,
  STRIPE_FIXED_FEE,
  PLATFORM_FEE_GRACE_PERIOD_DAYS
};
