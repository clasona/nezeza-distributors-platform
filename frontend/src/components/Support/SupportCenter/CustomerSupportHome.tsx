import Link from 'next/link';
import SearchBar from './SearchBar';

const CustomerSupportHome = () => {
  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">How can we help you today?</h2>
        <SearchBar placeholder="Search for help articles, orders, shipping info..." />
      </div>

      {/* Quick Actions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/customer/support/submit-ticket" className="group">
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-red-500">
            <div className="flex items-center mb-3">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-700">Report an Issue</h3>
            </div>
            <p className="text-gray-600 mb-4">Having problems with an order, payment, or account? Submit a support ticket and we'll help you resolve it.</p>
            <div className="text-red-600 font-medium group-hover:text-red-800">Submit Ticket →</div>
          </div>
        </Link>

        <Link href="/customer/support/track-package" className="group">
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-700">Track Your Package</h3>
            </div>
            <p className="text-gray-600 mb-4">Get real-time updates on your order status and delivery information. Enter your tracking number to get started.</p>
            <div className="text-blue-600 font-medium group-hover:text-blue-800">Track Package →</div>
          </div>
        </Link>

        <Link href="/customer/support/order-assistance" className="group">
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <div className="flex items-center mb-3">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-700">Order Help</h3>
            </div>
            <p className="text-gray-600 mb-4">Need help with placing an order, modifying details, or understanding our ordering process? We're here to assist.</p>
            <div className="text-green-600 font-medium group-hover:text-green-800">Get Order Help →</div>
          </div>
        </Link>

        <Link href="/customer/support/my-tickets" className="group">
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
            <div className="flex items-center mb-3">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-purple-700">My Support Tickets</h3>
            </div>
            <p className="text-gray-600 mb-4">View the status of your submitted tickets, add comments, and track resolution progress.</p>
            <div className="text-purple-600 font-medium group-hover:text-purple-800">View My Tickets →</div>
          </div>
        </Link>

        <Link href="/customer/support/faqs" className="group">
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
            <div className="flex items-center mb-3">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-yellow-700">FAQs & Help Articles</h3>
            </div>
            <p className="text-gray-600 mb-4">Browse our comprehensive library of frequently asked questions and helpful articles for quick answers.</p>
            <div className="text-yellow-600 font-medium group-hover:text-yellow-800">Browse FAQs →</div>
          </div>
        </Link>

        {/* Live Chat Support - Temporarily disabled for MVP */}
        {/* 
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Live Chat Support</h3>
          </div>
          <p className="mb-4 text-blue-100">Chat with our support team in real-time for immediate assistance with your questions and concerns.</p>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Start Live Chat
          </button>
        </div>
        */}
      </section>

      {/* Popular Topics */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Popular Help Topics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              topic: "Order Status", 
              icon: <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>,
              colors: "border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100",
              textColor: "text-blue-800"
            },
            { 
              topic: "Payment Issues", 
              icon: <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>,
              colors: "border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100",
              textColor: "text-green-800"
            },
            { 
              topic: "Shipping & Delivery", 
              icon: <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>,
              colors: "border-orange-200 bg-orange-50 hover:border-orange-400 hover:bg-orange-100",
              textColor: "text-orange-800"
            },
            { 
              topic: "Returns & Refunds", 
              icon: <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>,
              colors: "border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100",
              textColor: "text-purple-800"
            },
            { 
              topic: "Account Management", 
              icon: <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>,
              colors: "border-indigo-200 bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-100",
              textColor: "text-indigo-800"
            },
            { 
              topic: "Product Information", 
              icon: <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>,
              colors: "border-teal-200 bg-teal-50 hover:border-teal-400 hover:bg-teal-100",
              textColor: "text-teal-800"
            },
            { 
              topic: "Seller Services", 
              icon: <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 011-1h4a2 2 0 011 1v12m-6 0h6" />
              </svg>,
              colors: "border-pink-200 bg-pink-50 hover:border-pink-400 hover:bg-pink-100",
              textColor: "text-pink-800"
            },
            { 
              topic: "Technical Support", 
              icon: <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>,
              colors: "border-red-200 bg-red-50 hover:border-red-400 hover:bg-red-100",
              textColor: "text-red-800"
            }
          ].map((item, index) => (
            <Link key={index} href={`/customer/support/faqs?search=${encodeURIComponent(item.topic)}`} className="block">
              <div className={`p-4 border rounded-lg transition-colors ${item.colors}`}>
                <div className="mb-2 flex justify-center">{item.icon}</div>
                <div className={`text-sm font-medium text-center ${item.textColor}`}>{item.topic}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CustomerSupportHome; 