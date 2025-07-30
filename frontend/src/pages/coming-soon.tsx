import React, { useState } from 'react';
import { ChevronRightIcon, EnvelopeIcon, GlobeAltIcon, UserGroupIcon, BuildingStorefrontIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import logo from '../images/main.png';
import Image from 'next/image';
import Link from 'next/link';

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

  // Vesoko color palette
  // Orange: #ff7a00
  // Deep brown: #3d1f00
  // Light brown: #f7ede2
  // Green accent: #1db954 (optional)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7ede2] via-white to-[#ff7a00]/10">
      {/* Header */}
      <header className="px-4 py-6 bg-gradient-to-r from-[#3d1f00] via-[#ff7a00]/80 to-[#3d1f00] shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-[140px] h-[70px] xs:w-[180px] xs:h-[90px] sm:w-[240px] sm:h-[110px] lg:w-[280px] lg:h-[120px] relative flex items-center justify-center">
              <Image
                src={logo}
                alt="Vesoko Logo"
                width={320}
                height={120}
                className="object-contain w-full h-full filter brightness-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 rounded-lg"></div>
            </div>
            {/* <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#ff7a00] to-[#3d1f00] bg-clip-text text-transparent drop-shadow-sm">Vesoko</span> */}
          </div>
          <div className="text-sm font-semibold text-[#ff7a00] bg-[#3d1f00]/90 px-4 py-2 rounded-xl shadow">Coming Soon</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-[#ff7a00]/10 text-[#ff7a00] px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <PlayIcon className="w-4 h-4 mr-2" />
              Africa's Marketplace, Reimagined
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#3d1f00] mb-6 drop-shadow-sm">
              Discover. Connect. Thrive.<br />
              <span className="bg-gradient-to-r from-[#ff7a00] to-[#3d1f00] bg-clip-text text-transparent">Vesoko is Coming</span>
            </h1>
            <p className="text-xl text-[#3d1f00]/80 max-w-3xl mx-auto mb-8 font-medium">
              Unleash the power of authentic African products, curated for the world. <span className="text-[#ff7a00] font-bold">Vesoko</span> is your gateway to a vibrant marketplace where culture meets commerce.<br />
              <span className="text-[#ff7a00]">Get ready to shop, sell, and succeed—globally.</span>
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl p-2 shadow-lg border flex">
              <button 
                onClick={() => handleTabChange('customers')}
                className={`px-8 py-3 rounded-lg font-bold transition-all duration-200 ${
                  selectedTab === 'customers' 
                    ? 'bg-[#3d1f00] text-[#ff7a00] shadow-md' 
                    : 'text-[#3d1f00] hover:text-[#ff7a00]'
                }`}
              >
                For Shoppers
              </button>
              <button 
                onClick={() => handleTabChange('sellers')}
                className={`px-8 py-3 rounded-lg font-bold transition-all duration-200 ${
                  selectedTab === 'sellers' 
                    ? 'bg-[#ff7a00] text-white shadow-md' 
                    : 'text-[#3d1f00] hover:text-[#ff7a00]'
                }`}
              >
                For Sellers
              </button>
            </div>
          </div>

          {/* Content based on selected tab */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {selectedTab === 'customers' ? (
              <>
                <div>
                  <h2 className="text-3xl font-extrabold text-[#3d1f00] mb-6">Shop Africa. Shop Original.</h2>
                  <p className="text-lg text-[#3d1f00]/80 mb-8 font-medium">
                    From bold flavors to stunning crafts, Vesoko brings you the best of Africa—delivered to your door. <span className="text-[#ff7a00] font-bold">No middlemen. No imitations.</span> Just pure, authentic finds you won't get anywhere else.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-[#ff7a00] mt-1"><GlobeAltIcon className="w-8 h-8" /></div>
                      <div>
                        <h3 className="font-semibold text-[#3d1f00] mb-1">Global Marketplace</h3>
                        <p className="text-[#3d1f00]/80">Shop directly from verified African sellers—no borders, just opportunity.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="text-[#ff7a00] mt-1"><SparklesIcon className="w-8 h-8" /></div>
                      <div>
                        <h3 className="font-semibold text-[#3d1f00] mb-1">Curated Selection</h3>
                        <p className="text-[#3d1f00]/80">Every product is handpicked for quality, story, and authenticity.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="text-[#ff7a00] mt-1"><UserGroupIcon className="w-8 h-8" /></div>
                      <div>
                        <h3 className="font-semibold text-[#3d1f00] mb-1">Community Powered</h3>
                        <p className="text-[#3d1f00]/80">Join a movement that celebrates African excellence and supports real people.</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Newsletter Signup */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#ff7a00]/30">
                  <div className="text-center mb-6">
                    <EnvelopeIcon className="w-12 h-12 text-[#ff7a00] mx-auto mb-4" />
                    <h3 className="text-2xl font-extrabold text-[#3d1f00] mb-2">
                      Be the First to Know
                    </h3>
                    <p className="text-[#3d1f00]/80">
                      Get launch updates and exclusive early access offers.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 border border-[#ff7a00]/40 rounded-lg focus:ring-2 focus:ring-[#ff7a00] focus:border-transparent outline-none transition-all" 
                      placeholder="Enter your email address" 
                      value={email} 
                      onChange={handleEmailChange}
                      disabled={isLoading}
                    />
                    <button 
                      onClick={handleSubscribe} 
                      disabled={!email || isLoading}
                      className="w-full py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center space-x-2 bg-[#ff7a00] hover:bg-[#3d1f00] text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                        message.includes('Failed') ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-3xl font-extrabold text-[#ff7a00] mb-6">Sell on Vesoko. Stand Out.</h2>
                  <p className="text-lg text-[#3d1f00]/80 mb-8 font-medium">
                    Ready to reach a global audience hungry for authentic African products? <span className="text-[#3d1f00] font-bold">Vesoko</span> is your launchpad.<br />
                    <span className="text-[#3d1f00]">Apply now to join our exclusive seller community.</span>
                  </p>
                  <div className="space-y-6 mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="text-[#3d1f00] mt-1"><BuildingStorefrontIcon className="w-8 h-8" /></div>
                      <div>
                        <h3 className="font-semibold text-[#ff7a00] mb-1">Global Reach</h3>
                        <p className="text-[#3d1f00]/80">Showcase your products to buyers across the US and beyond.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="text-[#3d1f00] mt-1"><SparklesIcon className="w-8 h-8" /></div>
                      <div>
                        <h3 className="font-semibold text-[#ff7a00] mb-1">Growth Tools</h3>
                        <p className="text-[#3d1f00]/80">Get access to analytics, marketing, and seller support to grow your business.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#3d1f00]/5 border-l-4 border-[#ff7a00] rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[#3d1f00] mb-4 flex items-center"><CheckCircleIcon className="w-6 h-6 text-[#ff7a00] mr-2" />How to Join the Vesoko Seller Community</h3>
                    <ol className="list-decimal list-inside text-[#3d1f00]/90 space-y-2 font-medium">
                      <li>Request an invite by joining the waitlist below.</li>
                      <li>Once we launch, we'll send you a link to complete your store application.</li>
                      <li>Then, we'll get you approved and start selling to a global audience!</li>
                    </ol>
                    <div className="mt-6">
                      <Link href="#seller-waitlist" className="inline-block bg-[#ff7a00] hover:bg-[#3d1f00] text-white font-bold px-6 py-3 rounded-lg shadow transition-all duration-200">Join the Seller Waitlist</Link>
                    </div>
                  </div>
                </div>
                {/* Seller Waitlist Signup */}
                <div id="seller-waitlist" className="bg-white rounded-2xl p-8 shadow-xl border border-[#3d1f00]/20 mt-8">
                  <div className="text-center mb-6">
                    <EnvelopeIcon className="w-12 h-12 text-[#3d1f00] mx-auto mb-4" />
                    <h3 className="text-2xl font-extrabold text-[#ff7a00] mb-2">
                      Join the Seller Waitlist
                    </h3>
                    <p className="text-[#3d1f00]/80">
                      Be the first to know when seller onboarding opens. We'll reach out with next steps!
                    </p>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 border border-[#3d1f00]/30 rounded-lg focus:ring-2 focus:ring-[#ff7a00] focus:border-transparent outline-none transition-all" 
                      placeholder="Enter your business email address" 
                      value={email} 
                      onChange={handleEmailChange}
                      disabled={isLoading}
                    />
                    <button 
                      onClick={handleSubscribe} 
                      disabled={!email || isLoading}
                      className="w-full py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center space-x-2 bg-[#3d1f00] hover:bg-[#ff7a00] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Join Waitlist</span>
                          <ChevronRightIcon className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    {message && (
                      <p className={`text-center text-sm ${
                        message.includes('Failed') ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Phase Information removed for punchier, focused messaging */}

          {/* Footer */}
          <footer className="text-center py-12 mt-16">
            <p className="text-[#3d1f00]/80 font-medium">
              Questions? Contact us at{' '}
              <Link href="mailto:hello@clasona.com" className="text-[#ff7a00] hover:underline font-bold">
                hello@clasona.com
              </Link>
            </p>
            <div className="mt-10 flex flex-col items-center gap-2">
              <span className="text-xs text-[#3d1f00]/60 tracking-wide uppercase font-semibold flex items-center gap-1">
                Developed with
                <svg className="inline-block align-middle" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff7a00" strokeWidth="2.2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21s-6-4.35-6-8.5A4.5 4.5 0 0 1 12 5.5a4.5 4.5 0 0 1 6 4.01C18 16.65 12 21 12 21z" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                by
              </span>
              <Link
                href="https://www.clasona.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff7a00] to-[#3d1f00] text-white font-bold shadow hover:scale-105 hover:from-[#3d1f00] hover:to-[#ff7a00] transition-all duration-200"
                style={{ letterSpacing: '0.1em' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="6" fill="white"/>
                  <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ff7a00" fontFamily="Arial, Helvetica, sans-serif">C</text>
                </svg>
                Clasona
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};
ComingSoonPage.noLayout =true
export default ComingSoonPage;
