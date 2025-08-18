import React from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import { RotateCcw, Clock, CheckCircle, AlertCircle, Package } from 'lucide-react';

const ReturnRefundPolicy = () => {
  return (
    <>
      <Head>
        <title>Return & Refund Policy | VeSoko - Easy Returns & Fast Refunds</title>
        <meta name="description" content="Learn about VeSoko's return and refund policy. Easy returns within 10 days, fast refunds, and clear guidelines." />
        <meta name="keywords" content="return policy, refund policy, returns, refunds, VeSoko returns" />
      </Head>

      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-vesoko_primary via-vesoko_secondary to-vesoko_primary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <RotateCcw className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Return & Refund Policy</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We're committed to your satisfaction. Learn about our easy return process and refund policy.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Last Updated */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-blue-800 font-medium">
                Last Updated: August 15, 2025
              </p>
            </div>
          </div>

          {/* Policy Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">10 Days</h3>
              <p className="text-gray-600 text-sm">Return window from delivery date</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Process</h3>
              <p className="text-gray-600 text-sm">Simple return request system</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <RotateCcw className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Refunds</h3>
              <p className="text-gray-600 text-sm">7 days to process refunds</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Replacements</h3>
              <p className="text-gray-600 text-sm">Exchange option available</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">VeSoko Return & Refund Policy</h2>
              
              <p className="text-gray-700 mb-6">
                VeSoko is committed to ensuring a positive shopping experience for all customers. This Return and Refund Policy outlines the conditions under which customers may return products and receive refunds, as well as the responsibilities of sellers.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Return Eligibility</h3>
              <p className="text-gray-700 mb-4">Customers may request a return if the product:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Arrives damaged, defective, or broken</li>
                <li>Does not match the description or image on the product listing</li>
                <li>Was shipped incorrectly or in the wrong quantity</li>
                <li>Is unopened and unused (for eligible non-perishable items)</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium mb-1">Non-Returnable Items</p>
                    <p className="text-yellow-700 text-sm">
                      Certain items are non-returnable due to safety, hygiene, or perishability including food, cosmetics, personal care products, and opened electronics.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Return Window</h3>
              <p className="text-gray-700 mb-6">
                Returns must be initiated within <strong>10 days of delivery</strong>. If the item is damaged or incorrect, images of the item may be required as proof.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Return Process</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-vesoko_primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</div>
                  <p className="text-gray-700">The customer submits a return request via their VeSoko account or by contacting customer service</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-vesoko_primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</div>
                  <p className="text-gray-700">The seller is notified and must respond within 2 business days</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-vesoko_primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</div>
                  <p className="text-gray-700">The customer receives return shipping instructions</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-vesoko_primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">4</div>
                  <p className="text-gray-700">Once the returned item is received and inspected, a refund will be issued or a replacement sent within 7 business days</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Refunds</h3>
              <p className="text-gray-700 mb-4">Refunds will be processed using the original payment method and issued within 7 business days after:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>The returned product is received and approved by the seller, or</li>
                <li>The customer provides sufficient proof that the product was not delivered or is defective</li>
              </ul>
              <p className="text-gray-700 mb-6">
                <strong>Shipping Fees:</strong> Generally non-refundable unless the return is due to seller error or a damaged/incorrect item.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Replacements (Preferred Option)</h3>
              <p className="text-gray-700 mb-4">VeSoko encourages customers to request a replacement/exchange rather than a refund when:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>The item is incorrect, missing, or damaged</li>
                <li>The product received does not match the description</li>
              </ul>
              <p className="text-gray-700 mb-6">
                In such cases, customers should indicate their preference for a replacement. The seller will then send the correct item, and no refund will be issued as the original payment covers the replacement.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Seller Responsibilities</h3>
              <p className="text-gray-700 mb-4">Sellers must:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Comply with this return and refund policy</li>
                <li>Respond to return requests in a timely manner</li>
                <li>Inspect returned goods promptly</li>
                <li>Issue refunds or send replacements without unnecessary delays</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Dispute Resolution</h3>
              <p className="text-gray-700 mb-6">
                In case of disagreement between customer and seller, VeSoko customer service will review the case. The final decision rests with VeSoko to ensure a fair resolution for both the customer and the seller.
              </p>           
             <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Policy Changes</h3>
              <p className="text-gray-700 mb-6">
                VeSoko reserves the right to update or modify this policy at any time. Changes will be posted on the platform, and continued use constitutes acceptance of the updated policy.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Us</h3>
              <p className="text-gray-700 mb-2">
                For questions about returns and refunds, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 font-medium mt-1">
                  Email: <a href="mailto:team@vesoko.com" className="text-vesoko_primary hover:underline">team@vesoko.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ReturnRefundPolicy.noLayout = true; 
export default ReturnRefundPolicy;
