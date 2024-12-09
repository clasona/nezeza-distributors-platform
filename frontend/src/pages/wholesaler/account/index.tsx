import Heading from '@/components/Heading';
import React from 'react';
import WholesalerLayout from '..';
import FormHeader from '@/components/FormHeader';
import TextInput from '@/components/FormInputs/TextInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import { useForm } from 'react-hook-form';
import { Edit3 } from 'lucide-react';
import yves from '@/images/yves.jpeg';
import Image from 'next/image';

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
        <Heading title='Edit My Account' />

        <div className='mt-6'>
          {/* <FormHeader title='Edit My Account' /> */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='w-full max-w-4xl p-4 bg-nezeza_light_blue border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mx-auto my-3'
          >
            {/* Profile Picture Section */}
            <div className='flex flex-col items-center mb-3'>
              <div className='relative w-24 h-24'>
                <Image
                  src={yves}
                  alt='Profile'
                  className='w-full h-full rounded-full object-cover'
                />
                <button
                  type='button'
                  className='absolute bottom-0 right-0 bg-green-500 text-white border rounded-full p-1 shadow-sm'
                  title='Change profile picture'
                >
                  <Edit3 className='w-4 h-4 text-white' />
                </button>
              </div>
              <p className='text-sm text-gray-500 mt-2'>
                Change profile picture
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6'>
              {/* Name Input */}
              <div className='flex flex-col'>
                <TextInput
                  label='First Name'
                  id='firstName'
                  name='firstName'
                  register={register}
                  errors={errors}
                  type='text'
                />
              </div>
              <div className='flex flex-col'>
                <TextInput
                  label='Last Name'
                  id='lastName'
                  name='lastName'
                  register={register}
                  errors={errors}
                  type='text'
                />
              </div>

              {/* Email (Uneditable) */}
              <div className='flex flex-col'>
                <TextInput
                  label='Email'
                  id='email'
                  name='email'
                  register={register}
                  errors={errors}
                  type='email'
                  value=''
                  disabled
                />
              </div>

              {/* Phone (Uneditable) */}
              <div className='flex flex-col'>
                <TextInput
                  label='Phone'
                  id='phone'
                  name='phone'
                  register={register}
                  errors={errors}
                  type='tel'
                  value=''
                  disabled={true}
                />
              </div>

              {/* Change Password Section */}
              <div className='flex flex-col'>
                <TextInput
                  label='Current Password'
                  id='currentPassword'
                  name='currentPassword'
                  register={register}
                  errors={errors}
                  type='password'
                />
              </div>
              <div className='flex flex-col'>
                <TextInput
                  label='New Password'
                  id='newPassword'
                  name='newPassword'
                  register={register}
                  errors={errors}
                  type='password'
                />
              </div>
              <div className='flex flex-col'>
                <TextInput
                  label='Confirm New Password'
                  id='confirmPassword'
                  name='confirmPassword'
                  register={register}
                  errors={errors}
                  type='password'
                />
              </div>
              {/* Address */}
              <div className='flex flex-col'>
                <TextInput
                  label='Address'
                  id='address'
                  name='address'
                  register={register}
                  errors={errors}
                  type='text'
                />
              </div>
            </div>

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
