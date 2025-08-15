import React from 'react';
import FormattedPrice from '../FormattedPrice';
import { FeeBreakdown } from '@/utils/payment/feeCalculationUtils';
import { Info, HelpCircle } from 'lucide-react';

interface OrderFeeBreakdownProps {
  feeBreakdown: FeeBreakdown;
  showDetailedBreakdown?: boolean;
  showProcessingFeeExplanation?: boolean;
  className?: string;
}

const OrderFeeBreakdown: React.FC<OrderFeeBreakdownProps> = ({
  feeBreakdown,
  showDetailedBreakdown = false,
  showProcessingFeeExplanation = true,
  className = ''
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-vesoko_primary mb-4 flex items-center gap-2">
          <span>Order Summary</span>
          {showDetailedBreakdown && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-vesoko_primary hover:text-vesoko_primary_dark transition-colors"
              title="Show fee breakdown"
            >
              <HelpCircle size={18} />
            </button>
          )}
        </h3>

        {/* Main breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <FormattedPrice amount={feeBreakdown.breakdown.productSubtotal} />
          </div>
          
          <div className="flex justify-between text-gray-700">
            <span>Tax:</span>
            <FormattedPrice amount={feeBreakdown.breakdown.tax} />
          </div>
          
          <div className="flex justify-between text-gray-700">
            <span>Shipping:</span>
            <FormattedPrice amount={feeBreakdown.breakdown.shipping} />
          </div>
          
          {feeBreakdown.breakdown.processingFee > 0 && (
            <div className="flex justify-between text-gray-700">
              <div className="flex items-center gap-1">
                <span>Processing Fee:</span>
                {showProcessingFeeExplanation && (
                  <div className="group relative">
                    <Info size={14} className="text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                  hidden group-hover:block w-64 p-2 
                                  bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
                      This fee covers payment processing costs to ensure secure transactions.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                                    w-0 h-0 border-l-4 border-r-4 border-t-4 
                                    border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                )}
              </div>
              <FormattedPrice amount={feeBreakdown.breakdown.processingFee} />
            </div>
          )}
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Total */}
        <div className="flex justify-between text-xl font-bold text-vesoko_primary">
          <span>Total:</span>
          <FormattedPrice amount={feeBreakdown.customerTotal} />
        </div>

        {/* Processing fee explanation */}
        {feeBreakdown.breakdown.processingFee > 0 && showProcessingFeeExplanation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">About Processing Fees</p>
                <p>
                  This small fee helps us maintain secure payment processing and 
                  ensures that sellers receive their full earnings without deductions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed breakdown (collapsible) */}
        {showDetailedBreakdown && showDetails && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Detailed Breakdown</h4>
            
            <div className="space-y-2 text-sm">
              <div className="bg-green-50 p-3 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">Seller Receives</h5>
                <div className="space-y-1 text-green-700">
                  <div className="flex justify-between">
                    <span>Product Revenue:</span>
                    <FormattedPrice amount={feeBreakdown.sellerBreakdown.productRevenue} />
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Collected:</span>
                    <FormattedPrice amount={feeBreakdown.sellerBreakdown.taxCollected} />
                  </div>
                  <div className="flex justify-between font-medium border-t border-green-200 pt-1">
                    <span>Total Earnings:</span>
                    <FormattedPrice amount={feeBreakdown.sellerBreakdown.totalEarnings} />
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg">
                <h5 className="font-medium text-orange-800 mb-2">Platform Revenue</h5>
                <div className="space-y-1 text-orange-700">
                  <div className="flex justify-between">
                    <span>Commission ({(feeBreakdown.platformFeePercentage * 100).toFixed(1)}%):</span>
                    <FormattedPrice amount={feeBreakdown.platformBreakdown.commission} />
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Revenue:</span>
                    <FormattedPrice amount={feeBreakdown.platformBreakdown.shippingRevenue} />
                  </div>
                  <div className="flex justify-between">
                    <span>Stripe Fees Covered:</span>
                    <FormattedPrice amount={-feeBreakdown.platformBreakdown.stripeFeesCovered} />
                  </div>
                  <div className="flex justify-between font-medium border-t border-orange-200 pt-1">
                    <span>Net Platform Revenue:</span>
                    <FormattedPrice amount={feeBreakdown.platformBreakdown.netRevenue} />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-2">Payment Processing</h5>
                <div className="space-y-1 text-gray-700">
                  <div className="flex justify-between">
                    <span>Percentage Fee ({(feeBreakdown.stripeFeePercentage * 100).toFixed(1)}%):</span>
                    <FormattedPrice amount={feeBreakdown.stripeBreakdown.percentageFee} />
                  </div>
                  <div className="flex justify-between">
                    <span>Fixed Fee:</span>
                    <FormattedPrice amount={feeBreakdown.stripeBreakdown.fixedFee} />
                  </div>
                  <div className="flex justify-between font-medium border-t border-gray-200 pt-1">
                    <span>Total Processing Fee:</span>
                    <FormattedPrice amount={feeBreakdown.stripeBreakdown.totalFee} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-vesoko_background rounded-lg">
              <p className="text-xs text-gray-600 flex items-start gap-2">
                <Info size={12} className="mt-0.5 flex-shrink-0" />
                <span>
                  Our transparent fee model ensures sellers receive their full product price plus tax,
                  while the platform covers all payment processing costs and shipping logistics.
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFeeBreakdown;
