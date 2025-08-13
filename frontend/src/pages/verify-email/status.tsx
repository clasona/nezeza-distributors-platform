// pages/verify-email/status.tsx
import { verifyEmail } from '@/utils/auth/verifyEmail';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const VerifyEmailStatusPage = () => {
  const router = useRouter();
  const { token, email } = router.query;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  useEffect(() => {
    const handleVerifyEmail = async () => {
      if (typeof token === 'string' && typeof email === 'string') {
        setIsLoading(true);
        try {
          const result = await verifyEmail(email, token);
          console.log('success status', result.success);
          setIsVerified(result.success);
          if (!result.success) {
            setErrorMessage(result.message || 'Verification failed.');
          }
        } catch (error) {
          console.error('Verification error:', error);
          setErrorMessage('An unexpected error occurred.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setErrorMessage('Invalid verification link.');
      }
    };

    if (token && email) {
      handleVerifyEmail();
    }
  }, [token, email]);

  const goToLogin = () => {
    router.push('/login');
  };

  if (!token || !email) {
    return (
      <div className='w-full bg-gradient-to-br from-vesoko_powder_blue to-vesoko_light_blue min-h-screen flex items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center'>
            <XCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>Invalid Link</h2>
            <p className='text-gray-600 mb-6'>
              This verification link is invalid or has expired. Please try requesting a new verification email.
            </p>
            <div className='space-y-3'>
              <button
                onClick={() => router.push('/register')}
                className='w-full h-12 bg-vesoko_dark_blue hover:bg-vesoko_dark_blue/90 text-white font-medium rounded-lg transition-all duration-200'
              >
                Back to Register
              </button>
              <p className='text-sm text-gray-500'>
                Need help? Contact us at{' '}
                <Link href='mailto:support@vesoko.com' className='text-vesoko_dark_blue hover:underline'>
                  support@vesoko.com
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full bg-gradient-to-br from-vesoko_powder_blue to-vesoko_light_blue min-h-screen flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100'>
          {/* Success State */}
          {isVerified === true && (
            <div className='text-center'>
              <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <CheckCircle2 className='w-12 h-12 text-green-600' />
              </div>
              <h1 className='text-3xl font-bold text-green-600 mb-4'>
                Email Verified!
              </h1>
              <p className='text-gray-600 mb-2'>
                Your email address has been successfully verified.
              </p>
              <p className='font-semibold text-vesoko_dark_blue break-all mb-6'>
                {email}
              </p>
              <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
                <div className='flex items-center'>
                  <CheckCircle2 className='w-5 h-5 text-green-600 mr-2' />
                  <p className='text-sm text-green-800'>
                    You can now access all features of your VeSoko account!
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={goToLogin}
                disabled={isLoading}
                className={`w-full h-12 bg-vesoko_dark_blue hover:bg-vesoko_dark_blue/90 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Login
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error State */}
          {isVerified === false && (
            <div className='text-center'>
              <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <XCircle className='w-12 h-12 text-red-600' />
              </div>
              <h1 className='text-3xl font-bold text-red-600 mb-4'>
                Verification Failed
              </h1>
              <p className='text-gray-600 mb-2'>
                We couldn't verify your email address.
              </p>
              <p className='font-semibold text-vesoko_dark_blue break-all mb-4'>
                {email}
              </p>
              
              {errorMessage && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
                  <div className='flex items-center'>
                    <XCircle className='w-5 h-5 text-red-600 mr-2' />
                    <p className='text-sm text-red-800'>{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className='space-y-3'>
                <button
                  onClick={() => router.push('/verify-email')}
                  className='w-full h-12 bg-vesoko_dark_blue hover:bg-vesoko_dark_blue/90 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2'
                >
                  <RefreshCw className='w-4 h-4' />
                  Request New Verification
                </button>
                
                <button
                  onClick={() => router.push('/register')}
                  className='w-full h-12 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all duration-200'
                >
                  Back to Register
                </button>
              </div>

              <div className='mt-6 pt-6 border-t border-gray-200'>
                <p className='text-sm text-gray-600 mb-2'>
                  Common issues:
                </p>
                <div className='text-sm text-gray-500 space-y-1 text-left'>
                  <p>• Link may have expired (links are valid for 24 hours)</p>
                  <p>• You may have already verified this email</p>
                  <p>• The link may have been corrupted when copied</p>
                </div>
                <p className='text-sm text-gray-500 mt-4'>
                  Still having trouble?{' '}
                  <Link
                    href='mailto:support@vesoko.com'
                    className='text-vesoko_dark_blue hover:text-vesoko_yellow font-medium transition-colors duration-200'
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isVerified === null && (
            <div className='text-center'>
              <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <Loader2 className='w-12 h-12 text-blue-600 animate-spin' />
              </div>
              <h1 className='text-3xl font-bold text-blue-600 mb-4'>
                Verifying Email...
              </h1>
              <p className='text-gray-600 mb-2'>
                Please wait while we verify your email address.
              </p>
              <p className='font-semibold text-vesoko_dark_blue break-all mb-6'>
                {email}
              </p>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex items-center'>
                  <Loader2 className='w-5 h-5 text-blue-600 mr-2 animate-spin' />
                  <p className='text-sm text-blue-800'>
                    This should only take a few seconds...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

VerifyEmailStatusPage.noLayout = true; // Remove root layout from this page
export default VerifyEmailStatusPage;
