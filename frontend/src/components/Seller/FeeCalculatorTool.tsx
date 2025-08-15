import React, { useState, useMemo } from 'react';
import { calculateOrderFees } from '@/utils/payment/feeCalculationUtils';
import FormattedPrice from '../FormattedPrice';
import { Calculator, Info } from 'lucide-react';

const FeeCalculatorTool: React.FC = () => {
  const [productPrice, setProductPrice] = useState<number>(50);
  const [taxRate, setTaxRate] = useState<number>(6);
  const [shippingCost, setShippingCost] = useState<number>(12.99);

  const feeBreakdown = useMemo(() => {
    const taxAmount = (productPrice * taxRate) / 100;
    return calculateOrderFees({
      productSubtotal: productPrice,
      taxAmount: taxAmount,
      shippingCost: shippingCost,
      grossUpFees: true
    });
  }, [productPrice, taxRate, shippingCost]);

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="p-6">
        <h3 className="text-xl font-bold text-vesoko_primary mb-6 flex items-center gap-2">
          <Calculator size={24} />
          <span>Fee Calculator</span>
        </h3>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={productPrice}
                onChange={(e) => setProductPrice(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Cost
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={shippingCost}
                onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seller Earnings */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">You Receive</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Product Revenue:</span>
                <span className="font-medium text-green-800">
                  <FormattedPrice amount={feeBreakdown.sellerBreakdown.productRevenue} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Tax Collected:</span>
                <span className="font-medium text-green-800">
                  <FormattedPrice amount={feeBreakdown.sellerBreakdown.taxCollected} />
                </span>
              </div>
              <div className="border-t border-green-200 pt-2 flex justify-between">
                <span className="font-semibold text-green-800">Total:</span>
                <span className="font-bold text-green-800 text-lg">
                  <FormattedPrice amount={feeBreakdown.sellerReceives} />
                </span>
              </div>
            </div>
          </div>

          {/* Customer Pays */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">Customer Pays</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Products + Tax:</span>
                <span className="font-medium text-blue-800">
                  <FormattedPrice amount={feeBreakdown.breakdown.productSubtotal + feeBreakdown.breakdown.tax} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Shipping:</span>
                <span className="font-medium text-blue-800">
                  <FormattedPrice amount={feeBreakdown.breakdown.shipping} />
                </span>
              </div>
              {feeBreakdown.breakdown.processingFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Processing Fee:</span>
                  <span className="font-medium text-blue-800">
                    <FormattedPrice amount={feeBreakdown.breakdown.processingFee} />
                  </span>
                </div>
              )}
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-semibold text-blue-800">Total:</span>
                <span className="font-bold text-blue-800 text-lg">
                  <FormattedPrice amount={feeBreakdown.customerTotal} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-3">Platform Services</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-orange-700">Commission (10%)</div>
              <div className="font-bold text-orange-800">
                <FormattedPrice amount={feeBreakdown.platformBreakdown.commission} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-orange-700">Shipping Revenue</div>
              <div className="font-bold text-orange-800">
                <FormattedPrice amount={feeBreakdown.platformBreakdown.shippingRevenue} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-orange-700">Payment Processing</div>
              <div className="font-bold text-orange-800">
                <FormattedPrice amount={feeBreakdown.platformBreakdown.stripeFeesCovered} />
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-vesoko_background border border-vesoko_primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-vesoko_primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium text-vesoko_primary mb-2">How Our Fee Model Works:</p>
              <ul className="space-y-1 text-xs">
                <li>• You receive <strong>100% of your product price</strong> plus all tax collected</li>
                <li>• Customers pay a small processing fee to ensure you get your full earnings</li>
                <li>• Our 10% commission covers platform operations, marketing, and support</li>
                <li>• We handle all payment processing and shipping at no extra cost to you</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-800 mb-3">Quick Examples:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { price: 25, tax: 8.25, shipping: 9.99, label: "$25 Product" },
              { price: 100, tax: 6, shipping: 15.99, label: "$100 Product" },
              { price: 250, tax: 7.5, shipping: 0, label: "$250 + Free Ship" }
            ].map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  setProductPrice(preset.price);
                  setTaxRate(preset.tax);
                  setShippingCost(preset.shipping);
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeCalculatorTool;
