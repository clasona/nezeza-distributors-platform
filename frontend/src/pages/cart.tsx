import CartPayment from '@/components/Cart/CartPayment';
import CartProduct from '@/components/Cart/CartProduct';
import ResetCart from '@/components/Cart/ResetCart';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { OrderItemsProps, stateProps } from '../../type';

const cartPage = () => {
  const { cartItemsData } = useSelector((state: stateProps) => state.next);

  return (
    <div className='mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-10 py-2 sm:py-4'>
      {cartItemsData.length > 0 ? (
        <>
          <div className='bg-white col-span-2 sm:col-span-4 p-4 rounded-lg'>
            <div
              className='flex items-center justify-between border-b-[1px]
                        border-b-gray-400 pb-1'
            >
              <p className='text-2xl font-semibold text-vesoko_dark_blue'>
                Shopping Cart
              </p>
              <p className='text-lg font-semibold text-vesoko_dark_blue'>
                Subtotal
              </p>
            </div>
            <div>
              {cartItemsData.map((item: OrderItemsProps) => (
                <div
                  key={item.product._id}
                  className='pt-2 flex flex-col gap-2'
                >
                  <CartProduct item={item} />
                </div>
              ))}
              <div className='mt-4 text-center sm:text-left'>
                <ResetCart />
              </div>
            </div>
          </div>

          <div className='bg-white p-2 sm:p-4 rounded-lg flex flex-col justify-center col-span-2 sm:col-span-1'>
            <CartPayment />
          </div>
        </>
      ) : (
        <div className='w-full col-span-2 sm:col-span-5 flex flex-col items-center justify-center py-5 rounded-lg shadow-lg'>
          <h1 className='text-lg font-medium mb-4'>Your Cart is Empty</h1>
          <button
            className='w-52 h-10 bg-vesoko_dark_blue text-white rounded-text-sm
                    font-semibold hover:bg-vesoko_green_600 hover:text-white'
            onClick={() => (window.location.href = '/')}
          >
            Go to Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default cartPage;
