import Link from 'next/link';
import { Store, Users, TrendingUp, Shield, Clock, CheckCircle, ArrowRight, Star, Globe, MapPin, Package } from 'lucide-react';

const SellerOnboarding = () => {
  const benefits = [
    {
      icon: Package,
      title: 'African-Only Marketplace',
      description: 'Dedicated exclusively to authentic African products and heritage'
    },
    {
      icon: Globe,
      title: 'Global Market Access',
      description: 'Connect with customers across the US, with expansion to Canada & Europe'
    },
    {
      icon: TrendingUp,
      title: 'End-to-End Supply Chain',
      description: 'Complete platform supporting manufacturers, wholesalers & retailers'
    },
    {
      icon: Shield,
      title: 'Trusted & Secure',
      description: 'Built-in compliance, logistics support, and payment protection'
    }
  ];

  const stats = [
    { number: '10M+', label: 'Active Customers' },
    { number: '50K+', label: 'Sellers Worldwide' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* Hero Section */}
      <div className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-vesoko_dark_blue/90 to-vesoko_green_600/90'></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
          <div className='text-center'>
            <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6'>
              <Package className='h-4 w-4 text-yellow-400' />
              <span className='text-sm font-medium'>Authentic African Products Marketplace</span>
            </div>
            
            <h1 className='text-4xl md:text-6xl font-bold text-white mb-6 leading-tight'>
              Sell Authentic
              <span className='block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'>
                African Products
              </span>
              <span className='block text-3xl md:text-4xl mt-2'>on Soko Platform</span>
            </h1>
            
            <p className='text-xl text-blue-100 mb-4 max-w-3xl mx-auto leading-relaxed'>
              The premier marketplace connecting African sellers to global markets. 
              Currently launching with US-based African sellers, expanding to direct African exports soon.
            </p>
            
            <div className='inline-flex items-center gap-2 bg-blue-600/50 backdrop-blur-sm px-4 py-2 rounded-lg text-blue-100 mb-8'>
              <MapPin className='h-4 w-4' />
              <span className='text-sm'>Phase 1: US-Based African Sellers | Phase 2: Direct from Africa (Coming Soon)</span>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'>
              <Link
                href='/select-store-type'
                className='group inline-flex items-center gap-3 bg-vesoko_green_600 hover:bg-vesoko_green_700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
              >
                <Store className='h-6 w-6' />
                Start Selling Now
                <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform duration-300' />
              </Link>
              
              <Link
                href='/login'
                className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300'
              >
                Already a seller? Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mt-16'>
              {stats.map((stat, index) => (
                <div key={index} className='text-center'>
                  <div className='text-3xl md:text-4xl font-bold text-white mb-2'>{stat.number}</div>
                  <div className='text-blue-200 text-sm font-medium'>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Why Choose VeSoko?
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              We provide all the tools and support you need to succeed in e-commerce
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className='group text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-vesoko_green_400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2'>
                  <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-vesoko_dark_blue to-vesoko_green_600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300'>
                    <IconComponent className='h-8 w-8 text-white' />
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-4'>{benefit.title}</h3>
                  <p className='text-gray-600 leading-relaxed'>{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className='py-24 bg-gradient-to-r from-gray-50 to-blue-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Get Started in 3 Simple Steps
            </h2>
            <p className='text-xl text-gray-600'>
              It's quick and easy to start selling on VeSoko
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8 lg:gap-12'>
            <div className='text-center group'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300'>
                1
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>Apply to Sell</h3>
              <p className='text-gray-600 leading-relaxed'>Complete our simple application form with your business details</p>
            </div>
            
            <div className='text-center group'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300'>
                2
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>Get Approved</h3>
              <p className='text-gray-600 leading-relaxed'>Our team reviews your application within 48 hours</p>
            </div>
            
            <div className='text-center group'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full text-white text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300'>
                3
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>Start Selling</h3>
              <p className='text-gray-600 leading-relaxed'>Set up your store and start listing your products immediately</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='py-24 bg-gradient-to-r from-vesoko_dark_blue to-vesoko_green_600'>
        <div className='max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8'>
          <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6'>
            <Clock className='h-4 w-4' />
            <span className='text-sm font-medium'>Quick approval process - usually within 48 hours</span>
          </div>
          
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
            Ready to Start Your Selling Journey?
          </h2>
          
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Join thousands of successful sellers and start growing your business today. 
            No upfront costs, no hidden fees.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/select-store-type'
              className='group inline-flex items-center gap-3 bg-white text-vesoko_dark_blue hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              <Store className='h-6 w-6' />
              Apply Now - It's Free
              <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform duration-300' />
            </Link>
            
            <Link
              href='/contact'
              className='inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300'
            >
              <Globe className='h-5 w-5' />
              Have Questions?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
SellerOnboarding.noLayout = true;
export default SellerOnboarding;
