import { clearCart } from '@/utils/cart/clearCart';
import { clearBuyNowProduct, resetCart } from '@/redux/nextSlice';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { getOrderByPaymentIntentId } from '@/utils/order/getOrderByPaymentIntentId';
import { stateProps, OrderProps } from '../../type';
import { useSession } from 'next-auth/react';
import { getSellerTypeBaseurl } from '@/lib/utils';
import { CheckCircle, Package, Truck, Calendar } from 'lucide-react';
import Loading from '@/components/Loaders/Loading';

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
    const processSuccessfulPayment = async () => {
      const { payment_intent_id } = router.query;
      
      // Clear cart/buy-now state immediately
      try {
        await clearCart();
        if (buyNowProduct?.isBuyNow) {
          dispatch(clearBuyNowProduct());
        } else {
          dispatch(resetCart());
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
      
      if (payment_intent_id && typeof payment_intent_id === 'string') {
        const maxRetries = 6;
        const retryDelay = 2500; // 2.5 seconds
        let retryCount = 0;
        
        const attemptFetch = async (): Promise<void> => {
          try {
            setLoadingMessage(
              retryCount === 0 
                ? 'Submitting your order...' 
                : `Finalizing order details... (${retryCount}/${maxRetries})`
            );
            
            // Fetch actual order details using payment intent ID
            const orderData = await getOrderByPaymentIntentId(payment_intent_id);
            setOrder(orderData);
            setOrderNumber(orderData._id);
            
            // Use the estimated delivery date from the order
            const deliveryDate = new Date(orderData.estimatedDeliveryDate);
            setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }));
            
            setLoading(false);
            console.log('✅ Order details fetched successfully:', orderData._id);
          } catch (err: any) {
            console.error(`Attempt ${retryCount + 1} failed:`, err);
            
            if (retryCount < maxRetries - 1) {
              retryCount++;
              console.log(`🔄 Retrying in ${retryDelay/1000} seconds... (${retryCount}/${maxRetries})`);
              setTimeout(() => {
                attemptFetch();
              }, retryDelay);
            } else {
              console.error('❌ All retry attempts failed:', err);
              setError('Unable to load order details after multiple attempts. The order may still be processing.');
              
              // Fallback to generated order number if all retries fail
              const orderRef = payment_intent_id.split('_')[1] || payment_intent_id.substring(3, 13);
              setOrderNumber(`VK-${orderRef.toUpperCase()}`);
              
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
          }
        };
        
        // Start the first attempt
        attemptFetch();
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

    if (router.isReady) {
      processSuccessfulPayment();
    }
  }, [dispatch, buyNowProduct, router.query, router.isReady]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center'>
        <div className='text-center'>
          <Loading message={loadingMessage} />
          <p className='mt-4 text-gray-600'>Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4 py-8'>
        <div className='max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-8'>
          <div className='text-center'>
            <div className='text-red-500 text-6xl mb-4'>⚠️</div>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>Unable to Load Order Details</h2>
            <p className='text-gray-600 mb-6'>{error}</p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href={getOrderDetailsUrl()}
                className='flex items-center justify-center px-6 py-3 bg-vesoko_primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition duration-300 shadow-md'
              >
                View Order Details
              </Link>
              <Link
                href='/'
                className='flex items-center justify-center px-6 py-3 bg-white text-vesoko_primary border-2 border-vesoko_primary font-semibold rounded-lg hover:bg-vesoko_primary hover:text-white transition duration-300'
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
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>Order Confirmation</h2>
            {orderNumber && (
              <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                <p className='text-sm text-gray-600'>Order Reference</p>
                <p className='text-2xl font-bold text-vesoko_primary'>#{orderNumber}</p>
              </div>
            )}
            {estimatedDelivery && (
              <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                <p className='text-sm text-gray-600'>Estimated Delivery</p>
                <p className='text-lg font-semibold text-gray-800'>{estimatedDelivery}</p>
              </div>
            )}
            <p className='text-gray-600'>
              Your order has been successfully placed and is being processed. 
              You'll receive a confirmation email shortly with all the details.
            </p>
          </div>

          {/* Next Steps */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
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
                Expected by {estimatedDelivery || 'within 5 business days'}
              </p>
            </div>
          </div>

          {/* Email Confirmation Notice */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <CheckCircle className='h-5 w-5 text-blue-400' />
              </div>
              <div className='ml-3'>
                <p className='text-sm text-blue-700'>
                  <strong>Confirmation email sent!</strong> Check your inbox for order details and tracking information.
                </p>
              </div>
            </div>
          </div>
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
              href='mailto:support@vesoko.com'
              className='text-vesoko_primary hover:text-vesoko_primary font-medium'
            >
              📧 support@vesoko.com
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
