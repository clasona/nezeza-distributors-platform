import React from 'react';

interface SupportCenterLayoutProps {
  children: React.ReactNode;
  tabBar?: React.ReactNode;
}

const SupportCenterLayout: React.FC<SupportCenterLayoutProps> = ({ 
  children, 
  tabBar 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vesoko Support Center</h1>
                <p className="text-gray-600 mt-1">Get help with orders, payments, shipping, and more</p>
              </div>
            </div>
          </div>
          
          {/* Tab Bar */}
          {tabBar && (
            <div className="border-t border-gray-200 pt-4 pb-2 flex justify-center">
              {tabBar}
            </div>
          )}
        </div>
      </div>


      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-2 text-gray-600">
                <p>📧 support@vesoko.com</p>
                <p>📞 +250 788 123 456</p>
                <p>💬 Live chat available</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="/customer/support/faqs" className="block text-blue-600 hover:text-blue-800">Frequently Asked Questions</a>
                <a href="/customer/support/submit-ticket" className="block text-blue-600 hover:text-blue-800">Submit Support Ticket</a>
                <a href="/customer/support/track-package" className="block text-blue-600 hover:text-blue-800">Track Your Package</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-2 text-gray-600">
                <p>Monday - Friday: 8 AM - 8 PM</p>
                <p>Saturday: 9 AM - 5 PM</p>
                <p>Sunday: 10 AM - 4 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCenterLayout;
