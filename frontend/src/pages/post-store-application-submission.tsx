import Link from 'next/link';
import { CheckCircle, Clock, Mail, FileText, Home, ArrowRight, Phone, MessageSquare } from 'lucide-react';

const PostStoreApplicationSubmission = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Success Header */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6'>
            <CheckCircle className='h-12 w-12 text-green-500' />
          </div>
          
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Application Submitted
            <span className='block text-vesoko_green_600'>Successfully!</span>
          </h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed'>
            Thank you for your interest in joining VeSoko! Your store application has been received and is now under review.<br />
            <span className='font-semibold text-vesoko_dark_blue'>Our team will review your application and notify you within <span className='text-vesoko_green_600'>48 hours</span>.</span>
          </p>
        </div>

        {/* Main Content Card */}
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8'>
          {/* What Happens Next Section */}
          <div className='bg-gradient-to-r from-vesoko_dark_blue to-vesoko_green_600 px-8 py-6'>
            <h2 className='text-2xl font-bold text-white mb-2'>What Happens Next?</h2>
            <p className='text-blue-100'>Here's what you can expect during our review process</p>
          </div>

          <div className='p-8'>
            <div className='grid md:grid-cols-3 gap-8 mb-8'>
              {/* Step 1 */}
              <div className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
                  <FileText className='h-8 w-8 text-blue-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>Document Review</h3>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  Our team will carefully review your business documents and verify your information.
                </p>
                <div className='mt-3 text-sm text-blue-600 font-medium'>Part of 48-Hour Review</div>
              </div>

              {/* Step 2 */}
              <div className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4'>
                  <Clock className='h-8 w-8 text-yellow-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>Application Processing</h3>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  We'll assess your application against our seller criteria and platform standards.
                </p>
                <div className='mt-3 text-sm text-yellow-600 font-medium'>Part of 48-Hour Review</div>
              </div>

              {/* Step 3 */}
              <div className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
                  <Mail className='h-8 w-8 text-green-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>Decision Notification</h3>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  You'll receive an email with our decision and next steps for setting up your store.
                </p>
                <div className='mt-3 text-sm text-green-600 font-medium'>Within 48 Hours</div>
              </div>
            </div>

            {/* Important Information */}
            <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>📧 Email Confirmation Sent</h3>
              <p className='text-gray-700 mb-4'>
                We've sent a confirmation email to your registered email address with:
              </p>
              <ul className='space-y-2 text-gray-600'>
                <li className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
                  Application reference details
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
                  <span>
                    <span className='font-semibold text-vesoko_dark_blue'>Review Timeline:</span> Most applications are reviewed within <span className='text-vesoko_green_600'>48 hours</span>.
                  </span>
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
                  Contact information for questions
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className='bg-gray-50 rounded-xl p-6 mb-8'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Need Help or Have Questions?</h3>
              <div className='grid md:grid-cols-2 gap-4'>
                <div className='flex items-center gap-3'>
                  <Mail className='h-5 w-5 text-vesoko_dark_blue' />
                  <div>
                    <p className='font-medium text-gray-900'>Email Support</p>
                    <Link href='mailto:support@vesoko.com' className='text-vesoko_dark_blue hover:text-vesoko_green_600 transition-colors'>
                      support@vesoko.com
                    </Link>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Phone className='h-5 w-5 text-vesoko_dark_blue' />
                  <div>
                    <p className='font-medium text-gray-900'>Call Us</p>
                    <Link href='tel:+15551234567' className='text-vesoko_dark_blue hover:text-vesoko_green_600 transition-colors'>+1 (959) 999-0661</Link>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <MessageSquare className='h-5 w-5 text-vesoko_dark_green' />
                  <div>
                    <p className='font-medium text-gray-900'>WhatsApp</p>
                    <Link href='https://wa.me/18608169330' target='_blank' rel='noopener noreferrer' className='text-vesoko_dark_green hover:text-vesoko_green_600 transition-colors'>+1 (860) 816-9330</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <Link 
            href='/'
            className='inline-flex items-center gap-2 bg-vesoko_dark_blue text-white px-8 py-3 rounded-lg font-medium hover:bg-vesoko_green_600 transition-all duration-200 transform hover:scale-105 shadow-lg'
          >
            <Home className='h-5 w-5' />
            Explore Marketplace
          </Link>
          
          <Link 
            href='/sellers'
            className='inline-flex items-center gap-2 bg-white text-vesoko_dark_blue border-2 border-vesoko_dark_blue px-8 py-3 rounded-lg font-medium hover:bg-vesoko_dark_blue hover:text-white transition-all duration-200 shadow-lg'
          >
            Learn More About Selling
            <ArrowRight className='h-5 w-5' />
          </Link>
        </div>

        {/* Footer Message */}
        <div className='text-center mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20'>
          <p className='text-gray-600'>
            🌍 <strong>VeSoko</strong> - Connecting African businesses with global opportunities
          </p>
          <p className='text-sm text-gray-500 mt-2'>
            We're committed to supporting African entrepreneurs and bringing authentic products to the world.
          </p>
        </div>
      </div>
    </div>
  );
};

PostStoreApplicationSubmission.noLayout = true;
export default PostStoreApplicationSubmission;
