// pages/checkout/payment.tsx
import Loading from '@/components/Loaders/Loading';
import CheckoutForm from '@/components/Payments/CheckoutForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../type'; // Ensure type.ts path is correct
import Link from 'next/link';

// Ensure Stripe key is set before loading Stripe
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Stripe publishable key is missing!');
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutPaymentPage = () => {
  const router = useRouter();
  const { cartItemsData, shippingAddress } = useSelector(
    (state: stateProps) => state.next
  );

  // In a real application, the clientSecret would be fetched from your backend
  // after confirming the order details (cart items, shipping address, selected shipping options, and total).
  // For demonstration, let's assume it's passed via query param or fetched directly here.
  let clientSecret: string | undefined = undefined;
  if (router.query.clientSecret) {
    clientSecret = router.query.clientSecret.toString();
  } else {
    // *** IMPORTANT: In a real app, you MUST fetch the clientSecret from your backend here
    // based on the total amount. This usually involves making an API call to your backend
    // after the user has reviewed and confirmed their order on the previous page.
    // For this mock, we'll just log an error.
    console.warn(
      'Client Secret not found in URL parameters. This should be fetched from your backend for actual payments.'
    );
    // You might want to redirect back to the review page or show an error.
  }

  // Redirect if cart is empty or no shipping address (should not happen if flow is followed)
  useEffect(() => {
    if (!cartItemsData.length) {
      router.replace('/'); // Redirect to home if cart is empty
      return;
    }
    if (!shippingAddress) {
      router.replace('/checkout/address'); // Force user back to address entry
      return;
    }
    // You might also want to check if shipping options were selected/confirmed here
    // e.g., if a Redux state variable indicates that the review step was completed.
  }, [cartItemsData, shippingAddress, router]);

  // Memoize options for Stripe Elements
  const options = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              /* Customize appearance here */
            },
            return_url: `${window.location.origin}/payment-status`,
          }
        : undefined,
    [clientSecret]
  );

  return (
    <div className='bg-vesoko_powder_blue min-h-screen p-4 md:p-8 flex items-center justify-center'>
      <div className='w-full max-w-lg p-6 bg-white shadow-lg rounded-lg'>
        <h2 className='text-2xl font-bold mb-4 text-center text-vesoko_dark_blue'>
          Complete Your Payment
        </h2>
        {clientSecret ? (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        ) : (
          <div className='flex flex-col items-center justify-center h-48'>
            <Loading message='necessary payment details' />
            <p className='text-sm text-gray-600 mt-2'>
              Waiting for payment setup from our server...
            </p>
          </div>
        )}
        <div className='mt-6 text-center'>
          <Link href='/checkout/review'>
            <p className='text-vesoko_dark_blue hover:underline'>
              &larr; Back to Order Review
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

CheckoutPaymentPage.noLayout = true;
export default CheckoutPaymentPage;
