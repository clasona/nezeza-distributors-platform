import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const PaymentStatus = () => {
  const router = useRouter();
  const { payment_intent, payment_intent_client_secret, redirect_status } = router.query;
  const [status, setStatus] = useState<string>('loading');
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    if (redirect_status) {
      setStatus(redirect_status as string);
      // Generate order number for successful payments
      if (redirect_status === 'succeeded') {
        const orderNum = `VK-${Date.now().toString().slice(-8)}`;
        setOrderNumber(orderNum);
      }
    }
  }, [redirect_status]);

  const renderSuccessState = () => (
    <div className='min-h-screen bg-gradient-to-br from-vesoko_primary via-white to-vesoko_background flex items-center justify-center px-4 py-8'>
      <div className='max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden'>
        <div className='bg-gradient-to-r from-vesoko_primary to-green-500 px-8 py-12 text-center text-white relative'>
          <div className='mb-6'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full backdrop-blur-sm'>
              <svg className='w-12 h-12 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
              </svg>
            </div>
          </div>
          <h1 className='text-4xl font-bold mb-4'>Payment Successful!</h1>
          <p className='text-xl opacity-90'>Your payment has been processed successfully.</p>
          <div className='absolute top-4 left-4 w-12 h-12 border-2 border-white border-opacity-20 rounded-full'></div>
          <div className='absolute bottom-4 right-4 w-8 h-8 border-2 border-white border-opacity-20 rounded-full'></div>
        </div>
        
        <div className='px-8 py-8'>
          {orderNumber && (
            <div className='mb-8 text-center'>
              <div className='bg-gray-50 rounded-lg p-4 inline-block'>
                <h3 className='text-sm font-medium text-gray-500 mb-1'>Order Number</h3>
                <p className='text-xl font-bold text-vesoko_primary'>{orderNumber}</p>
              </div>
            </div>
          )}

          <div className='text-center mb-8'>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
              Thank you for your payment!
            </h2>
            <p className='text-gray-600'>You will receive a confirmation email shortly.</p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/'
              className='flex items-center justify-center px-6 py-3 bg-vesoko_primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition duration-300 shadow-md'
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

  const renderFailureState = () => (
    <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4 py-8'>
      <div className='max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden'>
        <div className='bg-gradient-to-r from-red-500 to-red-600 px-8 py-12 text-center text-white relative'>
          <div className='mb-6'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full backdrop-blur-sm'>
              <svg className='w-12 h-12 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </div>
          </div>
          <h1 className='text-4xl font-bold mb-4'>Payment Failed</h1>
          <p className='text-xl opacity-90'>We couldn't process your payment. Please try again.</p>
          <div className='absolute top-4 left-4 w-12 h-12 border-2 border-white border-opacity-20 rounded-full'></div>
          <div className='absolute bottom-4 right-4 w-8 h-8 border-2 border-white border-opacity-20 rounded-full'></div>
        </div>
        
        <div className='px-8 py-8'>
          <div className='mb-8 p-6 bg-red-50 rounded-lg border border-red-100'>
            <h3 className='text-lg font-semibold text-red-800 mb-4 flex items-center'>
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' />
              </svg>
              What went wrong?
            </h3>
            <ul className='space-y-2 text-red-700 text-sm'>
              <li>• Your card may have been declined</li>
              <li>• Insufficient funds or credit limit reached</li>
              <li>• Incorrect card details or expired card</li>
              <li>• Network connection issues</li>
            </ul>
          </div>

          <div className='text-center mb-8'>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>Don't worry!</h2>
            <p className='text-gray-600'>No charges were made to your account. You can try again or contact support if the issue persists.</p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/checkout'
              className='flex items-center justify-center px-6 py-3 bg-vesoko_primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition duration-300 shadow-md'
            >
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
              </svg>
              Try Again
            </Link>
            <Link
              href='/cart'
              className='flex items-center justify-center px-6 py-3 bg-white text-vesoko_primary border-2 border-vesoko_primary font-semibold rounded-lg hover:bg-vesoko_primary hover:text-white transition duration-300'
            >
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
              </svg>
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className='min-h-screen bg-gradient-to-br from-vesoko_primary via-white to-vesoko_background flex items-center justify-center px-4 py-8'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 text-center'>
        <div className='mb-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-vesoko_primary bg-opacity-10 rounded-full'>
            <svg className='w-8 h-8 text-vesoko_primary animate-spin' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
            </svg>
          </div>
        </div>
        <h1 className='text-2xl font-bold text-gray-800 mb-2'>Processing Payment...</h1>
        <p className='text-gray-600'>Please wait while we confirm your payment status.</p>
      </div>
    </div>
  );

  if (status === 'loading') {
    return renderLoadingState();
  }

  if (status === 'succeeded') {
    return renderSuccessState();
  }

  return renderFailureState();
};

export default PaymentStatus;
