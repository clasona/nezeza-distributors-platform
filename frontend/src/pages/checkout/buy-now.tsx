import FormattedPrice from '@/components/FormattedPrice';
import Loading from '@/components/Loaders/Loading';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps } from '../../../type';
import { setShippingAddress } from '@/redux/nextSlice';

// Ensure Stripe key is set before loading Stripe
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Stripe publishable key is missing!');
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutBuyNowPage = () => {
  const { buyNowProduct, userInfo, shippingAddress } = useSelector((state: stateProps) => state.next);
  const dispatch = useDispatch();
  const router = useRouter();

  // Redirect to the shipping address page for proper address validation
  useEffect(() => {
    
    if (!buyNowProduct || !buyNowProduct.isBuyNow) {
      console.log('No buy now product or isBuyNow is false, redirecting to home');
      router.replace('/'); // No buy now product, redirect to home
      return;
    }

    if (!userInfo) {
      console.log('No user info, redirecting to login');
      // Not logged in, redirect to login with buy now context preserved
      router.replace('/login');
      return;
    }

    console.log('Redirecting to shipping address page');
    // Always redirect to shipping address page first to ensure proper validation
    // The address page will handle existing addresses, validate them, and proceed accordingly
    router.replace('/checkout/shipping-address');
  }, [buyNowProduct, userInfo, router]);

  // Show loading while redirecting
  return (
    <div className='bg-vesoko_primary min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <Loading message='Setting up your purchase...' />
        <p className='mt-4 text-gray-600'>Preparing your buy now checkout</p>
      </div>
    </div>
  );
};

CheckoutBuyNowPage.noLayout = true;
export default CheckoutBuyNowPage;
