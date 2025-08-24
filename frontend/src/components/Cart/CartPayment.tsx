import { setCartItems, setShippingAddress } from '@/redux/nextSlice';
import { handleError } from '@/utils/errorUtils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SiMediamarkt } from 'react-icons/si';
import { useDispatch, useSelector } from 'react-redux';
import { OrderItemsProps, stateProps } from '../../../type';
import ErrorMessageModal from '../ErrorMessageModal';
import SuccessMessageModal from '../SuccessMessageModal';
import FormattedPrice from '../FormattedPrice';

const CartPayment = () => {
  const { cartItemsData, userInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const [totalAmount, setTotalAmount] = useState(0);
  const [qualifiesForFreeShipping, setQualifiesForFreeShipping] = useState(false);
  const [freeShippingThreshold] = useState(50); // Set your free shipping threshold
  const dispatch = useDispatch();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  // let clientSecret = '';

  useEffect(() => {
    let amount = 0;
    let hasEligibleProducts = false;
    
    cartItemsData.map((item: OrderItemsProps) => {
      amount += item.price * item.quantity;
      
      // Check if any products qualify for free shipping
      // You can customize this logic based on your business rules
      if (item.product && (
        item.product.freeShipping  // Product has free shipping flag
        // item.product.price >= 25 || // Products over $25 qualify
        // item.product.category === 'electronics' // Certain categories qualify
      )) {
        hasEligibleProducts = true;
      }
      return;
    });
    
    setTotalAmount(amount);
    
    // Order qualifies for free shipping if:
    // 1. Total amount meets threshold AND has eligible products
    // Only show free shipping message when both conditions are met
    setQualifiesForFreeShipping(
      amount >= freeShippingThreshold && hasEligibleProducts
    );
  }, [cartItemsData, freeShippingThreshold]);

  const handleCheckout = () => {
    try {
      const filteredCartItems = cartItemsData.filter(
        (item: OrderItemsProps) => item.product.quantity > 0
      );
      dispatch(setCartItems(filteredCartItems));

      if (!userInfo) {
        // Not logged in - redirect to login
        router.push('/login?redirect=/cart');
        return;
      }

      // Check if user has a complete shipping address
      const userHasCompleteAddress =
        userInfo &&
        userInfo.address &&
        userInfo.address.name &&
        userInfo.address.street1 &&
        userInfo.address.street2 && 
        userInfo.address.city &&
        userInfo.address.state &&
        userInfo.address.zip &&
        userInfo.address.country;


      // Always redirect to shipping address page first for proper validation
      // The shipping address page will handle existing addresses and validate them
      if (userHasCompleteAddress) {
        dispatch(setShippingAddress(userInfo.address));
        // console the shipping address for debugging
        console.log('Shipping Address:', userInfo.address);
      }

      //update the cartitems ins redux
      dispatch(setCartItems(filteredCartItems)); 
      console.log('Proceeding to checkout with items:', filteredCartItems);
      
      setSuccessMessage('Preparing checkout...');
      setTimeout(() => {
        router.push('/checkout/shipping-address');
      }, 800);
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error || 'An error occurred');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  return (
    <div className='flex flex-col gap-4 p-2 sm:p-4'>
      {/* {qualifiesForFreeShipping && (
        <div className='flex gap-2 items-start'>
          <span
            className='bg-vesoko_primary rounded-full p-1 h-6 w-6 text-sm
                   text-white flex items-center justify-center mt-1'
          >
            <SiMediamarkt />
          </span>
          <p className='text-xs sm:text-sm'>
            🎉 Your order qualifies for FREE Shipping! Continue for more details
          </p>
        </div>
      )} */}
      
      {/* {!qualifiesForFreeShipping && totalAmount > 0 && (
        <div className='flex gap-2 items-start'>
          <span
            className='bg-amber-500 rounded-full p-1 h-6 w-6 text-sm
                   text-white flex items-center justify-center mt-1'
          >
            🚚
          </span>
          <p className='text-xs sm:text-sm text-gray-600'>
            Add <FormattedPrice amount={freeShippingThreshold - totalAmount} /> more to qualify for FREE shipping
            {totalAmount < freeShippingThreshold && (
              <span className='text-vesoko_primary font-semibold'> (${freeShippingThreshold} minimum)</span>
            )}
          </p>
        </div>
      )} */}
      <p className='flex flex-col sm:flex-row items-center justify-between px-2 font-semibold'>
        Total Price:{' '}
        <span className='font-bold text-lg sm:text-xl'>
          <FormattedPrice amount={totalAmount} />
        </span>
      </p>

      <div className='flex flex-col items-center text-center justify-center'>
        <button
          onClick={handleCheckout}
          className={`w-full sm:w-auto p-2 text-sm font-semibold bg-vesoko_primary text-white rounded-lg hover:bg-vesoko_secondary hover:text-white duration-300`}
        >
          {!userInfo ? 'Login to Continue' : 'Review & Choose Shipping'}
        </button>

        {!userInfo && (
          <p className='text-xs mt-1 text-vesoko_red_600 font-semibold animate-bounce'>
            Please Login to Continue
          </p>
        )}
      </div>
      {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
      {successMessage && <SuccessMessageModal successMessage={successMessage} />}
    </div>
  );
};

export default CartPayment;
