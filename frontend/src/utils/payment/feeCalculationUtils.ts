// Constants matching backend
export const PLATFORM_FEE_PERCENTAGE = 0.10; // 10% platform fee
export const STRIPE_PERCENTAGE_FEE = 0.029; // 2.9% Stripe fee  
export const STRIPE_FIXED_FEE = 0.30; // $0.30 Stripe fixed fee

export interface FeeCalculationParams {
  productSubtotal: number;
  taxAmount: number;
  shippingCost: number;
  grossUpFees?: boolean;
}

export interface FeeBreakdown {
  customerTotal: number;
  customerSubtotal: number;
  breakdown: {
    productSubtotal: number;
    tax: number;
    shipping: number;
    processingFee: number;
  };
  sellerReceives: number;
  sellerBreakdown: {
    productRevenue: number;
    taxCollected: number;
    totalEarnings: number;
  };
  platformRevenue: number;
  platformBreakdown: {
    commission: number;
    shippingRevenue: number;
    stripeFeesCovered: number;
    netRevenue: number;
  };
  stripeFee: number;
  stripeBreakdown: {
    percentageFee: number;
    fixedFee: number;
    totalFee: number;
  };
  feeModel: 'gross-up' | 'absorb';
  platformFeePercentage: number;
  stripeFeePercentage: number;
  stripeFixedFee: number;
}

export interface CartItem {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  product: {
    _id: string;
    title: string;
    price: number;
    taxRate: number;
    storeId: {
      _id: string;
      storeName: string;
    };
  };
  storeId?: string;
  sellerId?: string;
}

export interface ShippingOption {
  [sellerId: string]: string; // seller ID -> rate ID
}

/**
 * Calculate comprehensive fee breakdown for an order
 */
export function calculateOrderFees({
  productSubtotal,
  taxAmount,
  shippingCost,
  grossUpFees = true
}: FeeCalculationParams): FeeBreakdown {
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
  
  let customerTotal: number;
  let stripeFee: number;
  let platformRevenue: number;
  const netSellerReceives = sellerReceives;

  if (grossUpFees) {
    // Gross-up model: Calculate total needed to cover all fees
    // We need to find X where: X - (X * 0.029 + 0.30) = customerSubtotal
    // Solving for X: X = (customerSubtotal + 0.30) / (1 - 0.029)
    customerTotal = (customerSubtotal + STRIPE_FIXED_FEE) / (1 - STRIPE_PERCENTAGE_FEE);
    stripeFee = (customerTotal * STRIPE_PERCENTAGE_FEE) + STRIPE_FIXED_FEE;
    
    // Platform gets: commission + shipping + (grossed up amount - original subtotal) - stripe fees
    const grossUpAmount = customerTotal - customerSubtotal;
    platformRevenue = platformCommission + platformShippingRevenue + grossUpAmount - stripeFee;
    
  } else {
    // Absorb model: Platform absorbs Stripe fees in commission
    customerTotal = customerSubtotal;
    stripeFee = (customerTotal * STRIPE_PERCENTAGE_FEE) + STRIPE_FIXED_FEE;
    
    // Platform gets: commission + shipping - stripe fees
    platformRevenue = platformCommission + platformShippingRevenue - stripeFee;
  }

  // Round all monetary values to 2 decimal places
  const roundMoney = (amount: number): number => Math.round(amount * 100) / 100;

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
 * Calculate tax for a cart item
 */
export function calculateItemTax(price: number, quantity: number, taxRate: number): number {
  const itemSubtotal = price * quantity;
  // Handle both decimal (0.05) and percentage (5) formats
  const normalizedTaxRate = taxRate <= 1 ? taxRate : taxRate / 100;
  return itemSubtotal * normalizedTaxRate;
}

/**
 * Calculate subtotal for cart items
 */
export function calculateCartSubtotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

/**
 * Calculate total tax for cart items
 */
export function calculateCartTax(cartItems: CartItem[]): number {
  return cartItems.reduce((totalTax, item) => {
    const taxRate = item.product?.taxRate || 0;
    const itemTax = calculateItemTax(item.price, item.quantity, taxRate);
    return totalTax + itemTax;
  }, 0);
}

/**
 * Group cart items by seller for fee calculation
 */
export function groupItemsBySeller(cartItems: CartItem[]) {
  const sellerGroups: { [sellerId: string]: CartItem[] } = {};
  
  cartItems.forEach(item => {
    const sellerId = item.product?.storeId?._id || item.storeId || item.sellerId || 'unknown';
    if (!sellerGroups[sellerId]) {
      sellerGroups[sellerId] = [];
    }
    sellerGroups[sellerId].push(item);
  });
  
  return sellerGroups;
}

/**
 * Calculate fees for grouped sellers (cart with multiple sellers)
 */
export function calculateMultiSellerFees(
  cartItems: CartItem[],
  shippingOptions: ShippingOption,
  shippingRates: { [sellerId: string]: number },
  grossUpFees: boolean = true
) {
  const sellerGroups = groupItemsBySeller(cartItems);
  const sellerFees: { [sellerId: string]: FeeBreakdown } = {};
  
  let totalCustomerAmount = 0;
  let totalSellerPayouts = 0;
  let totalPlatformRevenue = 0;
  
  Object.keys(sellerGroups).forEach(sellerId => {
    const items = sellerGroups[sellerId];
    
    // Calculate totals for this seller
    const productSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = items.reduce((sum, item) => {
      const taxRate = item.product?.taxRate || 0;
      return sum + calculateItemTax(item.price, item.quantity, taxRate);
    }, 0);
    const shippingCost = shippingRates[sellerId] || 0;
    
    // Calculate fees for this seller
    const fees = calculateOrderFees({
      productSubtotal,
      taxAmount,
      shippingCost,
      grossUpFees
    });
    
    sellerFees[sellerId] = fees;
    
    // Aggregate totals
    totalCustomerAmount += fees.customerTotal;
    totalSellerPayouts += fees.sellerReceives;
    totalPlatformRevenue += fees.platformRevenue;
  });
  
  return {
    sellerFees,
    totals: {
      customerTotal: Math.round(totalCustomerAmount * 100) / 100,
      totalSellerPayouts: Math.round(totalSellerPayouts * 100) / 100,
      totalPlatformRevenue: Math.round(totalPlatformRevenue * 100) / 100
    }
  };
}

/**
 * Format fee breakdown for display
 */
export function formatFeeDisplay(feeCalculation: FeeBreakdown) {
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
 */
export function calculateEstimatedDelivery(orderDate: Date, businessDays: number = 5): Date {
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
