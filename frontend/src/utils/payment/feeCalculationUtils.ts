import axiosInstance from '../axiosInstance';

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

export interface MultiSellerFeeResult {
  customerTotal: number;
  customerSubtotal: number;
  totalSellerPayouts: number;
  totalPlatformRevenue: number;
  totalStripeFees: number;
  suborderBreakdowns: Array<{
    sellerId: string;
    sellerName?: string;
    fees: FeeBreakdown;
  }>;
  summary: {
    totalProducts: number;
    totalTax: number;
    totalShipping: number;
    totalProcessingFee: number;
    totalCommission: number;
  };
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
 * Calculate comprehensive fee breakdown for an order using backend API
 */
export async function calculateOrderFees({
  productSubtotal,
  taxAmount,
  shippingCost,
  grossUpFees = true
}: FeeCalculationParams): Promise<FeeBreakdown> {
  try {
    const response = await axiosInstance.post('/fee-calculation/single', {
      productSubtotal,
      taxAmount,
      shippingCost,
      grossUpFees
    });

    if (response.status === 200) {
      return response.data.data;
    } else {
      throw new Error('Fee calculation failed');
    }
  } catch (error) {
    console.error('Error calculating fees:', error);
    throw error;
  }
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
 * Calculate fees for grouped sellers (cart with multiple sellers) using backend API
 */
export async function calculateMultiSellerFees(
  cartItems: CartItem[],
  shippingOptions: ShippingOption,
  shippingRates: { [sellerId: string]: number },
  grossUpFees: boolean = true
): Promise<{ sellerFees: { [sellerId: string]: FeeBreakdown }, totals: { customerTotal: number, totalSellerPayouts: number, totalPlatformRevenue: number } }> {
  const sellerGroups = groupItemsBySeller(cartItems);
  
  // Prepare suborders data for API call
  const suborders = Object.keys(sellerGroups).map(sellerId => {
    const items = sellerGroups[sellerId];
    
    const productSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = items.reduce((sum, item) => {
      const taxRate = item.product?.taxRate || 0;
      return sum + calculateItemTax(item.price, item.quantity, taxRate);
    }, 0);
    const shippingCost = shippingRates[sellerId] || 0;
    const sellerName = items[0]?.product?.storeId?.storeName || 'Unknown Store';
    
    return {
      sellerId,
      sellerName,
      productSubtotal,
      taxAmount,
      shippingCost
    };
  });

  try {
    const response = await axiosInstance.post('/fee-calculation/multi-seller', {
      suborders,
      grossUpFees
    });

    if (response.status === 200) {
      const apiResult = response.data.data;
      
      // Transform API result to match expected format
      const sellerFees: { [sellerId: string]: FeeBreakdown } = {};
      apiResult.suborderBreakdowns.forEach((breakdown: any) => {
        sellerFees[breakdown.sellerId] = breakdown.fees;
      });
      
      return {
        sellerFees,
        totals: {
          customerTotal: apiResult.customerTotal,
          totalSellerPayouts: apiResult.totalSellerPayouts,
          totalPlatformRevenue: apiResult.totalPlatformRevenue
        }
      };
    } else {
      throw new Error('Multi-seller fee calculation failed');
    }
  } catch (error) {
    console.error('Error calculating multi-seller fees:', error);
    throw error;
  }
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
