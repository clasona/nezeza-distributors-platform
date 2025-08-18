'use client';

import React, { useState } from 'react';
import FAQItem from './FAQItem';

const CustomerSupportFAQS: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');

  const faqData = {
    general: [
      {
        question: "What is Vesoko?",
        answer: "Vesoko is an e-commerce platform that connects U.S. customers with authentic African products from trusted African-owned retailers."
      },
      {
        question: "Is Vesoko available in my country?",
        answer: "Vesoko currently serves customers within the United States. U.S.-based retailers can join the platform, and we plan to integrate African wholesalers and manufacturers soon."
      },
      {
        question: "Who can shop on Vesoko?",
        answer: "Anyone with a valid U.S. shipping address can place an order on Vesoko."
      },
      {
        question: "How do I create an account?",
        answer: "Visit www.vesoko.com, go to the homepage, and register using your email address or Google account."
      },
      {
        question: "Do I need an account to place an order?",
        answer: "Yes. Creating an account allows you to track orders and communicate directly with the VeSoko team and retailers."
      },
      {
        question: "Is Vesoko a marketplace or a single store?",
        answer: "Vesoko is a multi-vendor marketplace that features African retailers based in the United States."
      },
      {
        question: "How do I contact Vesoko support?",
        answer: "Email us at support@vesoko.com or use the live chat option on our website during business hours."
      }
    ],
    orders: [
      {
        question: "How do I place an order?",
        answer: "Log in to your account, browse products, add items to your cart, and proceed to checkout. You'll receive confirmation and tracking details via email."
      },
      {
        question: "Can I order from multiple shops in one checkout?",
        answer: "Yes. You can buy from multiple vendors in a single order, though items may arrive separately based on each vendor's fulfillment process."
      },
      {
        question: "How do I track my order?",
        answer: "Once your item has shipped, you'll receive a tracking link via email. You can also track your order from the 'My Orders' section in your account profile."
      },
      {
        question: "I didn't get a confirmation or tracking email. What should I do?",
        answer: "First, check your spam or junk folder. If you still haven't received it, please contact Vesoko support."
      },
      {
        question: "Can I cancel or change my order?",
        answer: "You can request a cancellation or edit your order before it is processed or shipped. After that, you may need to request a return or refund if the item is eligible."
      }
    ],
    payments: [
      {
        question: "What payment methods are accepted?",
        answer: "We accept major credit and debit cards, Apple Pay, Cash App, and Zelle."
      },
      {
        question: "Will I be charged sales tax?",
        answer: "Yes. Sales tax is calculated automatically at checkout based on your shipping address and local tax laws."
      },
      {
        question: "I was double-charged or incorrectly charged — what should I do?",
        answer: "Contact Vesoko support with your order number and proof of the issue. We'll resolve it as quickly as possible."
      }
    ],
    shipping: [
      {
        question: "Where does Vesoko ship?",
        answer: "We currently ship to customers across the United States."
      },
      {
        question: "Where are items shipped from?",
        answer: "During this initial phase, all products are shipped from within the U.S. by the retailer selling the product."
      },
      {
        question: "How long will delivery take?",
        answer: "Same-day delivery is available for orders placed near participating stores. Standard U.S. shipping takes 3–7 business days."
      },
      {
        question: "How much does shipping cost?",
        answer: "Shipping fees vary based on the shipping distance and item size. The final shipping cost is shown at checkout before you complete your order."
      },
      {
        question: "My item hasn't arrived — what should I do?",
        answer: "Check your tracking link for updates. If the item is delayed or lost, please contact Vesoko support within 7 days of the expected delivery date."
      }
    ]
  };

  const categories = [
    { id: 'general', name: 'General Questions' },
    { id: 'orders', name: 'Orders & Tracking' },
    { id: 'payments', name: 'Payments & Billing' },
    { id: 'shipping', name: 'Shipping & Delivery' }
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
                  ? 'bg-nezeza_dark_blue text-white'
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
            className="px-4 py-2 bg-nezeza_dark_blue text-white rounded-lg hover:bg-nezeza_dark_blue_2 transition-colors"
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
