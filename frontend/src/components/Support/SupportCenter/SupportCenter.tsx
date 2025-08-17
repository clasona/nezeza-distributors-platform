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
          <div className="py-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vesoko Support Center</h1>
            </div>
          </div>
          
          {/* Tab Bar */}
          {tabBar && (
            <div className="border-t border-gray-200 pt-2 pb-2 flex justify-center">
              {tabBar}
            </div>
          )}
        </div>
      </div>


      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {children}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-2">Contact Us</h3>
                <div className="space-y-1 text-gray-600">
                  <p>📧 support@vesoko.com</p>
                  <p>📞 +250 788 123 456</p>
                  <p>💬 Live chat available</p>
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-2">Quick Links</h3>
                <div className="space-y-1">
                  <a href="/customer/support/faqs" className="block text-blue-600 hover:text-blue-800">Frequently Asked Questions</a>
                  <a href="/customer/support/submit-ticket" className="block text-blue-600 hover:text-blue-800">Submit Support Ticket</a>
                  <a href="/customer/support/track-package" className="block text-blue-600 hover:text-blue-800">Track Your Package</a>
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-2">Business Hours</h3>
                <div className="space-y-1 text-gray-600">
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
