
import React from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import { Store, Shield, Lock, AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';

const SellerPrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Seller Privacy Policy | VeSoko</title>
        <meta name="description" content="Read the privacy policy for sellers on VeSoko. Learn how your business and personal data is collected, used, protected, and your rights as a seller." />
        <meta name="keywords" content="seller privacy, data protection, business information, VeSoko" />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-vesoko_primary via-vesoko_secondary to-vesoko_primary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Seller Privacy Policy</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Effective Date: August 15, 2025
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
              <span className="text-gray-900">Privacy Policy</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Last Updated */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-blue-800 font-medium">
                Last Updated: August 15, 2025
              </p>
            </div>
          </div>

          {/* Privacy Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
              <p className="text-gray-600 text-sm">Sensitive documents and business data are encrypted and stored securely on U.S.-based servers.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Limited Sharing</h3>
              <p className="text-gray-600 text-sm">We only share necessary information to facilitate sales, compliance, and legal requirements.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Rights</h3>
              <p className="text-gray-600 text-sm">You have full control over your data with rights to access, correct, delete, and object to processing.</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">VeSoko Seller Privacy Policy</h2>
              <p className="text-gray-700 mb-6">
                VeSoko (“we,” “our,” “us”) is committed to protecting the personal and business data of our sellers. This Privacy Policy explains how we collect, use, share, and protect your information when you register and operate as a seller on the VeSoko platform. This policy forms part of the Vesoko Seller Terms & Conditions and is legally binding. If there is any conflict between this policy and the Seller Terms & Conditions, the stricter privacy protection will apply.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Legal Compliance and Jurisdiction</h3>
              <p className="text-gray-700 mb-4">
                VeSoko is registered in Kentucky, United States, and this Privacy Policy is governed by the laws of the State of Kentucky and applicable U.S. federal laws.<br />
                This policy applies to both U.S. and international sellers, and we comply with relevant privacy regulations, including the California Consumer Privacy Act (CCPA).
              </p>
              <p className="text-gray-700 mb-4"><strong>Do Not Track:</strong> At this time, Vesoko does not respond to Do Not Track browser signals.</p>
              <p className="text-gray-700 mb-4"><strong>Dispute Resolution:</strong> Any disputes relating to this Privacy Policy will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, with arbitration taking place in Kentucky, United States. You agree to submit to the exclusive jurisdiction of the state and federal courts in Kentucky for enforcing any arbitration award.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h3>
              <h4 className="text-lg font-medium text-gray-900 mb-3">2.1 Information You Provide</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Legal name and contact information</li>
                <li>Business or store name</li>
                <li>Business registration details (e.g., license number, tax ID)</li>
                <li>Photo identification (passport, driver’s license, or other government-issued ID)</li>
                <li>Product photos, descriptions, and other listing details</li>
                <li>Information required by Stripe to process payments (provided directly to Stripe)</li>
              </ul>
              <h4 className="text-lg font-medium text-gray-900 mb-3">2.2 Information We Collect Automatically</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>IP address, browser type, device details, and operating system</li>
                <li>Pages viewed, actions taken, and time spent on the platform</li>
                <li>Cookies and tracking data for compliance monitoring and fraud prevention (see Section 5)</li>
              </ul>
              <h4 className="text-lg font-medium text-gray-900 mb-3">2.3 Performance Data</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Sales history and transaction records</li>
                <li>Return and refund history</li>
                <li>Customer review statistics</li>
                <li>Store performance metrics and operational activity logs</li>
              </ul>
              <h4 className="text-lg font-medium text-gray-900 mb-3">2.4 Document Retention</h4>
              <p className="text-gray-700 mb-4">Government-issued IDs and other verification documents are stored securely and deleted within 12 months of account closure unless required for legal or compliance purposes.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Data</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Verify your identity and eligibility to sell</li>
                <li>Fulfill and process orders</li>
                <li>Process payments through Stripe</li>
                <li>Promote your store and products (you may opt out of certain promotional features by contacting us)</li>
                <li>Provide insights and sales recommendations based on trends</li>
                <li>Generate anonymized platform statistics for internal use, investor reporting, and public performance reports</li>
                <li>Detect, investigate, and prevent fraud, policy violations, or illegal activities</li>
                <li>Comply with legal, tax, and regulatory obligations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Data Sharing</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Shipping and delivery partners (e.g., address information to complete orders)</li>
                <li>Tax authorities or customs agencies, if legally required</li>
                <li>Stripe, for secure payment processing (governed by <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-vesoko_primary hover:underline">Stripe’s Privacy Policy</a>)</li>
                <li>Regulatory bodies or law enforcement in cases of fraud, intellectual property infringement, or legal disputes</li>
              </ul>
              <p className="text-gray-700 mb-4">We do not provide sellers’ personal contact information directly to buyers — all communications occur through Vesoko’s platform.</p>
              <p className="text-gray-700 mb-4">In the event Vesoko is acquired, merges with another company, or undergoes a business restructuring, your data may be transferred to the new owner under the same privacy obligations. Sellers will be notified before such transfer and may request account deletion beforehand.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking</h3>
              <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Maintain secure seller sessions</li>
                <li>Monitor platform usage for compliance and fraud prevention</li>
                <li>Analyze performance to improve seller tools</li>
              </ul>
              <p className="text-gray-700 mb-4">Types of cookies used:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Session cookies — deleted when you close your browser</li>
                <li>Persistent cookies — stored up to 12 months or until manually deleted</li>
              </ul>
              <p className="text-gray-700 mb-4">You may disable cookies via your browser settings, but this may limit certain seller dashboard functions.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Seller Rights</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Access and download their account, transaction, and performance history</li>
                <li>Correct or update personal or business information</li>
                <li>Request account deletion (order and invoice data may be retained for up to 7 years to comply with tax and legal requirements)</li>
                <li>Object to specific types of data processing, where legally applicable</li>
              </ul>
              <p className="text-gray-700 mb-4">Identity Verification: We verify deletion and access requests via your registered email or by requesting a valid ID.</p>
              <p className="text-gray-700 mb-4">Processing Timeline: Data-related requests will be processed within 30 days, unless an extension is required by law.</p>
              <p className="text-gray-700 mb-4">Archived copies of certain records may be retained for dispute resolution and fraud prevention.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Data Security and Retention</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Sensitive documents (IDs, tax forms) are encrypted and stored with restricted access.</li>
                <li>Payment and banking details are never stored by Vesoko; they are handled by Stripe.</li>
                <li>Seller data is stored on secure U.S.-based servers.</li>
                <li>Access to seller data is limited to authorized staff bound by confidentiality agreements.</li>
                <li>We conduct periodic internal security audits.</li>
                <li>In the event of a data breach involving seller data, we will notify affected sellers within 72 hours, where feasible.</li>
                <li>Data from closed accounts is retained for 6 months unless a longer period is required by law.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Age Restrictions</h3>
              <p className="text-gray-700 mb-4">You must be 18 years or older to register and operate as a seller on Vesoko.</p>
              <p className="text-gray-700 mb-4">If we discover a seller has misrepresented their age, we will terminate the account and delete associated data.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h3>
              <p className="text-gray-700 mb-4">We may update this Privacy Policy from time to time.</p>
              <p className="text-gray-700 mb-4">For major changes, we will post a notice on our website and email registered sellers.</p>
              <p className="text-gray-700 mb-4">For significant changes to how we process seller data, we will request explicit consent where required by law.</p>
              <p className="text-gray-700 mb-4">Continued use of the platform after receiving notice of changes constitutes acceptance of the updated policy.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Us</h3>
              <p className="text-gray-700 mb-2">For privacy-related inquiries, contact us at:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 font-medium">
                  Email: <a href="mailto:team@vesoko.com" className="text-vesoko_primary hover:underline">team@vesoko.com</a>
                </p>
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
              <Link href="/sellers/faq" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Shield className="h-5 w-5 text-vesoko_primary mr-3" />
                <span className="text-gray-700 hover:text-vesoko_primary">Seller FAQ</span>
              </Link>
               <Link href="/return-refund-policy" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Shield className="h-5 w-5 text-vesoko_primary mr-3" />
                <span className="text-gray-700 hover:text-vesoko_primary">Return Policy</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerPrivacyPolicy;
