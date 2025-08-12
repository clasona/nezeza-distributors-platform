import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import { 
  Store, 
  TrendingUp, 
  Users, 
  Globe, 
  CheckCircle, 
  ArrowRight, 
  DollarSign,
  Package,
  Shield,
  Zap,
  BookOpen,
  MessageSquare,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { getAllFAQs, getAllContentPages, FAQ, ContentPage } from '@/utils/content/contentApi';

const SellersHub = () => {
  const [sellerFAQs, setSellerFAQs] = useState<FAQ[]>([]);
  const [sellerContent, setSellerContent] = useState<ContentPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSellerResources();
  }, []);

  const loadSellerResources = async () => {
    try {
      const [faqsResponse, contentResponse] = await Promise.all([
        getAllFAQs({ category: 'seller', published: true, featured: true }),
        getAllContentPages({ category: 'seller', published: true, featured: true })
      ]);
      
      setSellerFAQs(faqsResponse.data.slice(0, 6));
      setSellerContent(contentResponse.data.slice(0, 4));
    } catch (error) {
      console.error('Error loading seller resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Market Access",
      description: "Reach customers worldwide, starting with the US market and expanding globally.",
      color: "from-blue-600 to-blue-500"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Competitive Pricing",
      description: "Set your own prices and keep more of your profits with our fair fee structure.",
      color: "from-green-600 to-green-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Payments",
      description: "Get paid securely and on time with our integrated payment processing system.",
      color: "from-purple-600 to-purple-500"
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Inventory Management",
      description: "Easy-to-use tools to manage your products, orders, and customer relationships.",
      color: "from-orange-600 to-orange-500"
    }
  ];

  const sellingProcess = [
    {
      step: 1,
      title: "Apply to Sell",
      description: "Submit your application with business details and product information. Our team will review your application and notify you within 48 hours.",
      icon: <Store className="w-6 h-6" />
    },
    {
      step: 2,
      title: "Get Verified",
      description: "Complete our verification process to ensure authentic African products and build buyer trust.",
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      step: 3,
      title: "List Your Products",
      description: "Add your authentic African products with detailed descriptions, high-quality images, and competitive pricing.",
      icon: <Package className="w-6 h-6" />
    },
    {
      step: 4,
      title: "Start Selling",
      description: "Manage orders, communicate with buyers, and grow your business on our global marketplace.",
      icon: <TrendingUp className="w-6 h-6" />
    }
  ];

  const requirements = [
    {
      title: "Phase 1 Eligibility (Current)",
      items: [
        "African-owned business or entrepreneur",
        "Products already located in the United States",
        "Valid business registration (preferred but not required)",
        "Authentic African products only",
        "Quality products with good customer reviews",
        "Ability to fulfill orders promptly"
      ],
      status: "active"
    },
    {
      title: "Phase 2 Requirements (Coming Soon)",
      items: [
        "Based in any African country",
        "Valid business registration",
        "Export license (where applicable)",
        "Ability to handle international shipping",
        "Compliance with destination country regulations",
        "Quality assurance certificates"
      ],
      status: "coming-soon"
    }
  ];

  const stats = [
    { number: "100%", label: "African Products", suffix: "" },
    { number: "50M+", label: "Potential Customers", suffix: "" },
    { number: "3-5%", label: "Platform Fee", suffix: "" },
    { number: "24/7", label: "Support Available", suffix: "" }
  ];

  return (
    <>
      <Head>
        <title>Sell Your African Products Globally - VeSoko Seller Hub</title>
        <meta name="description" content="Join VeSoko as a seller and reach global markets with your authentic African products. Learn about selling requirements, benefits, and success strategies." />
        <meta property="og:title" content="Sell Your African Products Globally - VeSoko Seller Hub" />
        <meta property="og:description" content="Join VeSoko as a seller and reach global markets with your authentic African products." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="flex flex-col min-h-screen bg-vesoko_powder_blue">
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-vesoko_dark_blue via-blue-700 to-vesoko_green_600 text-white py-16 sm:py-24 lg:py-32">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                      <Store className="w-4 h-4" />
                      <span>For African Sellers</span>
                    </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                    Sell Your African Products <span className="text-vesoko_yellow">Globally</span>
                  </h1>
                  <p className="text-xl sm:text-2xl text-white/90 leading-relaxed">
                    Join VeSoko and connect your authentic African products with customers worldwide.<br />
                    <span className="font-semibold text-vesoko_yellow">Store application review and approval takes just <span className="text-vesoko_green_200">48 hours</span>!</span><br />
                    Start with the US market and expand globally.
                  </p>
                  </div>
                  

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/select-store-type" className="inline-flex items-center justify-center gap-2 bg-vesoko_yellow text-vesoko_dark_blue px-8 py-4 rounded-xl font-semibold hover:bg-yellow-300 transition-colors duration-300 text-lg">
                      Start Selling Now
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/sellers/guide" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-vesoko_dark_blue transition-colors duration-300">
                      Seller Guide
                      <BookOpen className="w-5 h-5" />
                    </Link>
                  </div>

                  <div className="mt-4">
                    <span className="text-white/80 text-base">Already a seller? </span>
                    <Link href="/login" className="text-vesoko_yellow font-semibold hover:underline ml-1">Sign In</Link>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-white/20">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-vesoko_yellow mb-1">
                          {stat.number}{stat.suffix}
                        </div>
                        <div className="text-sm text-white/80">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phase Status Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-vesoko_yellow rounded-2xl flex items-center justify-center">
                        <Zap className="w-8 h-8 text-vesoko_dark_blue" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Phase 1: Active Now!</h3>
                      <p className="text-white/90">
                        Calling all African sellers with products already in the US
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-vesoko_yellow flex-shrink-0" />
                        <span className="text-white/90">Products already in the US</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-vesoko_yellow flex-shrink-0" />
                        <span className="text-white/90">Immediate market access</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-vesoko_yellow flex-shrink-0" />
                        <span className="text-white/90">No import/export complexity</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        <span className="text-white/90">Phase 2: African-based sellers coming soon</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <Link href="/select-store-type" className="block w-full text-center bg-white text-vesoko_dark_blue py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300">
                        Apply Now - It's Free!
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Why Sell on VeSoko?</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Join the only marketplace dedicated exclusively to authentic African products and reach customers worldwide.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center group">
                    <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How to Start Selling */}
          <section className="py-16 sm:py-24 bg-gradient-to-br from-vesoko_light_blue via-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">How to Start Selling</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Get started in just a few simple steps and start reaching customers worldwide.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {sellingProcess.map((process, index) => (
                  <div key={index} className="relative">
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-vesoko_green_600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {process.step}
                        </div>
                        <div className="w-10 h-10 bg-vesoko_light_blue rounded-xl flex items-center justify-center text-vesoko_dark_blue">
                          {process.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{process.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{process.description}</p>
                      {process.step === 1 && (
                        <div className="mt-4 text-sm text-vesoko_green_600 font-semibold">Review & approval in 48 hours</div>
                      )}
                    </div>
                    {index < sellingProcess.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="w-6 h-6 text-vesoko_green_600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Requirements */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Selling Requirements</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  We have different requirements for our two launch phases to ensure quality and authenticity.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {requirements.map((req, index) => (
                  <div key={index} className={`bg-white rounded-2xl p-8 shadow-lg border-2 ${req.status === 'active' ? 'border-vesoko_green_600' : 'border-gray-200'}`}>
                    {req.status === 'active' && (
                      <div className="inline-flex items-center gap-2 bg-vesoko_green_600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                        <CheckCircle className="w-4 h-4" />
                        Active Now
                      </div>
                    )}
                    {req.status === 'coming-soon' && (
                      <div className="inline-flex items-center gap-2 bg-vesoko_yellow text-vesoko_dark_blue px-3 py-1 rounded-full text-sm font-semibold mb-4">
                        <Star className="w-4 h-4" />
                        Coming Soon
                      </div>
                    )}
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{req.title}</h3>
                    
                    <ul className="space-y-3">
                      {req.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-vesoko_green_600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {req.status === 'active' && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <Link href="/select-store-type" className="inline-flex items-center gap-2 bg-vesoko_green_600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-vesoko_green_700 transition-colors duration-300">
                          Apply Now
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Resources Section */}
          {!isLoading && (sellerContent.length > 0 || sellerFAQs.length > 0) && (
            <section className="py-16 sm:py-24 bg-gradient-to-br from-vesoko_light_blue via-blue-50 to-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Seller Resources</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Everything you need to succeed as a VeSoko seller.
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                  {/* Featured Articles */}
                  {sellerContent.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h3>
                      <div className="space-y-4">
                        {sellerContent.map((article) => (
                          <Link key={article._id} href={`/page/${article.slug}`}>
                            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                              <h4 className="font-semibold text-gray-900 mb-2">{article.title}</h4>
                              {article.excerpt && (
                                <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-6">
                        <Link href="/sellers/resources" className="inline-flex items-center gap-2 text-vesoko_dark_blue hover:text-vesoko_green_600 font-semibold">
                          View All Resources
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Popular FAQs */}
                  {sellerFAQs.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Questions</h3>
                      <div className="space-y-4">
                        {sellerFAQs.map((faq) => (
                          <div key={faq._id} className="bg-white rounded-xl p-6 shadow-md">
                            <h4 className="font-semibold text-gray-900 mb-3">{faq.question}</h4>
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {faq.answer.substring(0, 200)}...
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                              <span>{faq.views} views</span>
                              <span>•</span>
                              <span>{faq.helpfulCount} helpful</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6">
                        <Link href="/faq?userType=seller" className="inline-flex items-center gap-2 text-vesoko_dark_blue hover:text-vesoko_green_600 font-semibold">
                          View All Seller FAQs
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="py-16 sm:py-24 bg-gradient-to-r from-vesoko_dark_blue to-vesoko_green_600 text-white">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Start Selling?</h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Join the VeSoko marketplace today and connect your authentic African products with customers worldwide. 
                Phase 1 is active now for US-based African sellers!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/select-store-type" className="inline-flex items-center justify-center gap-2 bg-vesoko_yellow text-vesoko_dark_blue px-8 py-4 rounded-xl font-semibold hover:bg-yellow-300 transition-colors duration-300">
                  Apply to Sell Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact?inquiryType=seller" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-vesoko_dark_blue transition-colors duration-300">
                  Have Questions?
                  <MessageSquare className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>
        </main>

      </div>
    </>
  );
};

export default SellersHub;
