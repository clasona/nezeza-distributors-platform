import { clearCart } from '@/utils/cart/clearCart';
import { clearBuyNowProduct, resetCart } from '@/redux/nextSlice';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { stateProps } from '../../type';
import { useSession } from 'next-auth/react';
import { getSellerTypeBaseurl } from '@/lib/utils';
import { CheckCircle, Package, Truck, Calendar } from 'lucide-react';

const SuccessPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();
  const { buyNowProduct } = useSelector((state: stateProps) => state.next);
  const [loading, setLoading] = useState(true);

  // Function to get the correct order details URL based on user type
  const getOrderDetailsUrl = () => {
    if (!session?.user) {
      return '/customer/orders'; // Default fallback
    }

    const user = session.user;
    
    // If user has no storeId, they are a customer
    if (!user.storeId) {
      return '/customer/orders';
    }

    // If user has storeId, route based on store type
    const storeType = user.storeId.storeType;
    const baseUrl = getSellerTypeBaseurl(storeType);
    
    if (baseUrl) {
      return `/${baseUrl}/orders/my-orders`;
    }
    
    // Fallback to customer orders if store type is unknown
    return '/customer/orders';
  };

  useEffect(() => {
    const processSuccessfulPayment = async () => {
      // Clear cart/buy-now state immediately
      try {
        await clearCart();
        if (buyNowProduct?.isBuyNow) {
          dispatch(clearBuyNowProduct());
        } else {
          dispatch(resetCart());
        }
        console.log('✅ Cart cleared successfully');
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
      
      // Just show success after clearing cart
      setLoading(false);
    };

    if (router.isReady) {
      processSuccessfulPayment();
    }
  }, [dispatch, buyNowProduct, router.isReady]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        {/* Success Header */}
        <div className='text-center mb-8'>
          <div className='flex justify-center mb-4'>
            <div className='rounded-full bg-vesoko_green_100 p-3'>
              <CheckCircle className='h-16 w-16 text-green-600' />
            </div>
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            Payment Successful!
          </h1>
          <p className='text-xl text-gray-600'>
            Thank you for your order. We're processing it now.
          </p>
        </div>

        {/* Order Details Card */}
        <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
          <div className='border-b border-gray-200 pb-6 mb-6'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>Payment Successful!</h2>
            <p className='text-gray-600'>
              Your payment has been processed successfully. We're creating your order now and you'll receive a confirmation email shortly.
            </p>
          </div>

          {/* Next Steps */}
          {/* <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='text-center p-4'>
              <div className='bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center'>
                <Package className='h-8 w-8 text-blue-600' />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>Order Processing</h3>
              <p className='text-sm text-gray-600'>
                Your order is being prepared for shipment
              </p>
            </div>
            <div className='text-center p-4'>
              <div className='bg-orange-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center'>
                <Truck className='h-8 w-8 text-orange-600' />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>Shipping</h3>
              <p className='text-sm text-gray-600'>
                You'll get tracking info once it ships
              </p>
            </div>
            <div className='text-center p-4'>
              <div className='bg-vesoko_green_100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center'>
                <Calendar className='h-8 w-8 text-green-600' />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>Delivery</h3>
              <p className='text-sm text-gray-600'>
                Expected within 5-7 business days
              </p>
            </div>
          </div> */}

          {/* Email Confirmation Notice */}
          {/* <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <CheckCircle className='h-5 w-5 text-blue-400' />
              </div>
              <div className='ml-3'>
                <p className='text-sm text-blue-700'>
                  <strong>Confirmation email coming soon!</strong> Check your inbox in a few minutes for order details and tracking information.
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href={getOrderDetailsUrl()}
            className='inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-vesoko_primary hover:bg-vesoko_primary transition-colors duration-200 shadow-lg hover:shadow-xl'
          >
            View My Orders
          </Link>
          <Link
            href='/'
            className='inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl'
          >
            Continue Shopping
          </Link>
        </div>

        {/* Support Section */}
        <div className='mt-12 text-center'>
          <p className='text-gray-600 mb-4'>
            Need help with your order?
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center text-sm'>
            <Link
              href='mailto:marketplace@vesoko.com'
              className='text-vesoko_primary hover:text-vesoko_primary font-medium'
            >
              📧 marketplace@vesoko.com
            </Link>
            <span className='hidden sm:inline text-gray-400'>|</span>
            <Link
              href='tel:+1234567890'
              className='text-vesoko_primary hover:text-vesoko_primary font-medium'
            >
              📞 (123) 456-7890
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

SuccessPage.noLayout = true;
export default SuccessPage;
