import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormattedPrice from '@/components/FormattedPrice'; // Assuming you have this component
import Link from 'next/link';

// Define your subscription plans
interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  features: string[];
  mostPopular?: boolean; // Optional: to highlight a plan
}

const subscriptionPlans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Seller',
    priceMonthly: 19.99,
    features: [
      'List up to 100 products',
      'Basic analytics',
      'Standard support',
      '5% transaction fee',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Seller',
    priceMonthly: 49.99,
    features: [
      'Unlimited product listings',
      'Advanced analytics',
      'Priority support',
      '3% transaction fee',
      'Promotional tools',
    ],
    mostPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 99.99,
    features: [
      'All Pro features',
      'Dedicated account manager',
      'Custom integrations',
      '1% transaction fee',
      'Exclusive beta access',
    ],
  },
];

const StripeOnboardingSuccess = () => {
  const router = useRouter();
  const { sellerStoreType } = router.query;
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessingPlan, setIsProcessingPlan] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);

  // Dummy Stripe card data on file for demo
  const cardOnFile = {
    brand: 'Visa',
    last4: '4242',
    exp_month: '12',
    exp_year: '28',
  };

  // Determine the dashboard URL based on sellerStoreType
  const getDashboardUrl = (storeType: string | string[] | undefined) => {
    if (Array.isArray(storeType)) {
      storeType = storeType[0]; // Take the first element if it's an array
    }
    switch (storeType) {
      case 'manufacturing':
        return '/manufacturer';
      case 'wholesale':
        return '/wholesaler';
      case 'retail':
        return '/retailer';
      case 'admin':
        return '/admin';
      default:
        return '/'; // Fallback for unknown or missing type
    }
  };

  const dashboardUrl = getDashboardUrl(sellerStoreType);

  useEffect(() => {
    // Basic validation: if sellerStoreType is not present, redirect to home/login
    if (!sellerStoreType) {
      router.replace('/login'); // Or '/'
    }
  }, [sellerStoreType, router]);

  const handlePlanSelection = async (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentPrompt(true);
  };

  const handleUseCardOnFile = () => {
    setIsProcessingPlan(true);
    setTimeout(() => {
      alert(
        `Subscription started using card ending in ${cardOnFile.last4}. Redirecting to dashboard.`
      );
      router.replace(dashboardUrl);
      setIsProcessingPlan(false);
    }, 1500);
  };

  const handleEnterNewCard = () => {
    setIsProcessingPlan(true);
    setTimeout(() => {
      alert(
        'Simulating new card entry. Subscription started. Redirecting to dashboard.'
      );
      router.replace(dashboardUrl);
      setIsProcessingPlan(false);
    }, 2000);
  };

  const handleSkipForNow = () => {
    router.replace(dashboardUrl);
  };

  if (!sellerStoreType) {
    // Render a loading state or redirect if sellerStoreType is not yet available
    return (
      <div className='w-full bg-vesoko_primary min-h-screen flex items-center justify-center'>
        <p className='text-vesoko_dark_slate text-lg'>Loading...</p>
      </div>
    );
  }

  return (
    <div className='w-full bg-vesoko_primary min-h-screen flex items-center justify-center p-4'>
      <div className='bg-vesoko_background rounded-lg text-center items-center justify-center p-6 sm:p-8 shadow-xl max-w-4xl w-full'>
        <h1 className='text-3xl font-bold text-vesoko_primary mb-4'>
          Stripe Onboarding Complete!
        </h1>
        <p className='text-lg text-gray-700 mb-2'>
          Your Stripe account has been successfully connected. Now, choose a
          plan to unlock your selling potential!
        </p>
        <p className='text-lg text-vesoko_green_700 mb-8 font-semibold'>
          <span className='bg-vesoko_primary_100 px-2 py-1 rounded'>
            Enjoy your first{' '}
            <span className='text-vesoko_green_800'>3 months FREE</span> on any
            plan!
          </span>
        </p>
        {!showPaymentPrompt && (
          <>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-10'>
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between
                    ${
                      plan.mostPopular
                        ? 'border-2 border-vesoko_primary transform scale-105'
                        : 'border border-gray-200'
                    }
                    transition-all duration-300 hover:shadow-xl`}
                >
                  <div>
                    <h2 className='text-2xl font-bold text-vesoko_primary mb-2'>
                      {plan.name}{' '}
                      {plan.mostPopular && (
                        <span className='text-sm bg-vesoko_primary_600 text-white px-2 py-1 rounded-full ml-2'>
                          Popular
                        </span>
                      )}
                    </h2>
                    <div className='text-4xl font-extrabold text-vesoko_primary mb-4'>
                      <FormattedPrice amount={plan.priceMonthly} />
                      <span className='text-base font-normal text-gray-500'>
                        {' '}
                        / month
                      </span>
                    </div>
                    <ul className='text-left text-gray-700 space-y-2 mb-6'>
                      {plan.features.map((feature, index) => (
                        <li key={index} className='flex items-start'>
                          <svg
                            className='h-5 w-5 text-green-500 mr-2 flex-shrink-0'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={isProcessingPlan}
                    className={`w-full py-3 rounded-md font-semibold transition-colors duration-300
                      ${
                        plan.mostPopular
                          ? 'bg-vesoko_primary text-white hover:bg-vesoko_secondary'
                          : 'bg-vesoko_primary text-white hover:bg-blue-700'
                      }
                      ${
                        isProcessingPlan && selectedPlan === plan.id
                          ? 'opacity-70 cursor-not-allowed'
                          : ''
                      }`}
                  >
                    {isProcessingPlan && selectedPlan === plan.id
                      ? 'Processing...'
                      : `Select ${plan.name} Plan`}
                  </button>
                </div>
              ))}
            </div>
            <div className='mt-8'>
              <button
                onClick={handleSkipForNow}
                className='text-vesoko_primary hover:underline font-semibold text-lg'
                disabled={isProcessingPlan} // Disable skip if processing a plan
              >
                Skip for now, continue to Dashboard &rarr;
              </button>
            </div>
          </>
        )}

        {showPaymentPrompt && (
          <div className='mt-10 flex flex-col items-center'>
            <h2 className='text-2xl font-bold mb-4 text-vesoko_primary'>
              Choose Payment Method
            </h2>
            <p className='text-gray-700 mb-4'>
              Would you like to use the card you just set up with Stripe, or
              enter new payment details for your subscription?
            </p>
            <div className='flex flex-col md:flex-row gap-4 w-full max-w-md justify-center'>
              <button
                onClick={handleUseCardOnFile}
                disabled={isProcessingPlan}
                className='bg-vesoko_primary text-white w-full md:w-auto px-6 py-3 rounded-md font-semibold hover:bg-vesoko_secondary transition-colors duration-300 flex items-center justify-center'
              >
                {isProcessingPlan
                  ? 'Processing...'
                  : `Use ${cardOnFile.brand} ending in ${cardOnFile.last4}`}
              </button>
              <button
                onClick={handleEnterNewCard}
                disabled={isProcessingPlan}
                className='bg-white border border-vesoko_primary text-vesoko_primary w-full md:w-auto px-6 py-3 rounded-md font-semibold hover:bg-vesoko_primary hover:text-white transition-colors duration-300'
              >
                {isProcessingPlan
                  ? 'Processing...'
                  : 'Enter new payment details'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

StripeOnboardingSuccess.noLayout = true;

export default StripeOnboardingSuccess;
