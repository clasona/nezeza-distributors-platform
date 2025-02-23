import Heading from '@/components/Heading';
import React, { useEffect, useState } from 'react';
import TextInput from '@/components/FormInputs/TextInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import ErrorMessageModal from '@/components/ErrorMessageModal';
// import {
//   getUserPaymentMethods,
//   updateUserPaymentMethods,
// } from '@/pages/utils/user/paymentMethods';
import { Plus } from 'lucide-react';

const PaymentsInfo = ({ userInfo }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!userInfo?.userId) return;
      try {
        const paymentData = await getUserPaymentMethods(userInfo.userId);
        setPaymentMethods(paymentData);
      } catch (error) {
        console.error('Failed to fetch payment data', error);
      }
    };

    fetchPaymentData();
  }, []);

  const onSubmit = async (data) => {
    try {
      await updateUserPaymentMethods(userInfo.userId, [
        ...paymentMethods,
        data,
      ]);
      setSuccessMessage('Payment method added successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      reset();
    } catch (error) {
      setErrorMessage('Error updating payment details.');
    }
  };

  return (
    <div>
      <Heading title='Payment Methods' />
      <div className='mt-6'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full max-w-4xl p-4 bg-nezeza_light_blue border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mx-auto my-3'
        >
          <div className='my-6'>
            <h2 className='text-lg font-bold'>Add New Payment Method</h2>
            <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
              <TextInput
                label='Card Holder Name'
                id='cardHolderName'
                name='cardHolderName'
                register={register}
                errors={errors}
                type='text'
                isRequired
              />
              <TextInput
                label='Card Number'
                id='cardNumber'
                name='cardNumber'
                register={register}
                errors={errors}
                type='text'
                isRequired
              />
              <TextInput
                label='Expiry Date (MM/YY)'
                id='expiryDate'
                name='expiryDate'
                register={register}
                errors={errors}
                type='text'
                isRequired
              />
            </div>
          </div>

          <div className='flex flex-col items-center justify-center'>
            {successMessage && (
              <SuccessMessageModal successMessage={successMessage} />
            )}
            {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
            <SubmitButton
              isLoading={false}
              buttonTitle='Add Payment Method'
              loadingButtonTitle='Saving...'
            />
          </div>
        </form>

        <div className='mt-6'>
          <h2 className='text-lg font-bold'>Saved Payment Methods</h2>
          <ul className='mt-4'>
            {paymentMethods.map((method, index) => (
              <li
                key={index}
                className='border p-2 rounded-lg bg-white shadow mb-2'
              >
                {method.cardHolderName} - **** **** ****{' '}
                {method.cardNumber.slice(-4)} (Exp: {method.expiryDate})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

PaymentsInfo.noLayout = true;
export default PaymentsInfo;
