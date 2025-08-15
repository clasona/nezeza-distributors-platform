import React, { useState, useEffect } from 'react';
import { calculateOrderFees, FeeBreakdown } from '@/utils/payment/feeCalculationUtils';
import FormattedPrice from '../FormattedPrice';

interface OrderRevenueBreakdownProps {
  productSubtotal: number;
  taxAmount: number;
  shippingCost: number;
  grossUpFees?: boolean;
}

const OrderRevenueBreakdown: React.FC<OrderRevenueBreakdownProps> = ({
  productSubtotal,
  taxAmount,
  shippingCost,
  grossUpFees = true
}) => {
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateFees = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const breakdown = await calculateOrderFees({
          productSubtotal,
          taxAmount,
          shippingCost,
          grossUpFees
        });
        
        setFeeBreakdown(breakdown);
      } catch (err) {
        console.error('Fee calculation error:', err);
        setError('Failed to calculate fees');
      } finally {
        setIsLoading(false);
      }
    };

    calculateFees();
  }, [productSubtotal, taxAmount, shippingCost, grossUpFees]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vesoko_primary"></div>
        <span className="ml-2 text-xs text-gray-500">Loading breakdown...</span>
      </div>
    );
  }

  if (error || !feeBreakdown) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-red-600">{error || 'Unable to calculate breakdown'}</p>
      </div>
    );
  }

  return (
    <div className='space-y-2 text-sm'>
      <div className='flex justify-between'>
        <span className='text-gray-600'>Seller Receives:</span>
        <span className='font-medium text-green-600'>
          <FormattedPrice amount={feeBreakdown.sellerReceives} />
        </span>
      </div>
      <div className='flex justify-between'>
        <span className='text-gray-600'>Platform Commission (10%):</span>
        <span className='font-medium text-orange-600'>
          <FormattedPrice amount={feeBreakdown.platformBreakdown.commission} />
        </span>
      </div>
      <div className='flex justify-between'>
        <span className='text-gray-600'>Platform Services:</span>
        <span className='font-medium text-blue-600'>
          <FormattedPrice amount={feeBreakdown.platformBreakdown.shippingRevenue + feeBreakdown.platformBreakdown.stripeFeesCovered} />
        </span>
      </div>
      <div className='text-xs text-gray-500 mt-2 pt-2 border-t'>
        Transparent pricing: Seller gets product price + tax, platform covers payment processing
      </div>
    </div>
  );
};

export default OrderRevenueBreakdown;
