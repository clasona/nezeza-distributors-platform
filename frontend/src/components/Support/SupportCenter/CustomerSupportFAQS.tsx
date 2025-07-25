'use client';

import React, { useState } from 'react';
import FAQItem from './FAQItem';

const CustomerSupportFAQS: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');

  const faqData = {
    general: [
      {
        question: "What is Vesoko?",
        answer: "Vesoko is a comprehensive e-commerce platform that connects manufacturers, wholesalers, retailers, and customers in a seamless marketplace. We facilitate B2B and B2C transactions with integrated logistics and payment solutions."
      },
      {
        question: "How do I create an account?",
        answer: "You can create an account by clicking the 'Sign Up' button on our homepage. Choose your user type (customer, retailer, wholesaler, or manufacturer) and follow the registration process. You'll need to provide basic information and verify your email address."
      },
      {
        question: "Is Vesoko available in my country?",
        answer: "Vesoko currently operates in Rwanda and is expanding to other East African countries. Check our homepage for the latest information about our service areas."
      },
      {
        question: "How can I contact customer support?",
        answer: "You can contact our support team through multiple channels: submit a support ticket through this portal, email us at support@vesoko.com, or call our support hotline during business hours."
      }
    ],
    orders: [
      {
        question: "How do I place an order?",
        answer: "Browse our product catalog, add items to your cart, and proceed to checkout. You'll need to provide shipping and payment information. Once confirmed, your order will be processed and shipped."
      },
      {
        question: "Can I cancel my order?",
        answer: "Orders can be cancelled within 24 hours of placement, provided they haven't been shipped yet. Contact our support team immediately if you need to cancel an order."
      },
      {
        question: "How do I track my order?",
        answer: "You can track your order through your account dashboard or by using the tracking number provided in your order confirmation email. Real-time updates are available once your order ships."
      },
      {
        question: "What if my order arrives damaged?",
        answer: "If your order arrives damaged, please take photos and contact our support team within 48 hours of delivery. We'll arrange for a replacement or refund as appropriate."
      }
    ],
    payments: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept various payment methods including mobile money (MTN, Airtel), bank transfers, and credit/debit cards. Payment options may vary by region."
      },
      {
        question: "Is it safe to pay online?",
        answer: "Yes, all payments are processed through secure, encrypted channels. We use industry-standard security protocols to protect your financial information."
      },
      {
        question: "When will I be charged?",
        answer: "Payment is processed when you place your order. For pre-orders or backorders, you may be charged when the item becomes available."
      },
      {
        question: "How do I get a refund?",
        answer: "Refunds are processed within 5-7 business days after we receive your returned item. The refund will be issued to your original payment method."
      }
    ],
    shipping: [
      {
        question: "How long does shipping take?",
        answer: "Shipping times vary by location and delivery method. Standard delivery typically takes 3-5 business days within Rwanda, while express delivery takes 1-2 business days."
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we primarily serve Rwanda with plans to expand to other East African countries. International shipping options are limited."
      },
      {
        question: "How much does shipping cost?",
        answer: "Shipping costs depend on your location, order weight, and delivery method. Free shipping is available for orders above a certain threshold."
      },
      {
        question: "Can I change my shipping address?",
        answer: "You can change your shipping address before your order ships by contacting our support team. Once shipped, address changes may not be possible."
      }
    ],
    sellers: [
      {
        question: "How do I become a seller on Vesoko?",
        answer: "To become a seller, you need to apply through our seller registration process. We'll review your application and business credentials before approval."
      },
      {
        question: "What are the seller fees?",
        answer: "Seller fees vary by category and sales volume. We offer competitive commission rates and transparent fee structures. Contact our business development team for details."
      },
      {
        question: "How do I manage my inventory?",
        answer: "Sellers can manage their inventory through our seller dashboard. You can add, edit, and remove products, update stock levels, and track sales performance."
      },
      {
        question: "When do I receive payments?",
        answer: "Payments are typically processed within 7-14 days after order delivery, depending on your payment schedule and any pending returns."
      }
    ]
  };

  const categories = [
    { id: 'general', name: 'General Questions' },
    { id: 'orders', name: 'Orders & Tracking' },
    { id: 'payments', name: 'Payments & Billing' },
    { id: 'shipping', name: 'Shipping & Delivery' },
    { id: 'sellers', name: 'Seller Information' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      
      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {faqData[activeCategory as keyof typeof faqData]?.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
        <p className="text-gray-600 mb-4">
          If you couldn't find the answer you're looking for, our support team is here to help.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => window.location.href = '/customer/support/submit-ticket'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit a Ticket
          </button>
          <a
            href="mailto:support@vesoko.com"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportFAQS; 