
import React from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import { Shield, Mail, FileText, AlertCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy for Buyers | VeSoko</title>
        <meta name="description" content="Read the privacy policy for buyers on VeSoko. Learn how your data is collected, used, protected, and your rights as a buyer." />
        <meta name="keywords" content="privacy policy, buyer, data protection, personal information, VeSoko" />
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy for Buyers</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Effective Date: August 15, 2025
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
                Last Updated: August 15, 2025
              </p>
            </div>
          </div>

          {/* Privacy Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
              <p className="text-gray-600 text-sm">We use encryption, firewalls, and secure access controls to protect your personal information.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Transparent Usage</h3>
              <p className="text-gray-600 text-sm">We clearly explain how we collect, use, and share your data for marketplace services.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Rights</h3>
              <p className="text-gray-600 text-sm">You have control over your data including access, correction, deletion, and portability rights.</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">VeSoko Privacy Policy for Buyers</h2>
              <p className="text-gray-700 mb-6">
                VeSoko (“we,” “our,” “us”) is committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and protect your information as a buyer on our platform. By using VeSoko, you agree to the terms of this policy.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Legal Compliance and Jurisdiction</h3>
              <p className="text-gray-700 mb-4">
                VeSoko is registered in Kentucky, United States, and this Privacy Policy is governed by the laws of the State of Kentucky and applicable U.S. federal laws.<br />
                We comply with applicable privacy regulations, including the California Consumer Privacy Act (CCPA), the Children’s Online Privacy Protection Act (COPPA).
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Do Not Track:</strong> At this time, our platform does not respond to “Do Not Track” browser signals.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Dispute Resolution:</strong> Any disputes arising from or relating to this Privacy Policy or your use of the VeSoko platform will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. Arbitration shall take place in Kentucky, United States. You agree to submit to the exclusive jurisdiction of the state and federal courts located in Kentucky for enforcing any arbitration award.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h3>
              <h4 className="text-lg font-medium text-gray-900 mb-3">2.1 Information You Provide</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Name, email address, and phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Order and payment details (processed securely via third-party payment processors such as Stripe)</li>
                <li>Account preferences and messages sent via our platform</li>
                <li>Optional demographic information (e.g., age, gender, preferences) for personalization</li>
                <li>Parental or guardian consent documentation if under 18</li>
              </ul>
              <h4 className="text-lg font-medium text-gray-900 mb-3">2.2 Information We Collect Automatically</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>IP address (which may reveal your approximate location)</li>
                <li>Browser type, device information, and operating system</li>
                <li>Pages viewed, clicks, and session data</li>
                <li>Cookies and similar technologies (browser-based, with preference controls coming soon)</li>
              </ul>
              <h4 className="text-lg font-medium text-gray-900 mb-3">2.3 Customer Service Records</h4>
              <p className="text-gray-700 mb-4">We may record customer service calls and retain chat transcripts for quality assurance and dispute resolution. These records are retained for up to 12 months unless required for ongoing dispute handling.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Data</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Fulfill, process, and ship your orders</li>
                <li>Provide order updates and customer support</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Improve our website and services through analytics and feedback</li>
                <li>Personalize your experience, including recommending products based on preferences and buying trends</li>
                <li>Send marketing communications if you opt in (you can unsubscribe at any time)</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>
              <p className="text-gray-700 mb-4">You cannot opt out of service-related communications (e.g., order confirmations, shipping notifications).</p>
              <p className="text-gray-700 mb-4">We do not engage in automated decision-making that produces legal or significant effects on buyers.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Data Sharing</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Vendors, only as necessary to fulfill your orders (e.g., name and shipping address)</li>
                <li>Shipping providers, such as DoorDash, for order delivery</li>
                <li>Third-party payment processors (e.g., Stripe) for secure payment processing — their use of your data is governed by their own privacy policy (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-vesoko_primary hover:underline">Stripe’s Privacy Policy</a>).</li>
                <li>Regulatory authorities when legally required</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>We do not sell your personal information.</strong> We also do not share personal data with vendors for marketing purposes.
              </p>
              <p className="text-gray-700 mb-4">
                In the event VeSoko is acquired, merges with another company, or undergoes a business restructuring, your data may be transferred to the new owner under the same privacy obligations. You will be notified in advance and given the option to delete your account before the transfer occurs.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h3>
              <p className="text-gray-700 mb-4">We use cookies to enable core site functionality, remember your preferences, and analyze site performance.</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Session cookies (deleted when you close your browser)</li>
                <li>Persistent cookies (stored up to 12 months or until you delete them)</li>
                <li>Third-party cookies for advertising and retargeting may be used in the future. If implemented, you will be notified and given a choice to opt in or out.</li>
                <li>We do not currently use tracking pixels in emails.</li>
              </ul>
              <p className="text-gray-700 mb-4">You may disable cookies via your browser settings, but this may affect some site features.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Access and request a copy of your personal data</li>
                <li>Correct or update your information</li>
                <li>Request deletion of your account (order and invoice data may be retained for up to 7 years as required by tax and accounting laws before deletion)</li>
                <li>Opt out of marketing communications while still receiving essential transactional emails</li>
                <li>Object to certain data uses or request limitations on processing</li>
                <li>Request data portability</li>
              </ul>
              <p className="text-gray-700 mb-4">Identity Verification: We may verify your identity by sending a confirmation link to your registered email or requesting proof of identity.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Data Security and Retention</h3>
              <p className="text-gray-700 mb-4">We use encryption, firewalls, and secure access controls to protect your data.</p>
              <p className="text-gray-700 mb-4">Payment details are handled exclusively by Stripe; VeSoko does not store payment card numbers.</p>
              <p className="text-gray-700 mb-4">Buyer data is stored on secure U.S.-based servers.</p>
              <p className="text-gray-700 mb-4">Access to personal data is restricted to authorized staff bound by confidentiality obligations.</p>
              <p className="text-gray-700 mb-4">We conduct periodic security reviews and audits to safeguard our systems.</p>
              <p className="text-gray-700 mb-4">In the event of a data breach involving sensitive information, we will notify affected buyers promptly, as required by law.</p>
              <p className="text-gray-700 mb-4">Inactive accounts may be retained for a minimum of 90 days before deletion.</p>
              <p className="text-gray-700 mb-4">Buyers are responsible for maintaining the confidentiality of their account credentials.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Minors</h3>
              <p className="text-gray-700 mb-4">The VeSoko platform is intended for buyers aged 18 and older.</p>
              <p className="text-gray-700 mb-4">Buyers under 18 may only use the platform with verified parental or guardian consent.</p>
              <p className="text-gray-700 mb-4">We do not knowingly collect personal data from children under 13. If we discover such data has been collected, we will delete it promptly.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h3>
              <p className="text-gray-700 mb-4">We may update this Privacy Policy from time to time.</p>
              <p className="text-gray-700 mb-4">For major changes, we will post a notice on our website and send an email to registered buyers.</p>
              <p className="text-gray-700 mb-4">For changes that significantly affect how we process your data, we will request your explicit consent where required by law.</p>
              <p className="text-gray-700 mb-4">Continued use of the platform after such changes constitutes your acceptance of the updated policy.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Us</h3>
              <p className="text-gray-700 mb-2">For questions or concerns about this Privacy Policy, contact us at:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 font-medium">
                  Email: <a href="mailto:marketing@vesoko.com" className="text-vesoko_primary hover:underline">marketing@vesoko.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

PrivacyPolicy.noLayout = true;
export default PrivacyPolicy;
