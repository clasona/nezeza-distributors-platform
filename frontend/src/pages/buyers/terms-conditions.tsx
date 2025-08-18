import React from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import { FileText, Scale, Shield, AlertCircle, Truck } from 'lucide-react';
import Link from 'next/link';

const TermsConditions = () => {
  return (
    <>
      <Head>
        <title>Buyer Terms & Conditions | VeSoko - Platform Rules & Guidelines</title>
        <meta name="description" content="Read VeSoko's terms and conditions. Understand your rights and responsibilities when using our marketplace platform." />
        <meta name="keywords" content="terms conditions, marketplace rules, user agreement, VeSoko terms" />
      </Head>

      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-vesoko_primary via-vesoko_secondary to-vesoko_primary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <Scale className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Buyer Terms & Conditions</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Understanding the rules and guidelines that govern our marketplace platform.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Last Updated */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-blue-800 font-medium">
                Effective Date: August 15, 2025
              </p>
            </div>
          </div>

          {/* Terms Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">User Agreement</h3>
              <p className="text-gray-600 text-sm">Terms that apply to all users of the VeSoko marketplace platform.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fair Practices</h3>
              <p className="text-gray-600 text-sm">Guidelines ensuring fair trading and protection for all marketplace participants.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Legal Framework</h3>
              <p className="text-gray-600 text-sm">Legal compliance and dispute resolution procedures.</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">VeSoko Terms & Conditions</h2>
              
              <p className="text-gray-700 mb-6">
                Welcome to VeSoko.com ("VeSoko," "we," "our," "us"). These Terms and Conditions ("Terms") govern your access to and use of our marketplace platform. By creating an account or using VeSoko, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you may not use the platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Marketplace Role</h3>
              <p className="text-gray-700 mb-6">
                VeSoko is a marketplace platform, not the seller of the products listed. Products are offered by independent vendors. We facilitate transactions and may assist with order fulfillment and dispute resolution, but we do not own, manufacture, inspect, or warrant the products. Title and risk of loss for products pass to you upon delivery to the shipping carrier. Any warranties, express or implied, are provided solely by the vendor unless otherwise stated in writing.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility and Account Registration</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>You must be at least 18 years old to create an account and place orders on VeSoko</li>
                <li>Users under 18 may only use VeSoko under the direct supervision of a parent or legal guardian who agrees to be bound by these Terms</li>
                <li>VeSoko reserves the right to request proof of age and to cancel orders placed in violation of this requirement</li>
                <li>You agree to provide accurate, complete, and current information when creating your account</li>
                <li>You are solely responsible for safeguarding your login credentials and for all activities conducted under your account</li>
                <li>We may suspend or terminate your account if we believe you have provided false information, engaged in fraud, or violated these Terms</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Buyer Responsibilities</h3>
              <p className="text-gray-700 mb-4">When using VeSoko, you agree to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Purchase products for personal, non-commercial use only, unless otherwise authorized in writing</li>
                <li>Not use the platform for fraudulent, illegal, or abusive purposes</li>
                <li>Not abuse return/refund policies or submit false claims</li>
                <li>Follow all product return and refund procedures</li>
                <li>Respect intellectual property rights</li>
                <li>Not interfere with platform security or functionality</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Orders and Payments</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Orders are processed after payment is authorized and confirmed by our payment processor</li>
                <li>All prices are in U.S. dollars unless otherwise stated</li>
                <li>You authorize VeSoko or its payment processor to charge your selected payment method for the total order amount, including taxes, shipping, and any applicable duties</li>
                <li>Payment authorization may include pre-authorization checks or temporary holds</li>
                <li>VeSoko reserves the right to cancel or refuse any order in cases of suspected fraud, payment issues, or pricing/stock errors</li>
                <li>If an order is canceled, you will be refunded for any amounts charged</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Shipping and Delivery</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Delivery dates are estimates only and are not guaranteed</li>
                <li>Vendors are responsible for preparing and packaging products; VeSoko coordinates with integrated shipping partners to arrange delivery</li>
                <li>VeSoko is not liable for delays caused by vendors, carriers, customs, or events beyond our control</li>
                <li>You are responsible for providing an accurate shipping address. VeSoko is not liable for lost or undelivered orders due to incorrect addresses provided by you</li>
                <li>Tracking information will be provided when available</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Returns, Refunds, and Replacements</h3>
              
              <h4 className="text-lg font-medium text-gray-900 mb-3 mt-5">6.1 Non-Returnable Items</h4>
              <p className="text-gray-700 mb-2">The following items are not eligible for return unless defective or damaged:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Perishable goods</li>
                <li>Personal care items</li>
                <li>Customized or made-to-order products</li>
                <li>Digital downloads</li>
              </ul>
              
              <h4 className="text-lg font-medium text-gray-900 mb-3">6.2 Return Eligibility</h4>
              <p className="text-gray-700 mb-2">You may request a return within 10 days of delivery if:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>The item is damaged, defective, or broken</li>
                <li>The item differs significantly from the listing description</li>
                <li>The item is unopened and unused (eligible non-perishables only)</li>
              </ul>
              
              <h4 className="text-lg font-medium text-gray-900 mb-3">6.3 Return Process</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Submit a return request via your VeSoko account or contact support</li>
                <li>Provide proof of the issue (e.g., clear photos, unboxing video if applicable)</li>
                <li>The vendor must respond within 2 business days</li>
                <li>If approved, follow the provided return instructions. Return shipping costs may apply unless due to seller error</li>
              </ul>
              
              <h4 className="text-lg font-medium text-gray-900 mb-3">6.4 Refunds and Replacements</h4>
              <p className="text-gray-700 mb-2">Refunds are issued:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Within 7 business days after item inspection and approval by the vendor, or</li>
                <li>If you provide evidence that the item was never delivered or arrived faulty</li>
                <li>Refunds will be sent to your original payment method</li>
                <li>Shipping costs are refunded only if the seller made an error or the item was damaged/incorrect</li>
                <li>You may request a replacement instead of a refund when available</li>
              </ul>
              
              <h4 className="text-lg font-medium text-gray-900 mb-3">6.5 Dispute Resolution</h4>
              <p className="text-gray-700 mb-4">
                If a seller fails to respond or refuses a valid claim, contact VeSoko Customer Support. VeSoko will review all evidence and issue a final resolution.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Product Listings and Descriptions</h3>
              <p className="text-gray-700 mb-6">
                Vendors are solely responsible for the accuracy of their listings. VeSoko does not guarantee that product images and colors will match exactly due to display differences. Errors or inaccuracies in listings may be corrected, and orders may be canceled if necessary.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. User Reviews and Content</h3>
              <p className="text-gray-700 mb-4">You may post reviews, ratings, or questions provided they:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Are truthful, relevant, and respectful</li>
                <li>Do not contain offensive, defamatory, or misleading statements</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You grant VeSoko a worldwide, royalty-free license to use your submitted content for marketing, promotions, or platform improvement. Fake reviews or reviews for products you have not purchased are prohibited.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h3>
              <p className="text-gray-700 mb-6">
                All content on VeSoko.com, including design, software, databases, logos, trademarks, and product images, is the property of VeSoko or its vendors. You may not copy, reproduce, distribute, or exploit any content without written permission.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h3>
              <p className="text-gray-700 mb-6">
                VeSoko is not liable for indirect, incidental, special, or consequential damages, even if we have been advised of the possibility. Our total liability for any claim is limited to the amount you paid for the affected order.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">11. Indemnification</h3>
              <p className="text-gray-700 mb-6">
                You agree to indemnify and hold harmless VeSoko, its affiliates, employees, and agents from any claims, damages, liabilities, and expenses arising from your breach of these Terms or misuse of the platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">12. Account Suspension and Termination</h3>
              <p className="text-gray-700 mb-6">
                VeSoko may suspend or terminate your account at its discretion for fraud, abuse, or violations of these Terms. You remain responsible for any outstanding obligations at the time of termination.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">13. Governing Law and Dispute Resolution</h3>
              <p className="text-gray-700 mb-6">
                These Terms are governed by the laws of the State of Kentucky, without regard to conflict of law principles. Disputes will be resolved through binding arbitration under the rules of the American Arbitration Association in Kentucky, USA. You waive any right to participate in a class action lawsuit or jury trial to the fullest extent permitted by law.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h3>
              <p className="text-gray-700 mb-6">
                VeSoko may update these Terms from time to time. Material changes will be communicated via email or platform notice before taking effect. Continued use of VeSoko after changes take effect constitutes your acceptance of the updated Terms.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">15. Contact Information</h3>
              <p className="text-gray-700 mb-2">
                For questions about these Terms, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 font-medium">
                  Email: <a href="mailto:marketplace@vesoko.com" className="text-vesoko_primary hover:underline">marketplace@vesoko.com</a>
                </p>
              </div>
            </div>
          </div>

           {/* Related Links */}
          <div className="mt-12 bg-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
            <div className="grid md:grid-cols-3 gap-4">
               <Link href="/buyers/privacy-policy" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Shield className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700 hover:text-blue-600">Buyer Privacy Policy</span>
              </Link>
              <Link href="/buyers/faq" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <Shield className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700 hover:text-blue-600">Buyer FAQ</span>
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

TermsConditions.noLayout = true; 
export default TermsConditions;
