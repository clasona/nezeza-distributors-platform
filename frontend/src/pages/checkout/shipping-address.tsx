import ErrorMessageModal from '@/components/ErrorMessageModal';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import PageHeader from '@/components/PageHeader';
import RootLayout from '@/components/RootLayout';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { setShippingAddress } from '@/redux/nextSlice';
import { updateUserByEmail } from '@/utils/user/updateUser';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddressProps, stateProps } from '../../../type';
import countries from '@/pages/data/countries.json';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import TextInput from '@/components/FormInputs/TextInput';
import { useForm } from 'react-hook-form';

const CheckoutAddressPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userInfo, cartItemsData, shippingAddress } = useSelector(
    (state: stateProps) => state.next
  );

  const countryOptions = countries.map((country) => ({
    value: country.code,
    label: country.name,
  }));

  const [selectedCountryOption, setSelectedCountryOption] = useState<{
    value: string;
    label: string;
  } | null>(null);

  // Use react-hook-form for all inputs
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  useEffect(() => {
    // On mount or on address/user info change, update the form values
    reset({
      fullName:
        shippingAddress?.fullName ||
        userInfo?.address?.fullName ||
        userInfo?.firstName ||
        '',
      street1: shippingAddress?.street1 || userInfo?.address?.street1 || '',
      city: shippingAddress?.city || userInfo?.address?.city || '',
      state: shippingAddress?.state || userInfo?.address?.state || '',
      zip: shippingAddress?.zip || userInfo?.address?.zip || '',
      // country: shippingAddress?.country || userInfo?.address?.country || '',
      phone: shippingAddress?.phone || userInfo?.address?.phone || '',
      email:
        shippingAddress?.email ||
        userInfo?.address?.email ||
        userInfo?.email ||
        '',
    });
    if (shippingAddress.country) {
      setSelectedCountryOption({value: shippingAddress.country, label: shippingAddress.country});
      // setValue('country', shippingAddress.country);
    } else if (userInfo?.address?.country) {
      setSelectedCountryOption({value:userInfo.address.country, label: userInfo.address.country});
    }
  }, [shippingAddress, userInfo, reset]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartItemsData?.length) {
      router.replace('/');
    }
  }, [cartItemsData, router]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCountryChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedCountryOption(option);
  };

  const onSubmit = async (data: any) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await updateUserByEmail(userInfo?.email, { address: data });
      dispatch(setShippingAddress(data));
      setSuccessMessage('Address saved! Redirecting to order review...');
      setTimeout(() => {
        router.push('/checkout/review');
      }, 1200);
    } catch (err: any) {
      setErrorMessage('Failed to save address. Please try again.');
    }
  };

  if (!cartItemsData?.length) {
    return (
      <RootLayout>
        <div className='flex items-center justify-center min-h-[calc(100vh-100px)]'>
          <p>No items in the cart. Redirecting...</p>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className='bg-nezeza_powder_blue min-h-[calc(100vh-100px)] p-2 sm:p-4 md:p-8 flex items-center justify-center'>
        <div className='bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl max-w-2xl w-full'>
          <PageHeader heading='Enter Shipping Address' />

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <TextInput
              label='Full Name'
              id='fullName'
              name='fullName'
              register={register}
              errors={errors}
              type='text'
            />
            <TextInput
              label='Street Address'
              id='street1'
              name='street1'
              register={register}
              errors={errors}
              type='text'
            />
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <TextInput
                label='City'
                id='city'
                name='city'
                register={register}
                errors={errors}
                type='text'
              />
              <TextInput
                label='State/Province'
                id='state'
                name='state'
                register={register}
                errors={errors}
                type='text'
              />
              <TextInput
                label='Zip/Postal Code'
                id='zip'
                name='zip'
                register={register}
                errors={errors}
                type='text'
              />
            </div>
            <DropdownInputSearchable
              label='Country'
              id='country'
              name='country'
              value={selectedCountryOption}
              options={countryOptions}
              onChange={handleCountryChange}
              register={register}
              errors={errors}
            />
            <TextInput
              label='Phone'
              id='phone'
              name='phone'
              type='tel'
              register={register}
              errors={errors}
            />

            <SubmitButton
              isLoading={isSubmitting}
              buttonTitle='Continue to Review'
              className='w-full py-3 mt-6 bg-nezeza_green_600 text-white rounded-md hover:bg-nezeza_green_800 transition-colors duration-300 text-lg font-semibold'
            />
          </form>

          <div className='mt-4 text-gray-500 text-sm'>
            <span>
              <strong>Note:</strong> This is a one-time step. Your shipping
              address will be securely added to your file for future checkouts.
            </span>
          </div>

          {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
          {successMessage && (
            <SuccessMessageModal successMessage={successMessage} />
          )}
        </div>
      </div>
    </RootLayout>
  );
};

CheckoutAddressPage.noLayout = true;
export default CheckoutAddressPage;
