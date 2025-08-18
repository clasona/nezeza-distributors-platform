import React, { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import { ShoppingBag, HelpCircle, ChevronDown, ChevronRight, AlertCircle, CreditCard, Truck, Shield } from 'lucide-react';
import Link from 'next/link';

const CustomerFAQ = () => {
  const [openSections, setOpenSections] = useState<string[]>(['general']);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const faqSections = [
    {
      id: 'general',
      title: 'General Questions',
      icon: <ShoppingBag className="h-5 w-5 text-blue-600" />,
      questions: [
        {
          q: 'What is VeSoko?',
          a: 'VeSoko is an e-commerce marketplace connecting U.S. customers with authentic African products from trusted African-owned retailers.'
        },
        {
          q: 'Is VeSoko available in my country?',
          a: 'Currently, VeSoko only serves customers within the United States. We plan to expand to include African wholesalers and manufacturers soon.'
        },
        {
          q: 'Who can shop on VeSoko?',
          a: 'Anyone with a valid U.S. shipping address can shop on VeSoko.'
        },
        {
          q: 'How do I create an account?',
          a: 'Visit www.vesoko.com, click Sign Up, and register with your email or Google account.'
        },
        {
          q: 'Do I need an account to place an order?',
          a: 'Yes. Creating an account lets you track your orders, communicate with sellers, and access return/refund services.'
        },
        {
          q: 'Is VeSoko a marketplace or a single store?',
          a: 'VeSoko is a multi-vendor marketplace with independent African retailers across the U.S.'
        },
        {
          q: 'How do I contact VeSoko support?',
          a: 'Email marketplace@vesoko.com or use our live chat during business hours.'
        }
      ]
    },
    {
      id: 'orders-tracking',
      title: 'Orders & Tracking',
      icon: <Truck className="h-5 w-5 text-purple-600" />,
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Log in, browse items, add products to your cart, and check out. You\'ll get an email confirmation and tracking link once shipped.'
        },
        {
          q: 'Can I order from multiple shops in one checkout?',
          a: 'Yes. You can shop from multiple vendors in a single checkout, though items may arrive separately.'
        },
        {
          q: 'How do I track my order?',
          a: 'Use the tracking link in your confirmation email or visit the My Orders page in your account.'
        },
        {
          q: 'I didn\'t get a confirmation or tracking email. What should I do?',
          a: 'Check your spam/junk folder, then contact support if you still don\'t see it.'
        },
        {
          q: 'Can I cancel or change my order?',
          a: 'You can cancel or modify your order before it is processed or shipped. After that, you\'ll need to request a return if eligible.'
        }
      ]
    },
    {
      id: 'payments-billing',
      title: 'Payments & Billing',
      icon: <CreditCard className="h-5 w-5 text-green-600" />,
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept major credit/debit cards, Apple Pay, Cash App, and Zelle.'
        },
        {
          q: 'Will I be charged sales tax?',
          a: 'Yes. Taxes are automatically calculated at checkout based on your shipping address.'
        },
        {
          q: 'Who processes payments?',
          a: 'Payments are securely processed through Stripe. VeSoko does not store payment details.'
        },
        {
          q: 'I was double-charged or incorrectly charged — what should I do?',
          a: 'Contact VeSoko support with your order number and proof, and we\'ll investigate promptly.'
        }
      ]
    },
    {
      id: 'shipping-delivery',
      title: 'Shipping & Delivery',
      icon: <Truck className="h-5 w-5 text-orange-600" />,
      questions: [
        {
          q: 'Where does VeSoko ship?',
          a: 'We ship to addresses within the United States.'
        },
        {
          q: 'Where are items shipped from?',
          a: 'All items currently ship from within the U.S. by the vendor.'
        },
        {
          q: 'How long will delivery take?',
          a: 'Same-day delivery for orders near participating stores. Standard shipping: 3–7 business days.'
        },
        {
          q: 'How much does shipping cost?',
          a: 'Costs vary by size, weight, and distance. The exact amount is shown at checkout.'
        },
        {
          q: 'My item hasn\'t arrived — what should I do?',
          a: 'Check your tracking link first. If it shows delays or no updates, contact VeSoko within 7 days of the expected delivery date.'
        }
      ]
    },
    {
      id: 'returns-refunds',
      title: 'Returns & Refunds',
      icon: <ShoppingBag className="h-5 w-5 text-red-600" />,
      questions: [
        {
          q: 'What is your return policy?',
          a: 'You can request a return within 10 days of delivery if the item is damaged, defective, or not as described. Unopened, unused non-perishable items may also be eligible.'
        },
        {
          q: 'How do I request a return?',
          a: 'Go to My Orders, click Request Return, and upload photos if applicable.'
        },
        {
          q: 'Who pays for return shipping?',
          a: 'Seller pays if the item is damaged, incorrect, or defective.'
        },
        {
          q: 'How long until I get my refund?',
          a: 'Refunds are processed within 7 business days after the returned item is received and approved.'
        },
        {
          q: 'Can I get a replacement instead?',
          a: 'Yes, if the seller agrees and has stock available.'
        }
      ]
    },
    {
      id: 'account-privacy',
      title: 'Account & Privacy',
      icon: <ShoppingBag className="h-5 w-5 text-indigo-600" />,
      questions: [
        {
          q: 'How do I delete my account?',
          a: 'Email marketplace@vesoko.com. Some order and invoice records may be retained for legal compliance.'
        },
        {
          q: 'How is my data protected?',
          a: 'We use secure encryption, partner only with trusted payment processors, and follow our Privacy Policy.'
        },
        {
          q: 'Will my information be shared with sellers?',
          a: 'Sellers only receive the information necessary to fulfill your order (name, shipping address).'
        }
      ]
    },
    {
      id: 'policies-legal',
      title: 'Policies & Legal',
      icon: <ShoppingBag className="h-5 w-5 text-yellow-600" />,
      questions: [
        {
          q: 'What laws govern my purchases?',
          a: 'Purchases are governed by the laws of Kentucky, USA, and our Terms & Conditions.'
        },
        {
          q: 'How are disputes handled?',
          a: 'Most disputes are resolved through VeSoko customer support. If needed, they may be escalated to arbitration as outlined in our Terms.'
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Buyer FAQ | VeSoko - Frequently Asked Questions</title>
        <meta name="description" content="Find answers to common shopping questions on VeSoko. Get help with orders, returns, payments, and shipping." />
        <meta name="keywords" content="buyer FAQ, shopping help, order questions, VeSoko help, returns, shipping" />
      </Head>

      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <HelpCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Buyer FAQ</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Everything you need to know about shopping on VeSoko. Get answers to the most common customer questions.
            </p>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-blue-600">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/customer" className="text-gray-500 hover:text-blue-600">Buyers</Link>
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
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3-7 Days</h3>
              <p className="text-gray-600 text-sm">Standard delivery time</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">10 Days</h3>
              <p className="text-gray-600 text-sm">Return window</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600 text-sm">Stripe payment processing</p>
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
                        <div key={qaIndex} className="border-l-4 border-blue-500 pl-4">
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
                Can't find what you're looking for? Our customer support team is ready to help you with your shopping experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="mailto:marketplace@vesoko.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Contact Page
                </Link>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-12 bg-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/buyers/terms-conditions" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <ShoppingBag className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700 hover:text-blue-600">Buyer Terms & Conditions</span>
              </Link>
              <Link href="/buyers/privacy-policy" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Shield className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700 hover:text-blue-600">Buyer Privacy Policy</span>
              </Link>
              <Link href="/return-refund-policy" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Truck className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700 hover:text-blue-600">Return Policy</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

CustomerFAQ.noLayout = true;
export default CustomerFAQ;
