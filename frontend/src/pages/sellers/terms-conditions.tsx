import React from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import { Store, Scale, DollarSign, AlertCircle, Shield } from 'lucide-react';
import Link from 'next/link';

const SellerTermsConditions = () => {
  return (
    <>
      <Head>
        <title>Seller Terms & Conditions | VeSoko - Selling Guidelines & Rules</title>
        <meta name="description" content="Complete terms and conditions for sellers on VeSoko marketplace. Understand your responsibilities, fees, and obligations." />
        <meta name="keywords" content="seller terms, seller conditions, marketplace rules, VeSoko sellers, selling guidelines" />
      </Head>

      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-vesoko_primary via-vesoko_secondary to-vesoko_primary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <Store className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Seller Terms & Conditions</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Your guide to selling successfully on VeSoko. Understanding your rights and responsibilities as a seller.
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
              <span className="text-gray-900">Terms & Conditions</span>
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

          {/* Key Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">10% Platform Fee</h3>
              <p className="text-gray-600 text-sm">Transparent fee structure with no hidden charges.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Seller Protection</h3>
              <p className="text-gray-600 text-sm">Fair policies and dispute resolution to protect sellers.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Clear Obligations</h3>
              <p className="text-gray-600 text-sm">Well-defined responsibilities and expectations.</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">VeSoko Seller Terms & Conditions</h2>
              
              <p className="text-gray-700 mb-6">
                These Terms and Conditions for Sellers govern your access to and use of VeSoko.com as a seller. By creating a seller account, listing products, or selling on VeSoko, you agree to be bound by these Terms and our Seller Privacy Policy. If you do not agree, you may not sell on the platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Eligibility and Registration</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>You must be 18 years or older to register as a seller</li>
                <li>Provide accurate business information including legal name, business registration, and contact details</li>
                <li>Must have a valid Stripe account to receive payments</li>
                <li>VeSoko reserves the right to refuse registration or request verification documents</li>
                <li>Providing false information may result in account suspension or termination</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Seller Responsibilities</h3>
              <p className="text-gray-700 mb-4">As a VeSoko seller, you agree to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Accurately represent products in listings with correct descriptions, pricing, and images</li>
                <li>Ensure all products are authentic, safe, and comply with applicable laws</li>
                <li>Maintain adequate stock to fulfill orders promptly</li>
                <li>Ship orders within stated handling times</li>
                <li>Respond to buyer inquiries and return requests within 2 business days</li>
                <li>Comply with VeSoko's return and refund policy requirements</li>
                <li>Keep account, payment, and business information current</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Marketplace Role</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>VeSoko provides an online marketplace platform but is not the buyer of your products</li>
                <li>You are responsible for product quality, safety, legality, and compliance</li>
                <li>VeSoko facilitates transactions and payment processing via Stripe</li>
                <li>You retain ownership and responsibility for your products until sold</li>
                <li>You are solely responsible for any warranties or guarantees offered</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Product Listings</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Listings must be truthful, clear, and not misleading</li>
                <li>Images must accurately represent products and not infringe third-party rights</li>
                <li>Must maintain accurate stock levels</li>
                <li>VeSoko reserves the right to remove or edit listings that violate Terms or laws</li>
                <li>By uploading content, you grant VeSoko a license to display and promote it</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Orders, Payments, and Fees</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-800 mb-2">Platform Fee Structure</h4>
                <p className="text-green-700 text-sm">VeSoko charges a <strong>10% platform fee</strong> per completed sale, deducted automatically from your payout.</p>
              </div>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Orders are confirmed once payment is successfully processed by Stripe</li>
                <li>Payments are disbursed to your linked Stripe account per the schedule in your dashboard</li>
                <li>You are responsible for all applicable taxes on your sales</li>
                <li>VeSoko may withhold payouts for refunds, chargebacks, or policy violations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Returns, Refunds, and Disputes</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Must honor VeSoko's return and refund policy for buyers</li>
                <li>Return requests must be reviewed and responded to within 2 business days</li>
                <li>Must issue refunds or replacements for defective, damaged, or incorrect items</li>
                <li>Responsible for return shipping costs if due to seller error</li>
                <li>VeSoko may issue refunds and deduct from payouts for unaddressed claims</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Shipping and Delivery</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Responsible for securely packaging and shipping products within handling time</li>
                <li>Must comply with VeSoko's approved shipping label and carrier requirements</li>
                <li>VeSoko may assist with carrier-related disputes but is not liable for delays</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Legal Compliance</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Products must comply with all applicable federal, state, and local laws</li>
                <li>Must comply with import/export regulations for international shipping</li>
                <li>Responsible for obtaining all required licenses, permits, and certifications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Cannot list counterfeit goods or infringe on intellectual property rights</li>
                <li>Must indemnify VeSoko for IP-related claims arising from your products</li>
                <li>VeSoko may remove listings and suspend accounts for IP infringement</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Account Suspension and Termination</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>VeSoko may suspend or terminate accounts for Terms violations, fraud, or illegal activity</li>
                <li>Account data may be retained for legal compliance and fraud prevention</li>
                <li>Pending orders must still be fulfilled unless VeSoko determines otherwise</li>
                <li>Outstanding obligations remain after termination</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">11. Governing Law and Disputes</h3>
              <p className="text-gray-700 mb-6">
                These Terms are governed by Kentucky state law. Disputes will be resolved through binding individual arbitration under the American Arbitration Association rules in Kentucky, USA.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h3>
              <p className="text-gray-700 mb-6">
                VeSoko may update these Terms at any time. For material changes, we'll provide at least 14 days' notice via email or seller dashboard. Continued use constitutes acceptance of updated Terms.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Information</h3>
              <p className="text-gray-700 mb-2">
                For questions about these Terms or your seller account:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 font-medium">
                  Email: <Link href="mailto:team@vesoko.com" className="text-vesoko_primary hover:underline">team@vesoko.com</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-12 bg-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/sellers/privacy-policy" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Shield className="h-5 w-5 text-vesoko_primary mr-3" />
                <span className="text-gray-700 hover:text-vesoko_primary">Seller Privacy Policy</span>
              </Link>
              <Link href="/sellers/faq" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Store className="h-5 w-5 text-vesoko_primary mr-3" />
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

SellerTermsConditions.noLayout = true;
export default SellerTermsConditions;
