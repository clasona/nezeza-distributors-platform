import CartPayment from '@/components/Cart/CartPayment';
import CartProduct from '@/components/Cart/CartProduct';
import ResetCart from '@/components/Cart/ResetCart';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { OrderItemsProps, stateProps } from '../../type';

const cartPage = () => {
  const { cartItemsData } = useSelector((state: stateProps) => state.next);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <Link href='/' className='inline-flex items-center text-vesoko_dark_blue hover:text-vesoko_green_600 transition-colors duration-200 mb-4'>
            <ArrowLeft className='h-5 w-5 mr-2' />
            Continue Shopping
          </Link>
          <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-vesoko_dark_blue rounded-lg'>
              <ShoppingCart className='h-6 w-6 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900'>Shopping Cart</h1>
          </div>
          <p className='text-gray-600'>Review your items and proceed to checkout</p>
        </div>

        {cartItemsData.length > 0 ? (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Cart Items */}
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Cart Items ({cartItemsData.length})
                    </h2>
                    <p className='text-sm text-gray-500'>Subtotal</p>
                  </div>
                </div>
                <div className='divide-y divide-gray-200'>
                  {cartItemsData.map((item: OrderItemsProps) => (
                    <div key={item.product._id} className='p-6'>
                      <CartProduct item={item} />
                    </div>
                  ))}
                </div>
                <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
                  <ResetCart />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className='lg:col-span-1'>
              <div className='sticky top-8'>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                  <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
                    <h2 className='text-xl font-semibold text-gray-900'>Order Summary</h2>
                  </div>
                  <div className='p-6'>
                    <CartPayment />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='max-w-md mx-auto'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center'>
              <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
                <Package className='h-12 w-12 text-gray-400' />
              </div>
              <h2 className='text-2xl font-semibold text-gray-900 mb-3'>Your cart is empty</h2>
              <p className='text-gray-600 mb-8'>Looks like you haven't added any items to your cart yet. Start shopping to fill it up!</p>
              <Link
                href='/'
                className='inline-flex items-center justify-center w-full px-6 py-3 bg-vesoko_dark_blue text-white font-semibold rounded-lg hover:bg-vesoko_green_600 transition-colors duration-200'
              >
                <ShoppingCart className='h-5 w-5 mr-2' />
                Start Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default cartPage;
