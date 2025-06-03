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
  const { cartItemsData } = useSelector((state: stateProps) => state.next);

  const { userInfo } = useSelector((state: stateProps) => state.next);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  // const [totalAmount, setTotalAmount] = useState(0);
  const [subtotalAmount, setSubtotalAmount] = useState(0); // Renamed from totalAmount for clarity
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(
    shippingOptions[0] // Default to the fastest option
  );
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

  // Calculate the total amount including subtotal, shipping, and tax
  const calculateTotal = useCallback(() => {
    const taxRate = 0.075; // 7.5% tax
    const calculatedTax = subtotalAmount * taxRate;
    return subtotalAmount + selectedShipping.price + calculatedTax;
  }, [subtotalAmount, selectedShipping.price]);

  const totalAmount = calculateTotal(); // Use the memoized total calculation

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
    cartItemsData.forEach((item: OrderItemsProps) => {
      amount += item.price * item.quantity;
      // return;
    });
    setSubtotalAmount(amount);
  }, [cartItemsData]);

  // Handle shipping option change
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedId = e.target.value;
    const option = shippingOptions.find((opt) => opt.id === selectedId);
    if (option) {
      setSelectedShipping(option);
    }
  };

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
    <div className='bg-nezeza_powder_blue min-h-screen p-4 md:p-8 flex flex-col md:flex-row gap-8'>
      <div className='md:w-1/2 p-6 bg-nezeza_light_blue shadow-lg rounded-lg order-2 md:order-1'>
        {' '}
        {/* Added width and background for summary */}
        <h2 className='text-2xl font-bold mb-4 text-nezeza_dark_blue'>
          Order Summary
        </h2>
        <div className='space-y-2 text-gray-700'>
          <p className='flex justify-between'>
            <strong>Items:</strong> <span>{cartItemsData.length}</span>
          </p>
          <p className='flex justify-between'>
            <strong>Subtotal:</strong>{' '}
            <span>
              <FormattedPrice amount={subtotalAmount} />
            </span>{' '}
          </p>
          <p className='flex justify-between'>
            <strong>Shipping:</strong>{' '}
            <span>
              <FormattedPrice amount={selectedShipping.price} />
            </span>{' '}
          </p>
          <p className='flex justify-between'>
            <strong>Tax (7.5%):</strong>{' '}
            <span>
              <FormattedPrice amount={subtotalAmount * 0.075} />
            </span>
          </p>
        </div>
        <div className='border-t border-gray-300 pt-4 mt-4'>
          <p className='text-xl font-bold flex justify-between text-nezeza_dark_blue'>
            Total:{' '}
            <span>
              <FormattedPrice amount={totalAmount} />
            </span>{' '}
          </p>
        </div>
        {/* Display each item in the summary */}
        <div className='space-y-4 mt-6 border-t pt-4 border-gray-200'>
          <h3 className='text-xl font-semibold mb-3 text-nezeza_dark_blue'>
            Your Cart Items
          </h3>{' '}
          {cartItemsData.map((item: OrderItemsProps) => (
            <div
              key={item._id}
              className='flex items-center gap-4 p-2 border rounded-md shadow-sm bg-gray-50'
            >
              <img
                src={item.image}
                alt={item.title}
                className='w-16 h-16 object-cover rounded-md flex-shrink-0'
              />
              <div className='flex-grow'>
                <p className='font-medium text-lg text-gray-800'>
                  {item.title}
                </p>
                <p className='text-sm text-gray-600'>
                  Quantity: {item.quantity}
                </p>
              </div>
              <p className='font-bold text-gray-900'>
                <FormattedPrice amount={item.quantity * item.price} />
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Payment Form & Shipping Options Section (Right Side) */}
      <div className='md:w-1/2 flex flex-col gap-8 order-1 md:order-2'>
        {/* Shipping Options */}
        <div className='p-6 bg-white shadow-lg rounded-lg'>
          <h2 className='text-2xl font-bold mb-4 text-nezeza_dark_blue'>
            Shipping Options
          </h2>
          <div className='space-y-4'>
            {shippingOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all duration-200 ${
                  selectedShipping.id === option.id
                    ? 'border-nezeza_green_600 ring-2 ring-nezeza_green_600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className='flex items-center'>
                  <input
                    type='radio'
                    name='shippingOption'
                    value={option.id}
                    checked={selectedShipping.id === option.id}
                    onChange={handleShippingChange}
                    className='form-radio h-5 w-5 text-nezeza_green_600 cursor-pointer focus:ring-nezeza_green_600'
                  />
                  <div className='ml-4'>
                    <p className='font-semibold text-lg text-gray-800'>
                      {option.name}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {option.deliveryTime}
                    </p>
                  </div>
                </div>
                <FormattedPrice
                  amount={option.price}
                  // className='font-bold text-lg text-gray-900'
                />
              </label>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div className='p-6 bg-white shadow-lg rounded-lg'>
          <h2 className='text-2xl font-bold mb-4 text-nezeza_dark_blue'>
            Payment Details
          </h2>
          {clientSecret ? (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          ) : (
            <div className='flex items-center justify-center h-48'>
              <Loading message='necessary order details' />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CheckoutPage.noLayout = true;
export default CheckoutPage;
