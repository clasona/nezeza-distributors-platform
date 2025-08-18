import React, { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import { Store, HelpCircle, ChevronDown, ChevronRight, AlertCircle, DollarSign, Package } from 'lucide-react';
import Link from 'next/link';

const SellerFAQ = () => {
  const [openSections, setOpenSections] = useState<string[]>(['getting-started']);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const faqSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Store className="h-5 w-5 text-vesoko_primary" />,
      questions: [
        {
          q: 'How do I become a seller on VeSoko?',
          a: 'Visit www.vesoko.com and click "Become a Seller" to start your application.'
        },
        {
          q: 'What are the eligibility requirements?',
          a: 'You must be 18+, have a valid business registration, a store, a government-issued ID, be able to register on Stripe, and currently operate in the U.S.'
        },
        {
          q: 'Can I sell from outside the U.S.?',
          a: 'At this stage, VeSoko only supports sellers located in the United States.'
        }
      ]
    },
    {
      id: 'fees-payments',
      title: 'Fees & Payments',
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      questions: [
        {
          q: 'What is the VeSoko platform fee?',
          a: 'VeSoko charges a 10% platform fee on the product price for each completed sale.'
        },
        {
          q: 'How are payouts made?',
          a: 'Payouts are processed through Stripe and released after the buyer confirms receipt of the product. Frequency may vary depending on sales volume.'
        },
        {
          q: 'Are there any other costs?',
          a: 'Promotional fees may apply for featured marketing campaigns and are split between VeSoko and the seller.'
        },
        {
          q: 'Who covers Stripe transaction fees?',
          a: 'Stripe fees are factored into the total price charged to the customer.'
        }
      ]
    },
    {
      id: 'product-listings',
      title: 'Product Listings',
      icon: <Package className="h-5 w-5 text-blue-600" />,
      questions: [
        {
          q: 'Are there restricted or prohibited items?',
          a: 'While VeSoko does not maintain a public running list, frozen goods are only allowed for local delivery to ensure freshness. Hazardous, illegal, or unsafe products are prohibited.'
        },
        {
          q: 'Is there a minimum number of products required?',
          a: 'No minimum. You may list as few or as many items as you wish.'
        },
        {
          q: 'Who provides product photos?',
          a: 'Sellers must provide their own images. If assistance is needed, VeSoko may offer photography support upon discussion.'
        }
      ]
    },
    {
      id: 'orders-shipping',
      title: 'Orders & Shipping',
      icon: <Package className="h-5 w-5 text-purple-600" />,
      questions: [
        {
          q: 'Who handles shipping?',
          a: 'VeSoko is integrated with shipping partners. Sellers package the order, print the provided shipping label, and drop it off.'
        },
        {
          q: 'Does VeSoko provide shipping labels and tracking?',
          a: 'Yes, we provide both shipping labels and tracking tools.'
        },
        {
          q: 'What\'s the maximum handling time?',
          a: 'Sellers must ship orders within 2 business days of purchase.'
        },
        {
          q: 'Who is responsible for lost or damaged shipments?',
          a: 'Sellers are responsible for secure packaging. If damage is due to poor packaging, the seller covers the loss. If lost or damaged during transit, the carrier\'s claim process will determine coverage, and VeSoko will assist with the claim.'
        }
      ]
    },
    {
      id: 'returns-refunds',
      title: 'Returns & Refunds',
      icon: <Package className="h-5 w-5 text-red-600" />,
      questions: [
        {
          q: 'What is the VeSoko return policy, and must sellers comply?',
          a: 'Yes, sellers must comply with VeSoko\'s buyer return policy, which allows returns for defective, damaged, or incorrect items and certain unopened non-perishables.'
        },
        {
          q: 'Who pays for return shipping?',
          a: 'The seller pays if the item is defective, damaged, or incorrect.'
        },
        {
          q: 'How long do sellers have to approve or deny a return?',
          a: 'Sellers must respond within 2 business days.'
        }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing & Exposure',
      icon: <Package className="h-5 w-5 text-orange-600" />,
      questions: [
        {
          q: 'Will VeSoko promote my products?',
          a: 'VeSoko works with sellers to feature products on our social media, ads, and newsletters.'
        },
        {
          q: 'Can I opt out of marketing campaigns?',
          a: 'Yes, sellers can opt out upon request.'
        }
      ]
    },
    {
      id: 'performance',
      title: 'Performance & Compliance',
      icon: <Package className="h-5 w-5 text-indigo-600" />,
      questions: [
        {
          q: 'Are there performance standards for sellers?',
          a: 'Yes. Maintain a 95% on-time shipping rate, an order defect rate below 5%, and respond to buyer inquiries and returns within 2 business days.'
        },
        {
          q: 'What happens if I violate terms or perform poorly?',
          a: 'Repeated violations or poor performance may result in suspension or removal from the platform.'
        }
      ]
    },
    {
      id: 'dispute-resolution',
      title: 'Dispute Resolution',
      icon: <Package className="h-5 w-5 text-yellow-600" />,
      questions: [
        {
          q: 'How are disputes handled?',
          a: 'VeSoko Customer Support may intervene and make a final decision based on evidence provided.'
        },
        {
          q: 'Can VeSoko withhold payouts during disputes?',
          a: 'Yes, payouts can be held until the dispute is resolved.'
        }
      ]
    },
    {
      id: 'account-management',
      title: 'Account Management',
      icon: <Package className="h-5 w-5 text-pink-600" />,
      questions: [
        {
          q: 'Can I pause my store temporarily?',
          a: 'Yes, by removing all active listings or setting stock levels to zero.'
        },
        {
          q: 'How do I close my account?',
          a: 'Contact VeSoko Support. Your account and transaction data will be retained for 6 months for fraud prevention, tax, and compliance purposes before deletion unless legally required to retain it longer.'
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Seller FAQ | VeSoko - Frequently Asked Questions for Sellers</title>
        <meta name="description" content="Find answers to common questions about selling on VeSoko marketplace. Get help with fees, shipping, returns, and seller requirements." />
        <meta name="keywords" content="seller FAQ, seller help, selling questions, VeSoko sellers, marketplace help" />
      </Head>

      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-vesoko_primary via-vesoko_secondary to-vesoko_primary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <HelpCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Seller FAQ</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Everything you need to know about selling on VeSoko. Get answers to the most common seller questions.
            </p>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-vesoko_primary">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/sellers" className="text-gray-500 hover:text-vesoko_primary">Sellers</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900">FAQ</span>
            </nav>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">10% Fee</h3>
              <p className="text-gray-600 text-sm">Simple, transparent pricing</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2 Days</h3>
              <p className="text-gray-600 text-sm">Maximum shipping time</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">95%</h3>
              <p className="text-gray-600 text-sm">Required on-time rate</p>
            </div>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {faqSections.map((section, index) => (
              <div key={section.id} className={index > 0 ? 'border-t border-gray-200' : ''}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {section.icon}
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                        {section.questions.length}
                      </span>
                      {openSections.includes(section.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>
                
                {openSections.includes(section.id) && (
                  <div className="px-6 pb-6">
                    <div className="space-y-6">
                      {section.questions.map((qa, qaIndex) => (
                        <div key={qaIndex} className="border-l-4 border-vesoko_primary pl-4">
                          <h4 className="font-medium text-gray-900 mb-2">{qa.q}</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{qa.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-200">
            <div className="text-center">
              <div className="bg-white/80 p-4 rounded-2xl inline-flex mb-4">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Still Have Questions?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our seller support team is here to help you succeed on VeSoko.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="mailto:team@vesoko.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-vesoko_primary text-white font-semibold rounded-lg hover:bg-vesoko_primary_dark transition-colors"
                >
                  Contact Seller Support
                </Link>
                <Link
                  href="/sellers"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Back to Seller Hub
                </Link>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-12 bg-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/sellers/terms-conditions" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Store className="h-5 w-5 text-vesoko_primary mr-3" />
                <span className="text-gray-700 hover:text-vesoko_primary">Seller Terms & Conditions</span>
              </Link>
              <Link href="/sellers/privacy-policy" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Store className="h-5 w-5 text-vesoko_primary mr-3" />
                <span className="text-gray-700 hover:text-vesoko_primary">Seller Privacy Policy</span>
              </Link>
              <Link href="/return-refund-policy" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Package className="h-5 w-5 text-vesoko_primary mr-3" />
                <span className="text-gray-700 hover:text-vesoko_primary">Return Policy</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

SellerFAQ.noLayout = true;

export default SellerFAQ;
