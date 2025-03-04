// pages/register-verify.tsx
import { checkUserVerified } from '@/utils/auth/checkUserVerified';
import { resendVerificationEmail } from '@/utils/auth/resendVerification';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const RegisterVerifyPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

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
          router.push('/store-register');
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

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail(email as string);
      setResendMessage('Verification email resent successfully.');
      setErrorMessage(null);
    } catch (error) {
      console.error('Error resending verification email:', error);
      setErrorMessage(null); 
      setErrorMessage('Failed to resend verification email. Please try again.');
    }
  };

  if (!email) {
    return (
      <div className='text-center'>
        An error occurred while trying to load the verify email page. Please
        contact us at support@nezeza.com for assistance.
      </div>
    );
  }

  return (
    <div className='w-full bg-nezeza_powder_blue min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue p-4'>
        <div className='w-full max-w-md bg-white p-6 space-y-4 rounded-lg shadow-lg text-center flex flex-col'>
          <h3 className='text-xl font-semibold text-nezeza_green_600'>
            Verify Your Email
          </h3>
          <p className='mt-4 text-gray-600'>
            We've sent a verification link to <strong>{email}</strong>. Please
            check your inbox and follow the instructions to verify your email.
          </p>
          {errorMessage && (
            <p className='mt-2 text-center text-nezeza_red_600'>
              {errorMessage}
            </p>
          )}
          {resendMessage && (
            <p className='mt-2 text-center text-nezeza_green_600'>
              {resendMessage}
            </p>
          )}
          <button
            type='button'
            className='mt-4 px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors duration-300'
            onClick={handleResendVerification}
          >
            Resend Verification Email
          </button>
          {isVerified !== null && (
            <button
              type='button'
              className='mt-6 px-4 py-2 rounded-md bg-nezeza_dark_blue text-white hover:bg-nezeza_green_600 hover:text-white transition-colors duration-300'
              onClick={checkVerification}
              disabled={isLoading}
            >
              {isLoading ? ( 
                <span>Processing...</span>
              ) : isSeller ? (
                'Continue to Store Registration'
              ) : (
                'Continue to Login'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

RegisterVerifyPage.noLayout = true; // Remove root layout from this page
export default RegisterVerifyPage;
