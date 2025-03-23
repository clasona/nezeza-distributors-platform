import SubmitButton from '@/components/FormInputs/SubmitButton';
import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import ErrorMessageModal from '../ErrorMessageModal';
import SuccessMessageModal from '../SuccessMessageModal';

interface CheckoutFormProps {
  clientSecret: string;
}
const CheckoutForm = ({ clientSecret }: CheckoutFormProps) => {
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

  const handleError = (error: any) => {
    setIsLoading(false);
    setErrorMessage(error.message);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      handleError(submitError);
      return;
    }
    //TODO: collect and add shipping address to the order

    setIsLoading(true);
    if (clientSecret) {
      console.log('payment intent found, proceeding...');
      try {
        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/payment-success`,
          },
        });

        if (error) {
          console.error('Error during payment confirmation.');
          handleError(error);
        } else {
          // This automatically triggers the webhook with event 'payment_intent.succeeded' which takes care of confirmPayment()
        }
      } catch (error) {
        handleError(error);
        setErrorMessage('An error occurred during payment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className='flex justify-center items-center p-2'>
      <form
        onSubmit={handleSubmit}
        className='bg-white shadow-lg rounded-lg p-4 w-full max-w-md '
      >
        <h2 className='text-lg text-center font-bold mb-4 text-nezeza_dark_blue'>
          NEZEZA
        </h2>
        <h2 className='text-lg font-semibold mb-4 text-gray-700'>Checkout</h2>
        {/* Shipping Address */}
        <div className='mb-4'>
          <h3 className='text-sm font-bold mb-2'>Shipping Address</h3>
          <AddressElement options={{ mode: 'shipping',  }} />
        </div>
        {/* Payment Section */}
        <div className='mb-4'>
          <h3 className='text-sm font-bold mb-2'>Payment Details</h3>
          <PaymentElement
            options={{ layout: 'tabs' }}
            onChange={(event) => {
              // Add onChange handler
              setCardComplete(event.complete);
              // setPaymentError(event.error); // Capture error
            }}
          />
          {!cardComplete && (
            <div className='flex text-center justify-center mt-4 text-nezeza_red_600 text-xs'>
              Please complete all payment details.
            </div>
          )}
        </div>
        <div className='text-center'>
          <SubmitButton
            isLoading={isLoading}
            buttonTitle='Submit'
            loadingButtonTitle='Processing...'
            disabled={!stripe || !elements || !cardComplete} // Disable if not complete or error exists
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
