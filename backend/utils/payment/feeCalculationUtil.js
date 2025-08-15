const PLATFORM_FEE_PERCENTAGE = 0.10; // 10% platform fee
const STRIPE_PERCENTAGE_FEE = 0.029; // 2.9% Stripe fee
const STRIPE_FIXED_FEE = 0.30; // $0.30 Stripe fixed fee

/**
 * Calculate comprehensive fee breakdown for an order
 * @param {Object} params - Calculation parameters
 * @param {number} params.productSubtotal - Total product cost (price * quantity)
 * @param {number} params.taxAmount - Tax amount (calculated from product subtotal)
 * @param {number} params.shippingCost - Shipping cost for this order/suborder
 * @param {boolean} params.grossUpFees - Whether to gross up fees (default: true)
 * @returns {Object} Complete fee breakdown
 */
function calculateOrderFees({
  productSubtotal,
  taxAmount,
  shippingCost,
  grossUpFees = true
}) {
  // Validate inputs
  if (productSubtotal < 0 || taxAmount < 0 || shippingCost < 0) {
    throw new Error('All amounts must be non-negative');
  }

  // Base amounts that seller and customer see
  const sellerReceives = productSubtotal + taxAmount; // Seller gets product price + tax
  const platformShippingRevenue = shippingCost; // Platform keeps all shipping fees
  const platformCommission = productSubtotal * PLATFORM_FEE_PERCENTAGE; // 10% of product subtotal

  // Calculate customer total before Stripe fees
  const customerSubtotal = productSubtotal + taxAmount + shippingCost;
  
  let customerTotal;
  let stripeFee;
  let platformRevenue;
  let netSellerReceives;

  if (grossUpFees) {
    // Gross-up model: Calculate total needed to cover all fees
    // We need to find X where: X - (X * 0.029 + 0.30) = customerSubtotal
    // Solving for X: X = (customerSubtotal + 0.30) / (1 - 0.029)
    customerTotal = (customerSubtotal + STRIPE_FIXED_FEE) / (1 - STRIPE_PERCENTAGE_FEE);
    stripeFee = (customerTotal * STRIPE_PERCENTAGE_FEE) + STRIPE_FIXED_FEE;
    
    // Platform gets: commission + shipping + (grossed up amount - original subtotal) - stripe fees
    const grossUpAmount = customerTotal - customerSubtotal;
    platformRevenue = platformCommission + platformShippingRevenue + grossUpAmount - stripeFee;
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
      processingFee: grossUpFees ? roundMoney(customerTotal - customerSubtotal) : 0
    },
    
    // Seller perspective
    sellerReceives: roundMoney(netSellerReceives),
    sellerBreakdown: {
      productRevenue: roundMoney(productSubtotal),
      taxCollected: roundMoney(taxAmount),
      totalEarnings: roundMoney(netSellerReceives)
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
      platformCommission: `Platform fee (${(feeCalculation.platformFeePercentage * 100)}%)`,
      processingFee: feeCalculation.feeModel === 'gross-up' 
        ? 'Payment processing fee' 
        : 'Processing fee included',
      shippingNote: 'Shipping handled by platform'
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
  PLATFORM_FEE_PERCENTAGE,
  STRIPE_PERCENTAGE_FEE,
  STRIPE_FIXED_FEE
};
