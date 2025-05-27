import FormattedPrice from '@/components/FormattedPrice';
import Loading from '@/components/Loaders/Loading';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps } from '../../../type';
import CheckoutForm from '../../components/Payments/CheckoutForm';

// Ensure Stripe key is set before loading Stripe
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Stripe publishable key is missing!');
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutBuyNowPage = () => {
  const { buyNowProduct } = useSelector(
    (state: stateProps) => state.next
  );

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const router = useRouter();
  const [loadingOrderCreation, setLoadingOrderCreation] = useState(true); // New state for order creation loading

  let clientSecret = '';
  if (router.query.clientSecret) {
    clientSecret = router.query.clientSecret.toString();
    // setLoading(false);
  } else {
    console.log(
      'No client secret found in the parameters. Check CartPayment.tsx file.'
    );
  }

  // If buyNowProduct is null, redirect or show message
  useEffect(() => {
    if (!buyNowProduct) {
      router.push('/'); // Redirect to home or products page if no buy now product
      return;
    }

    // Calculate total for the single buy now product
    const calculatedAmount =
      buyNowProduct.product.price * buyNowProduct.quantity;
    setTotalAmount(calculatedAmount);
  }, [buyNowProduct, router, dispatch]); // Depend on buyNowProduct, router, and userInfo

  // Memoize options to prevent unnecessary re-renders
  const options = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            // customerSessionClientSecret: customerSessionSecret ?? undefined, //to allow saving payment methods
            // mode: 'payment',
            // amount: 1099,
            // currency: 'usd',
            appearance: {
              // theme: 'stripe',
              /* Customize appearance here */
            },
            return_url: `${window.location.origin}/payment-status`,
          }
        : undefined,
    [clientSecret]
  );

  if (!buyNowProduct) {
    // This will be shown briefly before redirecting by useEffect
    return (
      <div className='bg-nezeza_powder_blue flex flex-col gap-2 justify-center items-center h-screen'>
        <p className=' text-center text-lg font-semibold'>
          No product selected for direct purchase.
        </p>
        <Link
          href='/'
          className='px-6 py-3 bg-nezeza_dark_blue text-white text-lg font-medium rounded-md shadow-md hover:bg-nezeza_green_600 hover:shadow-lg transition duration-300'
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Display loading while order is being created or client secret is fetched
  if (!clientSecret) {
    return (
      <div className='bg-nezeza_powder_blue min-h-screen flex items-center justify-center'>
        <Loading message='your order details...' />
      </div>
    );
  }

  return (
    <div className='bg-nezeza_powder_blue min-h-screen p-8 flex flex-col md:flex-row'>
      <div className='md:w-1/2 p-8 bg-nezeza_light_blue shadow-lg rounded-lg '>
        <h2 className='text-2xl font-bold mb-4'>Order Summary</h2>
        <div className='space-y-2'>
          <p>
            <strong>Item:</strong> {buyNowProduct.product.title}
          </p>
          <p>
            <strong>Quantity:</strong> {buyNowProduct.quantity}
          </p>
          <p>
            <strong>Price per unit:</strong>{' '}
            <FormattedPrice amount={buyNowProduct.product.price} />
          </p>
          <p>
            <strong>Subtotal:</strong> <FormattedPrice amount={totalAmount} />
          </p>
          <p>
            <strong>Shipping:</strong> <FormattedPrice amount={5.0} />{' '}
            {/* Use actual shipping fee */}
          </p>
          <p>
            <strong>Tax:</strong> <FormattedPrice amount={7.5} />{' '}
            {/* Use actual tax calculation */}
          </p>
        </div>
        <div className='border-t border-gray-300 pt-4 mt-4'>
          <p className='text-xl font-bold'>
            Total: <FormattedPrice amount={totalAmount + 5.0 + 7.5} />
          </p>
        </div>
        {/* Display the single item in the summary */}
        <div className='space-y-4 mt-4'>
          <div
            key={buyNowProduct.product._id}
            className='flex items-center gap-4 border-b pb-2'
          >
            <img
              src={buyNowProduct.product.image}
              alt={buyNowProduct.product.title}
              className='w-12 h-12 object-cover rounded'
            />
            <p className='font-medium'>{buyNowProduct.product.title}</p>
            <p className='text-sm text-gray-600'>
              {buyNowProduct.quantity} x{' '}
              <FormattedPrice amount={buyNowProduct.product.price} /> ={' '}
              <FormattedPrice
                amount={buyNowProduct.quantity * buyNowProduct.product.price}
              />
            </p>
          </div>
        </div>
      </div>
      <div className='md:w-1/2'>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      </div>
    </div>
  );
};

CheckoutBuyNowPage.noLayout = true;
export default CheckoutBuyNowPage;
