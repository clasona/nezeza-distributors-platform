import FormattedPrice from '@/components/FormattedPrice';
import Loading from '@/components/Loaders/Loading';
import CheckoutForm from '@/components/Payments/CheckoutForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OrderItemsProps, stateProps } from '../../../type';

// Ensure Stripe key is set before loading Stripe
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Stripe publishable key is missing!');
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// --- Define Shipping Options ---
interface ShippingOption {
  id: string;
  name: string;
  deliveryTime: string;
  price: number;
}

const shippingOptions: ShippingOption[] = [
  {
    id: 'express',
    name: 'Express Shipping',
    deliveryTime: '1-2 business days',
    price: 15.0,
  },
  {
    id: 'standard',
    name: 'Standard Shipping',
    deliveryTime: '3-5 business days',
    price: 7.0,
  },
  {
    id: 'economy',
    name: 'Economy Shipping',
    deliveryTime: '7-10 business days',
    price: 3.0,
  },
];

const CheckoutPage = () => {
  const { cartItemsData, shippingAddress } = useSelector((state: stateProps) => state.next);
  const router = useRouter();

  // Redirect to the shipping address page for proper address validation
  useEffect(() => {
    if (cartItemsData.length === 0) {
      router.replace('/');
      return;
    }
    
    // Always redirect to shipping address page first to ensure proper validation
    // The address page will handle existing addresses and validate them
    router.replace('/checkout/shipping-address');
  }, [cartItemsData, router]);


  // Show loading while redirecting
  return (
    <div className='bg-vesoko_powder_blue min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <Loading message='Redirecting to checkout...' />
        <p className='mt-4 text-gray-600'>Taking you to the new checkout experience</p>
      </div>
    </div>
  );
};

CheckoutPage.noLayout = true;
export default CheckoutPage;
