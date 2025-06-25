import ErrorMessageModal from '@/components/ErrorMessageModal';
import Button from '@/components/FormInputs/Button';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { createStripeConnectAccount as createStripeAccountApi } from '@/utils/stripe/createStripeConnectAccount';
import { hasActiveStripeConnectAccount as checkActiveStripeAccountApi } from '@/utils/stripe/hasStripeConnectAccount';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';

const StripeSetupPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  // Redirect if not logged in or not a seller, or if Stripe is already active
  useEffect(() => {
    if (sessionStatus === 'loading' || redirecting) return; // Wait for session, don't re-run if already redirecting

    const checkAndRedirect = async () => {
      if (!session?.user) {
        router.replace('/login'); // Not logged in, redirect to login
        return;
      }

      if (!session.user.storeId) {
        router.replace('/'); // Logged in but not a seller, redirect to homepage
        return;
      }

      // User is a seller, now check Stripe account status
      if (userInfo?._id) {
        try {
          const response = await checkActiveStripeAccountApi(userInfo._id);
          if (response && response.hasStripeAccount && response.isActive) {
            // Stripe account is already active, redirect them to their dashboard
            setRedirecting(true); // Prevent further checks
            let dashboardUrl = '/';
            if (storeInfo?.storeType === 'manufacturing') {
              dashboardUrl = '/manufacturer';
            } else if (storeInfo?.storeType === 'wholesale') {
              dashboardUrl = '/wholesaler';
            } else if (storeInfo?.storeType === 'retail') {
              dashboardUrl = '/retailer';
            } else if (storeInfo?.storeType === 'admin') {
              dashboardUrl = '/admin';
            }
            router.replace(dashboardUrl);
          }
        } catch (error) {
          console.error(
            'Error checking Stripe account status on setup page:',
            error
          );
          setErrorMessage(
            'Failed to verify Stripe account status. Please try again.'
          );
        }
      }
    };

    checkAndRedirect();
  }, [session, sessionStatus, userInfo, storeInfo, router, redirecting]);

  const handleSetupStripe = async () => {
    if (!userInfo?.email) {
      setErrorMessage('User email not found. Please log in again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await createStripeAccountApi(userInfo.email);

      if (response && response.url) {
        setSuccessMessage('Redirecting to Stripe for setup...');
        // Redirect the user to the Stripe onboarding URL
        window.location.href = response.url;
        // IMPORTANT: After this, Stripe will redirect back to your return_url.
        // The useEffect above will then re-check the status and redirect the user.
      } else {
        setErrorMessage(
          'Failed to get Stripe onboarding URL. Please try again.'
        );
      }
    } catch (error: any) {
      console.error('Error setting up Stripe account:', error);
      setErrorMessage(
        error ||
          'An error occurred during Stripe account setup. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while session is loading or if we are in the middle of redirection
  if (sessionStatus === 'loading' || redirecting) {
    return (
      <div className='flex items-center justify-center min-h-[calc(100vh-100px)]'>
        <p>Loading...</p>
      </div>
    );
  }

  // If user is logged in but not a seller (and not redirecting), show a message or redirect home
  if (!session?.user || !session.user.storeId) {
    // This case should ideally be caught by the useEffect above, but as a fallback
    return (
      <div className='flex items-center justify-center min-h-[calc(100vh-100px)]'>
        <p>You do not have a seller account.</p>
      </div>
    );
  }

  return (
    <div className='w-full bg-nezeza_powder_blue min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue rounded-lg p-4'>
        <div className='bg-white p-6 sm:p-8 rounded-lg shadow-xl text-center max-w-lg w-full'>
        <h1 className='text-2xl font-semibold mb-4'>
            Stripe Account Setup Required
          </h1>

          <p className='text-gray-700 mb-6'>
            Dear {userInfo?.firstName || 'Seller'},<br />
            Welcome to Nezeza.
            <br />
            As a seller, you need to set up your Stripe account to start selling
            on the platform. This account will be used for you to receive and
            make payments.
          </p>

          <Button
            isLoading={isLoading}
            buttonTitle='Setup Stripe Account'
            loadingButtonTitle='Redirecting to Stripe...'
            className='w-full text-center justify-center max-w-xs mx-auto py-3 bg-nezeza_dark_blue text-white rounded-md hover:bg-nezeza_dark_blue_2 transition-colors duration-300 text-lg font-semibold'
            onClick={handleSetupStripe}
            disabled={isLoading}
          />

          {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
          {successMessage && (
            <SuccessMessageModal successMessage={successMessage} />
          )}
        </div>
      </div>
    </div>
  );
};

StripeSetupPage.noLayout = true;

export default StripeSetupPage;
