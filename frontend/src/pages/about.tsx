import React from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import { Globe, Users, Package, TrendingUp, Heart, Star, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const About = () => {
  const features = [
    {
      icon: <Package className="w-8 h-8" />,
      title: "Authentic African Products",
      description: "Curated selection of genuine African goods from verified producers and sellers across the continent."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach",
      description: "Connecting African sellers to worldwide markets, starting with the US and expanding globally."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Complete Supply Chain",
      description: "Supporting manufacturers, wholesalers, and retailers in a comprehensive ecosystem."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Growth Focused",
      description: "Empowering African businesses to scale and reach new markets worldwide."
    }
  ];

  const phases = [
    {
      phase: "Phase 1",
      title: "US-Based African Sellers",
      description: "Launching with existing African sellers already operating in the US, providing immediate access to nationwide markets.",
      status: "current",
      features: [
        "Onboard US-based African sellers",
        "Access to nationwide marketplace",
        "No import/export complexity",
        "Immediate market access"
      ]
    },
    {
      phase: "Phase 2",
      title: "African-Based Manufacturers",
      description: "Building infrastructure to support direct exports from African manufacturers to global wholesalers.",
      status: "upcoming",
      features: [
        "Direct export support",
        "Shipping & logistics infrastructure", 
        "Compliance assistance",
        "Global market expansion"
      ]
    }
  ];

  const stats = [
    { number: "54", label: "African Countries", suffix: "" },
    { number: "1.3B", label: "Population Served", suffix: "" },
    { number: "100%", label: "African Products", suffix: "" },
    { number: "3", label: "User Types", suffix: "" }
  ];

  return (
    <>
      <Head>
        <title>About VeSoko - Connecting African Products to Global Markets</title>
        <meta name="description" content="Learn about VeSoko's mission to connect authentic African products and sellers to global markets. Discover our vision, values, and commitment to African businesses." />
        <meta property="og:title" content="About VeSoko - Connecting African Products to Global Markets" />
        <meta property="og:description" content="Learn about VeSoko's mission to connect authentic African products and sellers to global markets." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="flex flex-col min-h-screen bg-vesoko_powder_blue">        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-vesoko_dark_blue via-blue-700 to-vesoko_green_600 text-white py-16 sm:py-24 lg:py-32">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  About <span className="text-vesoko_yellow">VeSoko</span>
                </h1>
                <p className="text-xl sm:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
                  The next-generation ecommerce platform designed exclusively for authentic African products, 
                  connecting producers and sellers to global markets.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>African-Only Marketplace</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <Globe className="w-4 h-4 text-green-400" />
                    <span>Global Expansion</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span>Growth Focused</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  To empower African businesses by providing a trusted platform that showcases the continent's 
                  finest products and connects them to global markets, fostering economic growth and cultural exchange.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-vesoko_dark_blue mb-2">
                      {stat.number}{stat.suffix}
                    </div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-vesoko_green_600 to-vesoko_dark_blue rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Launch Strategy */}
          <section className="py-16 sm:py-24 bg-gradient-to-br from-vesoko_light_blue via-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Strategic Launch Plan</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  We're launching VeSoko in two carefully planned phases to ensure sustainable growth and maximum impact.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {phases.map((phase, index) => (
                  <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-xl ${phase.status === 'current' ? 'ring-2 ring-vesoko_green_600' : ''}`}>
                    {phase.status === 'current' && (
                      <div className="absolute -top-4 left-8 px-4 py-2 bg-vesoko_green_600 text-white text-sm font-semibold rounded-full">
                        Active Now
                      </div>
                    )}
                    {phase.status === 'upcoming' && (
                      <div className="absolute -top-4 left-8 px-4 py-2 bg-vesoko_yellow text-vesoko_dark_blue text-sm font-semibold rounded-full">
                        Coming Soon
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-vesoko_dark_blue mb-2">{phase.phase}</h3>
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">{phase.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{phase.description}</p>
                    </div>

                    <ul className="space-y-3">
                      {phase.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-vesoko_green_600 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {phase.status === 'current' && (
                      <div className="mt-8">
                        <Link href="/sellers" className="inline-flex items-center gap-2 bg-vesoko_green_600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-vesoko_green_700 transition-colors duration-300">
                          Join as Seller
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">How VeSoko Works</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our platform streamlines every step of the supply chain, from listing to delivery.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="relative text-center group">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-vesoko_green_600 to-vesoko_dark_blue rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">African Sellers List Products</h3>
                  <p className="text-gray-600 leading-relaxed">
                    African manufacturers and sellers (in Africa or US) showcase their authentic products on VeSoko's marketplace.
                  </p>
                </div>

                <div className="relative text-center group">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-vesoko_green_600 to-vesoko_dark_blue rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Wholesalers Purchase & Distribute</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Global wholesalers purchase products in bulk and distribute them to their local retail partners.
                  </p>
                </div>

                <div className="relative text-center group">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-vesoko_green_600 to-vesoko_dark_blue rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Retailers Serve Customers</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Retailers sell authentic African products to end customers in their local markets worldwide.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-16 sm:py-24 bg-gradient-to-r from-vesoko_dark_blue to-vesoko_green_600 text-white">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Join the VeSoko Community?</h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Whether you're an African seller with products in the US or interested in our upcoming Phase 2, 
                we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sellers" className="inline-flex items-center justify-center gap-2 bg-white text-vesoko_dark_blue px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300">
                  Become a Seller
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-vesoko_dark_blue transition-colors duration-300">
                  Contact Us
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>
        </main>

      </div>
    </>
  );
};

export default About;
