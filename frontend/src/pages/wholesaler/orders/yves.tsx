import Heading from '@/components/Heading';
import React from 'react';
import WholesalerLayout from '..';
import FormHeader from '@/components/FormHeader';
import TextInput from '@/components/FormInputs/TextInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import { useForm } from 'react-hook-form';

const WholesalerAccount = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log('Profile Data:', data);
    alert('Profile updated successfully!');
  };

  return (
    <div>
      <WholesalerLayout>
        <Heading title='My Account' />

        <div className='mt-6'>
          <FormHeader title='Edit My Account' />
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='w-full max-w-4xl p-4 bg-nezeza_light_blue border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mx-auto my-3'
          >
            {/* Profile Picture */}
            <div className='flex justify-center mb-6'>
              <div className='relative'>
                <img
                  src='/path-to-profile-pic.jpg'
                  alt='Profile'
                  className='w-32 h-32 rounded-full object-cover'
                />
                <button
                  type='button'
                  className='absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-2 shadow-md'
                  title='Change Profile Picture'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15.232 5.232l3.536 3.536M9 13.5l3.536-3.536m-7.072 7.072a2.121 2.121 0 01-3 3L2 21.5m6.5-6.5a2.121 2.121 0 013-3l3.536-3.536'
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Name Inputs */}
            <TextInput
              label='First Name'
              id='firstName'
              name='firstName'
              register={register}
              errors={errors}
              type='text'
            />
            <TextInput
              label='Last Name'
              id='lastName'
              name='lastName'
              register={register}
              errors={errors}
              type='text'
            />

            {/* Email (Uneditable) */}
            <TextInput
              label='Email'
              id='email'
              name='email'
              register={register}
              errors={errors}
              type='email'
              disabled={true}
              defaultValue='johndoe@example.com'
            />

            {/* Phone (Uneditable) */}
            <TextInput
              label='Phone'
              id='phone'
              name='phone'
              register={register}
              errors={errors}
              type='text'
              disabled={true}
              defaultValue='+123456789'
            />

            {/* Address */}
            <TextInput
              label='Address'
              id='address'
              name='address'
              register={register}
              errors={errors}
              type='text'
            />

            {/* Change Password Section */}
            <FormHeader title='Change Password' />
            <TextInput
              label='Current Password'
              id='currentPassword'
              name='currentPassword'
              register={register}
              errors={errors}
              type='password'
            />
            <TextInput
              label='New Password'
              id='newPassword'
              name='newPassword'
              register={register}
              errors={errors}
              type='password'
            />
            <TextInput
              label='Confirm New Password'
              id='confirmPassword'
              name='confirmPassword'
              register={register}
              errors={errors}
              type='password'
            />

            {/* Submit Button */}
            <div className='text-center'>
              <SubmitButton
                isLoading={false}
                buttonTitle='Save Changes'
                loadingButtonTitle='Saving updated info...'
              />
            </div>
          </form>
        </div>
      </WholesalerLayout>
    </div>
  );
};

WholesalerAccount.noLayout = true;
export default WholesalerAccount;
