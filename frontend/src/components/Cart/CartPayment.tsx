import { setCartItems, setShippingAddress } from '@/redux/nextSlice';
import { handleError } from '@/utils/errorUtils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SiMediamarkt } from 'react-icons/si';
import { useDispatch, useSelector } from 'react-redux';
import { OrderItemsProps, StoreProduct, stateProps } from '../../../type';
import ErrorMessageModal from '../ErrorMessageModal';
import FormattedPrice from '../FormattedPrice';

const CartPayment = () => {
  const { cartItemsData, userInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const [totalAmount, setTotalAmount] = useState(0);
  const dispatch = useDispatch();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');
  // let clientSecret = '';

  useEffect(() => {
    let amount = 0;
    cartItemsData.map((item: StoreProduct) => {
      amount += item.price * item.quantity;
      return;
    });
    setTotalAmount(amount);
  }, [cartItemsData]);

  const handleCheckout = () => {
    try {
      const filteredCartItems = cartItemsData.filter(
        (item: OrderItemsProps) => item.product.quantity > 0
      );
      dispatch(setCartItems(filteredCartItems));

      // Check if user has an address
      const userHasAddress =
        userInfo &&
        (userInfo.address ||
          (userInfo.addresses && userInfo.addresses.length > 0));

      if (!userInfo) {
        // Not logged in
        return;
      }

      if (userHasAddress) {
        dispatch(setShippingAddress(userInfo.address));
        setTimeout(() => {
          router.push('/checkout/review');
        }, 1200);
      } else {
        router.push('/checkout/shipping-address');
      }
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  return (
    <div className='flex flex-col gap-4 p-2 sm:p-4'>
      <div className='flex gap-2 items-start'>
        <span
          className='bg-vesoko_green_600 rounded-full p-1 h-6 w-6 text-sm
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
          className={`w-full sm:w-auto p-2 text-sm font-semibold bg-vesoko_green_600 text-white rounded-lg hover:bg-vesoko_green_800 hover:text-white duration-300 ${
            !userInfo ? ' cursor-not-allowed bg-vesoko_gray_600 opacity-50' : ''
          }`}
        >
          Proceed to Review & Checkout
        </button>

        {!userInfo && (
          <p className='text-xs mt-1 text-vesoko_red_600 font-semibold animate-bounce'>
            Please Login to Continue
          </p>
        )}
      </div>
      {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
    </div>
  );
};

export default CartPayment;
