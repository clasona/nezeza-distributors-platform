import React from 'react';

const CustomerSupportOrderAssistance: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Order Assistance</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Need help with your order?</h3>
        <p className="text-gray-600 mb-6">
          We're here to help you with any order-related issues. Please provide as much detail as possible to help us assist you better.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Order Status</h4>
            <p className="text-blue-700 text-sm">
              Check your order status in your account dashboard or use the tracking number from your order confirmation email.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Order Modifications</h4>
            <p className="text-green-700 text-sm">
              Need to change your order? Contact us immediately - changes may be possible before shipping.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Returns & Refunds</h4>
            <p className="text-yellow-700 text-sm">
              For returns or refunds, please contact our support team with your order number and reason for return.
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <a
            href="/customer/support/submit-ticket"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Order Support Ticket
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportOrderAssistance;