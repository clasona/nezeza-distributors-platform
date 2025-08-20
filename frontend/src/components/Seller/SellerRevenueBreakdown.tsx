import React from 'react';
import FormattedPrice from '../FormattedPrice';
import { FeeBreakdown } from '@/utils/payment/feeCalculationUtils';
import { DollarSign, TrendingUp, Package, Truck } from 'lucide-react';

interface SellerRevenueBreakdownProps {
  feeBreakdown: FeeBreakdown;
  showTransparencyInfo?: boolean;
  className?: string;
}

const SellerRevenueBreakdown: React.FC<SellerRevenueBreakdownProps> = ({
  feeBreakdown,
  showTransparencyInfo = true,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      <div className="p-6">
        <h3 className="text-xl font-bold text-vesoko_primary mb-6 flex items-center gap-2">
          <TrendingUp size={24} />
          <span>Revenue Breakdown</span>
        </h3>

        {/* Seller Earnings Highlight */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
          <div className="text-center">
            <DollarSign className="mx-auto h-12 w-12 text-green-600 mb-2" />
            <h4 className="text-lg font-semibold text-green-800 mb-2">
              You Receive
            </h4>
            <div className="text-3xl font-bold text-green-700">
              <FormattedPrice amount={feeBreakdown.sellerReceives} />
            </div>
            <p className="text-sm text-green-600 mt-2">
              This includes your product revenue plus tax collected
            </p>
          </div>
        </div>

        {/* Breakdown Details */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Package size={18} />
              <span>Your Revenue</span>
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product Revenue:</span>
                <span className="font-medium">
                  <FormattedPrice amount={feeBreakdown.sellerBreakdown.productRevenue} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax You Collect:</span>
                <span className="font-medium">
                  <FormattedPrice amount={feeBreakdown.sellerBreakdown.taxCollected} />
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span>Total You Receive:</span>
                <span className="text-green-600">
                  <FormattedPrice amount={feeBreakdown.sellerBreakdown.totalEarnings} />
                </span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <h5 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <Truck size={18} />
              <span>Platform Services</span>
            </h5>
            <div className="space-y-2 text-sm text-orange-700">
              <div className="flex justify-between">
                <span>Platform Commission ({(feeBreakdown.platformFeePercentage * 100).toFixed(1)}%):</span>
                <span className="font-medium">
                  <FormattedPrice amount={feeBreakdown.platformBreakdown.commission} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & Logistics:</span>
                <span className="font-medium">
                  <FormattedPrice amount={feeBreakdown.platformBreakdown.shippingRevenue} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Processing:</span>
                <span className="font-medium">
                  <FormattedPrice amount={feeBreakdown.platformBreakdown.stripeFeesCovered} />
                </span>
              </div>
            </div>
          </div>

          {/* Customer Payment Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-semibold text-blue-800 mb-3">Customer Paid</h5>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>Products + Tax:</span>
                <span className="font-medium">
                  <FormattedPrice amount={feeBreakdown.breakdown.productSubtotal + feeBreakdown.breakdown.tax} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-medium">
                  <FormattedPrice amount={feeBreakdown.breakdown.shipping} />
                </span>
              </div>
              {feeBreakdown.breakdown.processingFee > 0 && (
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span className="font-medium">
                    <FormattedPrice amount={feeBreakdown.breakdown.processingFee} />
                  </span>
                </div>
              )}
              <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
                <span>Total Customer Paid:</span>
                <span>
                  <FormattedPrice amount={feeBreakdown.customerTotal} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transparency Information */}
        {showTransparencyInfo && (
          <div className="mt-6 p-4 bg-vesoko_background rounded-lg">
            <h5 className="font-semibold text-vesoko_primary mb-3">
              Our Transparent Fee Model
            </h5>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                • You receive <strong>100% of your product price</strong> plus all tax collected
              </p>
              <p>
                • Our {(feeBreakdown.platformFeePercentage * 100).toFixed(1)}% commission covers platform operations, marketing, and support
              </p>
              <p>
                • We handle all payment processing and shipping logistics at no additional cost to you
              </p>
              {/* <p>
                • Customers pay a small processing fee to ensure you receive your full earnings
              </p> */}
            </div>
          </div>
        )}

        {/* Fee Model Badge */}
        <div className="mt-4 flex items-center justify-center">
          <div className="bg-vesoko_primary text-white px-4 py-2 rounded-full text-xs font-medium">
            {feeBreakdown.feeModel === 'gross-up' ? 'Seller-Protected Pricing' : 'Standard Pricing'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRevenueBreakdown;
