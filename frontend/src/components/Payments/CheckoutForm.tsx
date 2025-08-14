import SubmitButton from '@/components/FormInputs/SubmitButton';
import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import ErrorMessageModal from '../ErrorMessageModal';
import SuccessMessageModal from '../SuccessMessageModal';
import { getUserPaymentMethods } from '@/utils/payment/getUserPaymentMethods';
import { confirmWithSavedCard } from '@/utils/payment/confirmWithSavedCard';

interface CheckoutFormProps {
  clientSecret: string;
  paymentIntentId?: string; // Optional, if using saved card
}
const CheckoutForm = ({ clientSecret, paymentIntentId }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const dispatch = useDispatch();
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  interface SavedMethod {
    card: {
      brand: string;
      last4: string;
    };
    [key: string]: any;
  }
  const [savedMethods, setSavedMethods] = useState<SavedMethod[]>([]);
  const [useSaved, setUseSaved] = useState(true);

  useEffect(() => {
    getUserPaymentMethods().then((methods) => {
      setSavedMethods(methods);
      if (methods.length > 0) {
        setUseSaved(true);
      } else {
        setUseSaved(false);
      }
    });
  }, []);

  const handleError = (error: any) => {
    setIsLoading(false);
    setErrorMessage(error.message);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!stripe || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    if (useSaved) {
      // Use backend util to confirm payment with saved card
      try {
        // Extract payment intent ID from client secret
        const extractedPaymentIntentId = clientSecret.split('_secret_')[0];
        
        if (!extractedPaymentIntentId) {
          setIsLoading(false);
          setErrorMessage('Payment intent not found.');
          return;
        }
        
        const res = await confirmWithSavedCard(extractedPaymentIntentId);
        if (res.success) {
          router.push(`/payment-success?payment_intent_id=${extractedPaymentIntentId}`);
        } else {
          handleError({ message: res.error || 'Payment failed' });
        }
      } catch (err: any) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // New card flow
    if (!elements) {
      setIsLoading(false);
      return;
    }
    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      handleError(submitError);
      setIsLoading(false);
      return;
    }
    try {
      const paymentIntentIdFromSecret = clientSecret.split('_secret_')[0];
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/payment-success?payment_intent_id=${paymentIntentIdFromSecret}`,
        },
      });

      if (error) {
        console.error('Error during payment confirmation.');
        handleError(error);
      } else {
        // This automatically triggers the webhook with event 'payment_intent.succeeded' which takes care of
        // creating the order and sending payment confirmation or failure email to the customer.
      }
    } catch (error) {
      handleError(error);
      setErrorMessage('An error occurred during payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center p-2'>
      <form
        onSubmit={handleSubmit}
        className='bg-white shadow-lg rounded-lg p-4 w-full max-w-md '
      >
        <h2 className='text-lg text-center font-bold mb-4 text-vesoko_primary'>
          NEZEZA
        </h2>
        {/* <h2 className='text-lg font-semibold mb-4 text-gray-700'>Checkout</h2> */}
        {/* Shipping Address */}
        {/* <div className='mb-4'>
          <h3 className='text-sm font-bold mb-2'>Shipping Address</h3>
          <AddressElement options={{ mode: 'shipping',  }} />
        </div> */}
        {/* Payment Section */}
        <div className='mb-4'>
          <h3 className='text-sm font-bold mb-2'>Payment Details</h3>
          {savedMethods.length > 0 && (
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 mb-2'>
              <label className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all duration-150 ${useSaved ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-white'} w-full sm:w-auto`}>
                <input
                  type='radio'
                  name='paymentOption'
                  value='saved'
                  checked={useSaved}
                  onChange={() => setUseSaved(true)}
                  className='mr-2 accent-green-600'
                />
                <span className='text-sm font-medium'>
                  Use saved card <span className='font-normal text-xs text-gray-600'>({savedMethods[0].card.brand} •••• {savedMethods[0].card.last4})</span>
                </span>
              </label>
              <label className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all duration-150 ${!useSaved ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-white'} w-full sm:w-auto`}>
                <input
                  type='radio'
                  name='paymentOption'
                  value='new'
                  checked={!useSaved}
                  onChange={() => setUseSaved(false)}
                  className='mr-2 accent-green-600'
                />
                <span className='text-sm font-medium'>Use a new card</span>
              </label>
            </div>
          )}
          {!useSaved && (
            <PaymentElement
              options={{ layout: 'tabs' }}
              onChange={(event) => {
                setCardComplete(event.complete);
                // setPaymentError(event.error); // Capture error
              }}
            />
          )}
          {!useSaved && !cardComplete && (
            <div className='flex text-center justify-center mt-4 text-vesoko_red_600 text-xs'>
              Please complete all payment details.
            </div>
          )}
        </div>
        <div className='text-center'>
          <SubmitButton
            isLoading={isLoading}
            buttonTitle='Submit'
            loadingButtonTitle='Processing...'
            disabled={
              !stripe ||
              !elements ||
              (useSaved
                ? false
                : !cardComplete) // Disable if new card and not complete
            }
            className='w-full disabled:bg-gray-300'
          />
        </div>
        {/* Success Message */}
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
        {/* Error Message */}
        {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
      </form>
    </div>
  );
};

CheckoutForm.noLayout = true;
export default CheckoutForm;
