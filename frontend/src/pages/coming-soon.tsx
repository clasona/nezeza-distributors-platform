import React, { useState } from 'react';
import { ChevronRightIcon, EnvelopeIcon, GlobeAltIcon, UserGroupIcon, BuildingStorefrontIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';

const ComingSoonPage = () => {
  const [selectedTab, setSelectedTab] = useState('customers');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubscribe = async () => {
    if (!email || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message || 'Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage('Failed to subscribe. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const customerFeatures = [
    {
      icon: <GlobeAltIcon className="w-8 h-8" />,      title: "Global Marketplace",
      description: "Access authentic African products from verified sellers worldwide"
    },
    {
      icon: <SparklesIcon className="w-8 h-8" />,      title: "Curated Selection",
      description: "Handpicked products ensuring quality and authenticity"
    },
    {
      icon: <UserGroupIcon className="w-8 h-8" />,      title: "Community Driven",
      description: "Connect with a community passionate about African culture and products"
    }
  ];

  const sellerFeatures = [
    {
      icon: <BuildingStorefrontIcon className="w-8 h-8" />,      title: "Global Reach",
      description: "Expand your business to international markets effortlessly"
    },
    {
      icon: <GlobeAltIcon className="w-8 h-8" />,      title: "Supply Chain Support",
      description: "End-to-end logistics and fulfillment solutions"
    },
    {
      icon: <SparklesIcon className="w-8 h-8" />,      title: "Growth Tools",
      description: "Analytics, marketing tools, and seller support to grow your business"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">VeSoko</span>
          </div>
          <div className="text-sm text-gray-600">
            Coming Soon
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <PlayIcon className="w-4 h-4 mr-2" />
              Get Ready for Launch
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              The Future of <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">African Commerce</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              VeSoko is building the ultimate platform to connect African sellers with global markets. 
              Join us in revolutionizing how authentic African products reach the world.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl p-2 shadow-lg border">
              <button 
                onClick={() => handleTabChange('customers')}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedTab === 'customers' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                For Customers
              </button>
              <button 
                onClick={() => handleTabChange('sellers')}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedTab === 'sellers' 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                For Sellers
              </button>
            </div>
          </div>

          {/* Content based on selected tab */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              {selectedTab === 'customers' ? (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Discover Authentic African Products
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Get ready to explore a curated marketplace featuring the finest African products, 
                    from traditional crafts to modern innovations, all sourced directly from trusted sellers.
                  </p>
                  <div className="space-y-6">
                    {customerFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="text-blue-600 mt-1">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Expand Your Business Globally
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Join VeSoko and connect your African business to international markets. 
                    We're building the infrastructure to help you reach customers worldwide.
                  </p>
                  <div className="space-y-6">
                    {sellerFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="text-orange-500 mt-1">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Newsletter Signup */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border">
              <div className="text-center mb-6">
                <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Be the First to Know
                </h3>
                <p className="text-gray-600">
                  Get notified when we launch and receive exclusive early access
                </p>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  placeholder="Enter your email address" 
                  value={email} 
                  onChange={handleEmailChange}
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSubscribe} 
                  disabled={!email || isLoading}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    selectedTab === 'customers'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Subscribe to Updates</span>
                      <ChevronRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
                {message && (
                  <p className={`text-center text-sm ${
                    message.includes('Failed') ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Phase Information */}
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Launching in Two Phases</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-white/10 rounded-xl p-6">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Phase 1: US-Based Sellers</h3>
                <p className="text-white/90">
                  African sellers with products already in the US can join and start selling immediately
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Phase 2: Direct from Africa</h3>
                <p className="text-white/90">
                  African-based manufacturers will join with full logistics and shipping support
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center py-12">
            <p className="text-gray-600">
              Questions? Contact us at{' '}
              <a href="mailto:hello@clasona.com" className="text-blue-600 hover:underline">
                hello@clasona.com
              </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};
ComingSoonPage.noLayout =true
export default ComingSoonPage;
