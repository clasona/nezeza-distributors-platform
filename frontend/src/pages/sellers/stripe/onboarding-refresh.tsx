import React from 'react';
import { useRouter } from 'next/router';

const StripeOnboardingRefresh = () => {
  const router = useRouter();
  const { sellerStoreType } = router.query;

  return (
    <div className='w-full bg-vesoko_primary min-h-screen flex items-center justify-center'>
      <div className='bg-vesoko_background rounded-lg text-center items-center justify-center p-4'>
        {' '}
        <h1 className='text-2xl font-semibold mb-4'>
          Stripe Onboarding Interrupted
        </h1>
        <p className='mb-6'>
          It looks like your Stripe onboarding was interrupted or cancelled.
        </p>
        <button
          onClick={() => router.replace(`/sellers/stripe/setup`)}
          className='px-4 py-2 rounded bg-vesoko_primary text-white hover:bg-vesoko_primary2'
        >
          Return to Setup
        </button>
      </div>
    </div>
  );
};

StripeOnboardingRefresh.noLayout = true;

export default StripeOnboardingRefresh;
