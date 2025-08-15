import React, { useState, useEffect } from 'react';
import { calculateOrderFees, FeeBreakdown } from '@/utils/payment/feeCalculationUtils';
import FormattedPrice from '../FormattedPrice';
import { Info } from 'lucide-react';

interface OrderFeeDisplayProps {
  productSubtotal: number;
  taxAmount: number;
  shippingCost: number;
  grossUpFees?: boolean;
}

const OrderFeeDisplay: React.FC<OrderFeeDisplayProps> = ({
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
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-500">Calculating fees...</span>
      </div>
    );
  }

  if (error || !feeBreakdown) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-600">{error || 'Unable to calculate fees'}</p>
        <div className="flex justify-between items-center py-4 bg-gray-50 -mx-6 px-6 rounded-lg mt-2">
          <span className="text-lg font-bold text-gray-900">Customer Total</span>
          <span className="text-xl font-bold text-gray-900">
            <FormattedPrice amount={productSubtotal + taxAmount + shippingCost} />
          </span>
        </div>
      </div>
    );
  }

  const hasProcessingFee = feeBreakdown.breakdown.processingFee > 0;

  return (
    <>
      {hasProcessingFee && (
        <div className='flex justify-between items-center py-3 border-b border-gray-100'>
          <div className='flex items-center space-x-2'>
            <span className='text-gray-600 font-medium'>Processing Fee</span>
            <div className='group relative'>
              <Info className='w-4 h-4 text-gray-400 cursor-help' />
              <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap'>
                Small fee to ensure sellers receive full payment
              </div>
            </div>
          </div>
          <span className='font-bold text-gray-900'>
            <FormattedPrice amount={feeBreakdown.breakdown.processingFee} />
          </span>
        </div>
      )}
      
      <div className='flex justify-between items-center py-4 bg-vesoko_blue_50 -mx-6 px-6 rounded-lg'>
        <span className='text-lg font-bold text-vesoko_blue_900'>Customer Total</span>
        <span className='text-xl font-bold text-vesoko_blue_900'>
          <FormattedPrice amount={feeBreakdown.customerTotal} />
        </span>
      </div>
    </>
  );
};

export default OrderFeeDisplay;
