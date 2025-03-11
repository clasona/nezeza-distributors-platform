import { SiMediamarkt } from 'react-icons/si';
import FormattedPrice from '../FormattedPrice';
import { useDispatch, useSelector } from 'react-redux';
import { OrderItemsProps, StoreProduct, stateProps } from '../../../type';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { setCartItems } from '@/redux/nextSlice';
import { useRouter } from 'next/router';
import ErrorMessageModal from '../ErrorMessageModal';
import { getCart } from '@/utils/cart/getCart';
import { mergeCartItems } from '@/utils/cart/mergeCartItems';
import { handleError } from '@/utils/errorUtils';

const CartPayment = () => {
  const { cartItemsData, userInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const [totalAmount, setTotalAmount] = useState(0);
  const dispatch = useDispatch();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let amount = 0;
    cartItemsData.map((item: StoreProduct) => {
      amount += item.price * item.quantity;
      return;
    });
    setTotalAmount(amount);
  }, [cartItemsData]);
  //Stripe payment
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  const handleCheckout = async () => {
    try {
      //  const serverCartItems = await getCart(); // Get cart from server
      // const mergedCartItems = mergeCartItems(cartItemsData, serverCartItems);

      const filteredCartItems = cartItemsData.filter(
        (item: OrderItemsProps) => item.product.quantity > 0
      );
      dispatch(setCartItems(filteredCartItems));
      router.push('/checkout');
    } catch (error: any) {
      // setErrorMessage('Error redirecting to checkout. Please try again.');
      // setTimeout(() => setErrorMessage(''), 4000);
      handleError(error);
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex gap-2'>
        <span
          className='bg-nezeza_green_600  rounded-full p-1 h-6 w-6 text-sm
                 text-white flex items-center justify-center mt-1'
        >
          <SiMediamarkt />
        </span>
        <p className='text-sm'>
          Your order qualifies for FREE Shipping. Continue for more details
        </p>
      </div>
      <p className='flex items-center justify-between px-2 font-semibold'>
        Total Price:{' '}
        <span className='font-bold text-xl'>
          <FormattedPrice amount={totalAmount} />
        </span>
      </p>

      <div className='flex flex-col items-center text-center justify-center'>
        <button
          onClick={handleCheckout}
          className={`w-full p-2 text-sm font-semibold bg-nezeza_green_600 text-white rounded-lg hover:bg-nezeza_green_800 hover:text-white duration-300 ${
            !userInfo ? 'pointer-events-none bg-nezeza_gray_600' : ''
          }`}
        >
          Proceed to Checkout
        </button>

        {!userInfo && (
          <p className='text-xs mt-1 text-nezeza_red_600 font-semibold animate-bounce'>
            Please Login to Continue
          </p>
        )}
      </div>
      {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
    </div>
  );
};

export default CartPayment;
