import FormattedPrice from '@/components/FormattedPrice';
import Loading from '@/components/Loaders/Loading';
import { addPayment } from '@/redux/nextSlice';
import { createOrder } from '@/utils/order/createOrder';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OrderItemsProps, stateProps } from '../../type';
import CheckoutForm from '../components/Payments/CheckoutForm';
import { handleError } from '@/utils/errorUtils';
import { useRouter } from 'next/router';

// Ensure Stripe key is set before loading Stripe
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Stripe publishable key is missing!');
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutPage = () => {
  const { cartItemsData } = useSelector((state: stateProps) => state.next);
  // const [clientSecret, setClientSecret] = useState<string | null>(null);
  // const [paymentIntentFetched, setPaymentIntentFetched] = useState(false); // To help prevent fetching it twice as useEffect does automatically

  const [customerSessionSecret, setCustomerSessionSecret] = useState<
    string | null
  >(null);
  const { userInfo } = useSelector((state: stateProps) => state.next);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const router = useRouter();
  let clientSecret = '';
  if (router.query.clientSecret) {
    clientSecret = router.query.clientSecret.toString();
    // setLoading(false);
  } else {
    console.log(
      'No client secret found in the parameters. Check CartPayment.tsx file.'
    );
  }

  //This function is the one that calls create order from the backend
  // const fetchPaymentIntent = async () => {
  //   if (!cartItemsData.length || paymentIntentFetched) return;

  //   try {
  //     const response = await createOrder(cartItemsData);
  //     if (response.status !== 201) {
  //       console.error('Error fetching client secret.');
  //       // setSuccessMessage(''); // Clear any previous error message
  //       // setErrorMessage(response.data.msg || 'Client secret fetch failed.');
  //     } else {
  //       setClientSecret(response.data.clientSecret);
  //       console.log('printing secret...', clientSecret)
  //       setPaymentIntentFetched(true); // Set the flag to true after fetching
  //     }
  //   } catch (error: any) {
  //     handleError(error);
  //     //  setErrorMessage(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (cartItemsData.length > 0) {
  //     fetchPaymentIntent();
  //   }
  // }, [cartItemsData]);

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

  useEffect(() => {
    let amount = 0;
    cartItemsData.map((item: OrderItemsProps) => {
      amount += item.price * item.quantity;
      return;
    });
    setTotalAmount(amount);
  }, [cartItemsData]);

  if (!cartItemsData.length)
    return (
      <div className='bg-nezeza_powder_blue flex flex-col gap-2 justify-center items-center h-screen'>
        <p className=' text-center text-lg font-semibold'>
          No items in the cart.
        </p>
        <Link
          href='/'
          className='px-6 py-3 bg-nezeza_dark_blue text-white text-lg font-medium rounded-md shadow-md hover:bg-nezeza_green_600 hover:shadow-lg transition duration-300'
        >
          Continue Shopping
        </Link>
      </div>
    );
  return (
    <div className='bg-nezeza_powder_blue min-h-screen p-8 flex flex-col md:flex-row'>
      {' '}
      <div className='md:w-1/2 p-8 bg-nezeza_light_blue shadow-lg rounded-lg '>
        {' '}
        {/* Added width and background for summary */}
        <h2 className='text-2xl font-bold mb-4'>Order Summary</h2>
        <div className='space-y-2'>
          <p>
            <strong>Items:</strong> {cartItemsData.length}
          </p>
          <p>
            <strong>Subtotal:</strong> <FormattedPrice amount={totalAmount} />
          </p>
          <p>
            <strong>Shipping:</strong> $5.00
          </p>
          <p>
            <strong>Tax:</strong> $7.50
          </p>
        </div>
        <div className='border-t border-gray-300 pt-4 mt-4'>
          <p className='text-xl font-bold'>
            Total: <FormattedPrice amount={totalAmount + 5.0 + 7.5} />
          </p>
        </div>
        {/* Display each item in the summary */}
        <div className='space-y-4 mt-4'>
          {cartItemsData.map((item: OrderItemsProps) => (
            <div
              key={item._id}
              className='flex items-center gap-4 border-b pb-2'
            >
              <img
                src={item.image}
                alt={item.title}
                className='w-12 h-12 object-cover rounded'
              />
              <p className='font-medium'>{item.title}</p>
              <p className='text-sm text-gray-600'>
                {item.quantity} x <FormattedPrice amount={item.price} /> ={' '}
                <FormattedPrice amount={item.quantity * item.price} />
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Added flex for layout */}
      <div className='md:w-1/2'>
        {' '}
        {/* Added width for form on larger screens */}
        {clientSecret ? (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        ) : (
          <p className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  text-center'>
            <Loading message='necessary order details' />
          </p>
        )}
      </div>
    </div>
  );
};

CheckoutPage.noLayout = true;
export default CheckoutPage;
