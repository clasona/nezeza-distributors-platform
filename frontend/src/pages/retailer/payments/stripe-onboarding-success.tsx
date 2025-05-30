import React from 'react';
import { useRouter } from 'next/router';

const StripeOnboardingSuccess = () => {
  const router = useRouter();
  const { sellerStoreType } = router.query;

  return (
    <div className='w-full bg-nezeza_powder_blue min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue rounded-lg text-center items-center justify-center p-4'>
        <h1 className='text-2xl font-semibold mb-4'>
          Stripe Onboarding Complete
        </h1>
        <p className='mb-6'>
          Your Stripe account has been successfully connected!
        </p>
        <button
          onClick={() => router.replace(`/${sellerStoreType}`)}
          className='px-4 py-2 rounded bg-nezeza_green_600 text-white text-center items-center justify-center hover:bg-nezeza_green_800'
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

StripeOnboardingSuccess.noLayout = true;

export default StripeOnboardingSuccess;
