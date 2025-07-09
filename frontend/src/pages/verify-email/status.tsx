// pages/verify-email/status.tsx
import { verifyEmail } from '@/utils/auth/verifyEmail';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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
      <div className='text-center p-4'>
        An error occurred while trying to load the verify email status page.
        Please contact us at support@vesoko.com for assistance.
      </div>
    );
  }

  return (
    <div className='w-full bg-vesoko_powder_blue min-h-screen flex items-center justify-center'>
      <div className='bg-vesoko_light_blue p-4'>
        <div className='w-full max-w-md bg-white p-6 space-y-4 rounded-lg shadow-lg text-center flex flex-col'>
          {isVerified === true ? (
            <div>
              <h3 className='text-xl font-semibold text-vesoko_green_600'>
                Email Verified Successfully
              </h3>
              <p className='mt-4 text-gray-600'>
                Email <strong>{email}</strong> verified successfully! Continue
                to login.
              </p>
              <button
                type='button'
                className='mt-6 px-4 py-2 rounded-md bg-vesoko_dark_blue text-white hover:bg-vesoko_green_600 hover:text-white transition-colors duration-300'
                onClick={goToLogin}
                disabled={isLoading}
              >
                {isLoading ? <span>Processing...</span> : 'Continue to Login'}
              </button>
            </div>
          ) : isVerified === false ? (
            <div>
              <h3 className='text-xl font-semibold text-vesoko_red_600'>
                Email Not Verified
              </h3>
              <p className='mt-4 text-gray-600'>
                Please check your email: <strong>{email}</strong> and try again.
              </p>
              {errorMessage && (
                <p className='text-red-500 mt-2'>{errorMessage}</p>
              )}
            </div>
          ) : (
            <div>
              <h3 className='text-xl font-semibold text-gray-700'>
                Verifying Email...
              </h3>
              <p className='mt-4 text-gray-600'>
                Please wait while we verify your email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

VerifyEmailStatusPage.noLayout = true; // Remove root layout from this page
export default VerifyEmailStatusPage;
