// pages/register-verify.tsx
import { checkUserVerified } from '@/utils/auth/checkUserVerified';
import { resendVerificationEmail } from '@/utils/auth/resendVerification';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Mail, RefreshCw, CheckCircle2, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

const RegisterVerifyPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const checkVerification = async () => {
    if (!email) return; // Don't check if email is missing
    setIsLoading(true);

    try {
      const verificationStatus = await checkUserVerified(email as string);
      setErrorMessage(null); // Clear any previous errors
      if (!verificationStatus) {
        setErrorMessage('Please verify your email before proceeding.');
      } else {
        if (isSeller) {
          router.push('/store-application');
        } else {
          router.push('/login');
        }
      }
      setIsVerified(verificationStatus);
    } catch (error) {
      console.error('Error checking verification:', error);
      setErrorMessage('An error occurred. Please try again.');
      setIsVerified(false);
    } finally {
      setIsLoading(false); // Set isLoading to false in the finally block
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('verificationEmail');
    const isSeller = localStorage.getItem('isSeller');

    if (email && isSeller) {
      setEmail(email);
      setIsSeller(isSeller === 'true');
    }

    checkVerification();
  }, [email]);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResendLoading) return;
    
    setIsResendLoading(true);
    setErrorMessage(null);
    setResendMessage(null);
    
    try {
      const response = await resendVerificationEmail(email as string);
      setResendMessage('Verification email sent successfully! Please check your inbox.');
      setResendCooldown(60); // 60 second cooldown
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      setErrorMessage(error?.response?.data?.msg || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className='w-full bg-gradient-to-br from-vesoko_primary to-vesoko_background min-h-screen flex items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center'>
            <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>Something went wrong</h2>
            <p className='text-gray-600 mb-6'>
              We couldn't find your verification request. Please try registering again or contact support.
            </p>
            <div className='space-y-3'>
              <button
                onClick={() => router.push('/register')}
                className='w-full h-12 bg-vesoko_primary hover:bg-vesoko_primary/90 text-white font-medium rounded-lg transition-all duration-200'
              >
                Back to Register
              </button>
              <p className='text-sm text-gray-500'>
                Need help? Contact us at{' '}
                <Link href='mailto:support@vesoko.com' className='text-vesoko_primary hover:underline'>
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
    <div className='w-full bg-gradient-to-br from-vesoko_primary to-vesoko_background min-h-screen flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100'>
          <div className='text-center mb-8'>
            <div className='w-20 h-20 bg-vesoko_primary/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Mail className='w-10 h-10 text-vesoko_primary' />
            </div>
            <h1 className='text-3xl font-bold text-vesoko_primary mb-2'>
              Check Your Email
            </h1>
            <p className='text-gray-600'>
              We've sent a verification link to
            </p>
            <p className='font-semibold text-vesoko_primary break-all'>
              {email}
            </p>
          </div>

          <div className='space-y-6'>
            {/* Instructions */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex items-start'>
                <CheckCircle2 className='w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0' />
                <div className='text-sm text-blue-800'>
                  <p className='font-medium mb-1'>What to do next:</p>
                  <ul className='space-y-1 text-blue-700'>
                    <li>• Check your inbox for our verification email</li>
                    <li>• Click the verification link in the email</li>
                    <li>• Return here once verified</li>
                    <li>• Don't forget to check your spam folder</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className='p-4 rounded-lg bg-red-50 border border-red-200'>
                <div className='flex items-center'>
                  <AlertCircle className='w-5 h-5 text-red-600 mr-2' />
                  <p className='text-sm text-red-600'>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {resendMessage && (
              <div className='p-4 rounded-lg bg-green-50 border border-green-200'>
                <div className='flex items-center'>
                  <CheckCircle2 className='w-5 h-5 text-green-600 mr-2' />
                  <p className='text-sm text-green-600'>{resendMessage}</p>
                </div>
              </div>
            )}

            {/* Resend Button */}
            <button
              type='button'
              onClick={handleResendVerification}
              disabled={isResendLoading || resendCooldown > 0}
              className={`w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white font-medium transition-all duration-200 ${
                isResendLoading || resendCooldown > 0
                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              {isResendLoading ? (
                <>
                  <div className='animate-spin h-5 w-5 border-2 border-gray-300 border-t-vesoko_primary rounded-full'></div>
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className='w-4 h-4' />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className='w-4 h-4' />
                  Resend Verification Email
                </>
              )}
            </button>

            {/* Continue Button */}
            {isVerified !== null && (
              <button
                type='button'
                onClick={checkVerification}
                disabled={isLoading}
                className={`w-full h-12 bg-vesoko_primary hover:bg-vesoko_primary/90 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                    Checking...
                  </>
                ) : (
                  <>
                    {isSeller ? 'Continue to Store Application' : 'Continue to Login'}
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </button>
            )}

            {/* Help Section */}
            <div className='text-center pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-600 mb-2'>
                Didn't receive the email?
              </p>
              <div className='space-y-2 text-sm text-gray-500'>
                <p>• Check your spam or junk folder</p>
                <p>• Make sure {email} is correct</p>
                <p>
                  • Still having trouble?{' '}
                  <Link
                    href='mailto:support@vesoko.com'
                    className='text-vesoko_primary hover:text-vesoko_primary font-medium transition-colors duration-200'
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

RegisterVerifyPage.noLayout = true; // Remove root layout from this page
export default RegisterVerifyPage;
