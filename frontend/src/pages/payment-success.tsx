import { clearBuyNowProduct, resetCart } from '@/redux/nextSlice';
import Link from 'next/link';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps } from '../../type';

const SuccessPage = () => {
  const dispatch = useDispatch();
 const { buyNowProduct } = useSelector((state: stateProps) => state.next); // Access buyNowProduct from state

 useEffect(() => {
   if (buyNowProduct?.isBuyNow) {
     // If it was a "Buy Now" purchase, only clear the buyNowProduct state
     dispatch(clearBuyNowProduct());
     // console.log('Buy Now purchase: Only buyNowProduct cleared.');
   } else {
     // For regular cart checkout, clear the entire cart
     dispatch(resetCart());
     // console.log('Regular cart purchase: Cart cleared.');
   }
 }, [dispatch, buyNowProduct]); 

  return (
    <div className='flex flex-col flex-grow gap-2 items-center justify-center py-20 w-full'>
      <h1 className='text-3xl font-bold text-hoverBg text-nezeza_green_600'>
        🎉 Order Payment Processed Successfully!
      </h1>

      <p className='text-xl text-nezeza_gray_600'>
        Thank you for shopping with{' '}
        <span className='text-nezeza_dark_blue font-semibold'>Nezeza</span>!
      </p>
      <Link
        href='/'
        className='mt-4 px-6 py-3 bg-nezeza_dark_blue text-white text-lg font-medium rounded-md shadow-md hover:bg-nezeza_green_600 hover:shadow-lg transition duration-300'
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default SuccessPage;
