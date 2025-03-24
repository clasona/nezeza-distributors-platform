import { setCartItems } from '@/redux/nextSlice';
import { handleError } from '@/utils/errorUtils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SiMediamarkt } from 'react-icons/si';
import { useDispatch, useSelector } from 'react-redux';
import { OrderItemsProps, StoreProduct, stateProps } from '../../../type';
import ErrorMessageModal from '../ErrorMessageModal';
import FormattedPrice from '../FormattedPrice';
import { createOrder } from '@/utils/order/createOrder';

const CartPayment = () => {
  const { cartItemsData, userInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const [totalAmount, setTotalAmount] = useState(0);
  const dispatch = useDispatch();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');
  let clientSecret = '';

  useEffect(() => {
    let amount = 0;
    cartItemsData.map((item: StoreProduct) => {
      amount += item.price * item.quantity;
      return;
    });
    setTotalAmount(amount);
  }, [cartItemsData]);

  const handleCreateOrder = async () => {
    if (!cartItemsData.length) return;

    try {
      const response = await createOrder(cartItemsData);
      if (response.status !== 201) {
        console.error('Error fetching client secret.');
        // setSuccessMessage(''); // Clear any previous error message
        // setErrorMessage(response.data.msg || 'Client secret fetch failed.');
      } else {
        clientSecret = response.data.clientSecret;
        // setPaymentIntentFetched(true); // Set the flag to true after fetching
      }
    } catch (error: any) {
      handleError(error);
      //  setErrorMessage(error);
    }
  };

  const handleCheckout = async () => {
    await handleCreateOrder(); //returns client secret
    try {
      //  const serverCartItems = await getCart(); // Get cart from server
      // const mergedCartItems = mergeCartItems(cartItemsData, serverCartItems);

      const filteredCartItems = cartItemsData.filter(
        (item: OrderItemsProps) => item.product.quantity > 0
      );
      console.log(filteredCartItems);
      dispatch(setCartItems(filteredCartItems));
      if (clientSecret) {
        router.push(
          {
            pathname: '/checkout',
            query: { clientSecret: clientSecret },
          },
          '/checkout'
        );
      } else {
        console.log('No client secret found.');
      }
    } catch (error: any) {
      // setErrorMessage('Error redirecting to checkout. Please try again.');
      // setTimeout(() => setErrorMessage(''), 4000);
      handleError(error);
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  return (
    <div className='flex flex-col gap-4 p-2 sm:p-4'>
      <div className='flex gap-2 items-start'>
        <span
          className='bg-nezeza_green_600 rounded-full p-1 h-6 w-6 text-sm
                 text-white flex items-center justify-center mt-1'
        >
          <SiMediamarkt />
        </span>
        <p className='text-xs sm:text-sm'>
          Your order qualifies for FREE Shipping. Continue for more details
        </p>
      </div>
      <p className='flex flex-col sm:flex-row items-center justify-between px-2 font-semibold'>
        Total Price:{' '}
        <span className='font-bold text-lg sm:text-xl'>
          <FormattedPrice amount={totalAmount} />
        </span>
      </p>

      <div className='flex flex-col items-center text-center justify-center'>
        <button
          onClick={handleCheckout}
          className={`w-full sm:w-auto p-2 text-sm font-semibold bg-nezeza_green_600 text-white rounded-lg hover:bg-nezeza_green_800 hover:text-white duration-300 ${
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
