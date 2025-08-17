import React from 'react';

const CustomerSupportTrackPackage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Track Package</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Track Your Package</h3>
        <p className="text-gray-600 mb-6">
          Enter your tracking number to get real-time updates on your package delivery status.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to Track</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Use the tracking number from your order confirmation email</li>
              <li>• Check your order status in your account dashboard</li>
              <li>• Contact support if you need help with tracking</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Delivery Updates</h4>
            <p className="text-green-700 text-sm">
              You'll receive email notifications when your package status changes, including when it's out for delivery.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Need Help?</h4>
            <p className="text-yellow-700 text-sm">
              If your package is delayed or you have tracking issues, please contact our support team.
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <a
            href="/customer/support/submit-ticket"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support for Tracking Help
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportTrackPackage;