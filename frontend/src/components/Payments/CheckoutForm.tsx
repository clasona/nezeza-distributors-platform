import React, { useEffect, useState } from 'react';
import {
  PaymentElement,
  AddressElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import { getClientSecret } from '@/utils/order/getClientSecret';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps } from '../../../type';
import { getOrderByPaymentIntentId } from '@/utils/order/getOrderByPaymentIntentId';
import { confirmOrderPayment } from '@/utils/payment/confirmOrderPayment';
import SuccessMessageModal from '../SuccessMessageModal';
import ErrorMessageModal from '../ErrorMessageModal';
import { useRouter } from 'next/router';
import { resetCart } from '@/store/nextSlice';

interface CheckoutFormProps {
  clientSecret: string;
}
const CheckoutForm = ({ clientSecret }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const dispatch = useDispatch();
  const { paymentInfo } = useSelector((state: stateProps) => state.next);
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleError = (error: any) => {
    setLoading(false);
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

    // const confirmPayment = async () => {
    setIsLoading(true);
    if (paymentInfo) {
      try {
        // Confirm the PaymentIntent using the details collected by the Payment Element
        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: 'http://localhost:3000/payment-success',
          },
        });

        if (error) {
          handleError(error);
        } else {
          // This triggers the webhook with event 'payment_intent.succeeded' which takes care of confirmPayment()
          // Payment authorized, redirecting...
          console.log('Payment authorized, redirecting...');
          // try {
          //   console.log('yvesssssss');
          //   const order = await getOrderByPaymentIntentId(
          //     paymentInfo.paymentIntentId
          //   );

          //   if (order && order._id) {
          //     setOrderId(order._id);
          //     await confirmOrderPayment(order._id, paymentInfo.paymentIntentId);
          //     console.log('order payment confirmed successfully...');

          //     //resetcart
          //     // dispatch(resetCart())
          //   } else {
          //     setSuccessMessage('');
          //     setErrorMessage(`No order with id: ${orderId}`);
          //     setTimeout(() => setErrorMessage(''), 4000);
          //     console.log('No order with id:', orderId);
          //   }
          // } catch (error) {
          //   console.error('Error fetching order data:', error);
          //   setErrorMessage(
          //     'Error confirming order payment. Please try again.'
          //   );
          // }
        }
      } catch (error) {
        console.error('Error during payment:', error);
        setErrorMessage('An error occurred during payment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className='flex justify-center items-center p-4'>
      <form
        onSubmit={handleSubmit}
        className='bg-white shadow-lg rounded-lg p-4 w-full max-w-md'
      >
        <h2 className='text-lg text-center font-bold mb-4 text-nezeza_dark_blue'>
          NEZEZA
        </h2>
        <h2 className='text-lg font-semibold mb-4 text-gray-700'>Checkout</h2>
        {/* Shipping Address */}
        <div className='mb-4'>
          <h3 className='text-sm font-bold mb-2'>Shipping Address</h3>
          {/* <AddressElement options={{ mode: 'shipping',  }} /> */}
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
        {/* <button type='submit' disabled={!cardComplete}>testtt</button> */}
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
