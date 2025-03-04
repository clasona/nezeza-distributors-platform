import { resetCart } from '@/redux/nextSlice';
import Link from 'next/link';
import { useDispatch } from 'react-redux';

const SuccessPage = () => {
  const dispatch = useDispatch();

  dispatch(resetCart()); // Clear the cart

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
        // onClick={() => dispatch(resetCart())}
        className='mt-4 px-6 py-3 bg-nezeza_dark_blue text-white text-lg font-medium rounded-md shadow-md hover:bg-nezeza_green_600 hover:shadow-lg transition duration-300'
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default SuccessPage;
