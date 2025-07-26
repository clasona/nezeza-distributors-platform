import { clearBuyNowProduct, resetCart } from '@/redux/nextSlice';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { getOrderByPaymentIntentId } from '@/utils/order/getOrderByPaymentIntentId';
import { stateProps, OrderProps } from '../../type';
import { useSession } from 'next-auth/react';
import { getSellerTypeBaseurl } from '@/lib/utils';

const SuccessPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();
  const { buyNowProduct } = useSelector((state: stateProps) => state.next);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');
  const [order, setOrder] = useState<OrderProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState('Processing your order...');

  // Function to get the correct order details URL based on user type
  const getOrderDetailsUrl = () => {
    if (!session?.user) {
      return '/customer/orders'; // Default fallback
    }

    const user = session.user;
    
    // If user has no storeId, they are a customer
    if (!user.storeId) {
      return order ? `/customer/order/${order._id}` : '/customer/orders';
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
    const fetchOrderDetails = async () => {
      const { payment_intent_id } = router.query;
      
      if (payment_intent_id && typeof payment_intent_id === 'string') {
        try {
          setLoading(true);
          // Fetch actual order details using payment intent ID
          const orderData = await getOrderByPaymentIntentId(payment_intent_id);
          setOrder(orderData);
          setOrderNumber(orderData._id);
          
          // Calculate estimated delivery based on order creation date + 5-7 business days
          const deliveryDate = new Date(orderData.createdAt);
          deliveryDate.setDate(deliveryDate.getDate() + 5);
          setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }));
        } catch (err: any) {
          console.error('Error fetching order details:', err);
          setError('Failed to load order details');
          // Fallback to generated order number if API fails
          const orderNum = `VK-${Date.now().toString().slice(-8)}`;
          setOrderNumber(orderNum);
          
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + 5);
          setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }));
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback if no payment intent ID in URL
        const orderNum = `VK-${Date.now().toString().slice(-8)}`;
        setOrderNumber(orderNum);
        
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
        setLoading(false);
      }
    };

    fetchOrderDetails();

    // Clean up Redux state
    if (buyNowProduct?.isBuyNow) {
      dispatch(clearBuyNowProduct());
    } else {
      dispatch(resetCart());
    }
  }, [dispatch, buyNowProduct, router.query]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-vesoko_powder_blue via-white to-vesoko_light_blue flex items-center justify-center px-4 py-8'>
        <div className='max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-8'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-vesoko_dark_blue mx-auto mb-4'></div>
            <p className='text-lg font-medium text-gray-700'>{loadingMessage}</p>
            <p className='text-sm text-gray-500 mt-2'>This may take a few moments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-vesoko_powder_blue via-white to-vesoko_light_blue flex items-center justify-center px-4 py-8'>
        <div className='max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-8'>
          <div className='text-center'>
            <div className='text-red-500 text-6xl mb-4'>⚠️</div>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>Unable to Load Order Details</h2>
            <p className='text-gray-600 mb-6'>{error}</p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href={getOrderDetailsUrl()}
                className='flex items-center justify-center px-6 py-3 bg-vesoko_dark_blue text-white font-semibold rounded-lg hover:bg-opacity-90 transition duration-300 shadow-md'
              >
                View Order Details
              </Link>
              <Link
                href='/'
                className='flex items-center justify-center px-6 py-3 bg-white text-vesoko_dark_blue border-2 border-vesoko_dark_blue font-semibold rounded-lg hover:bg-vesoko_dark_blue hover:text-white transition duration-300'
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-vesoko_powder_blue via-white to-vesoko_light_blue flex items-center justify-center px-4 py-8'>
      <div className='max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden'>
        <div className='bg-gradient-to-r from-vesoko_green_600 to-green-500 px-8 py-12 text-center text-white relative'>
          <div className='mb-6'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full backdrop-blur-sm'>
              <svg className='w-12 h-12 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
              </svg>
            </div>
          </div>
          <h1 className='text-4xl font-bold mb-4'>Payment Successful!</h1>
          <p className='text-xl opacity-90'>Your order has been confirmed and is being processed.</p>
          <div className='absolute top-4 left-4 w-12 h-12 border-2 border-white border-opacity-20 rounded-full'></div>
          <div className='absolute bottom-4 right-4 w-8 h-8 border-2 border-white border-opacity-20 rounded-full'></div>
        </div>
        
        <div className='px-8 py-8'>
          <div className='mb-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-sm font-medium text-gray-500 mb-1'>Order Number</h3>
                <p className='text-xl font-bold text-vesoko_dark_blue'>{orderNumber}</p>
              </div>
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-sm font-medium text-gray-500 mb-1'>Estimated Delivery</h3>
                <p className='text-lg font-semibold text-gray-800'>{estimatedDelivery}</p>
              </div>
            </div>
          </div>

          <div className='mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100'>
            <h3 className='text-lg font-semibold text-vesoko_dark_blue mb-4 flex items-center'>
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              What happens next?
            </h3>
            <ul className='space-y-3 text-gray-700'>
              <li className='flex items-start'>
                <span className='flex-shrink-0 w-6 h-6 bg-vesoko_green_600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5'>1</span>
                <span>You'll receive an email confirmation with your order details</span>
              </li>
              <li className='flex items-start'>
                <span className='flex-shrink-0 w-6 h-6 bg-vesoko_green_600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5'>2</span>
                <span>We'll notify you when your order is being prepared</span>
              </li>
              <li className='flex items-start'>
                <span className='flex-shrink-0 w-6 h-6 bg-vesoko_green_600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5'>3</span>
                <span>Track your package with the tracking number we'll send you</span>
              </li>
            </ul>
          </div>

          <div className='text-center mb-8'>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
              Thank you for choosing <span className='text-vesoko_dark_blue'>VeSoko</span>
            </h2>
            <p className='text-gray-600'>We appreciate your business and hope you love your purchase.</p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href={getOrderDetailsUrl()}
              className='flex items-center justify-center px-6 py-3 bg-vesoko_dark_blue text-white font-semibold rounded-lg hover:bg-opacity-90 transition duration-300 shadow-md'
            >
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
              View Order Details
            </Link>
            <Link
              href='/'
              className='flex items-center justify-center px-6 py-3 bg-white text-vesoko_dark_blue border-2 border-vesoko_dark_blue font-semibold rounded-lg hover:bg-vesoko_dark_blue hover:text-white transition duration-300'
            >
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
