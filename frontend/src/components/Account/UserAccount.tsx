import Heading from '@/components/Heading';
import React, { useEffect, useState } from 'react';
import FormHeader from '@/components/FormHeader';
import TextInput from '@/components/FormInputs/TextInput';
import Button from '@/components/FormInputs/Button';
import { useForm } from 'react-hook-form';
import { Edit3, Plus } from 'lucide-react';
import defaultUserImage from '@/images/defaultUserImage.png';
import Image from 'next/image';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import { updateUser } from '@/utils/user/updateUser';
import { useSelector } from 'react-redux';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import ErrorMessageModal from '@/components/ErrorMessageModal';
import { getUser } from '@/utils/user/getUser';
import CloudinaryImageUpload from '../FormInputs/CloudinaryImageUpload';
import { stateProps } from '../../../type';
import PageHeader from '../PageHeader';

interface UserAccountProps {
  // onSubmitSuccess?: (data: any) => void;
  userInfo:any;
}
const UserAccount = ({ userInfo }: UserAccountProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [currentUserData, setCurrentUserData] = useState<any | null>(null);
  const [userProfilePicture, setUserProfilePicture] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userInfo?.userId) return; // Ensure userId exists before fetching
      try {
        const userData = await getUser(userInfo.userId);
        setCurrentUserData(userData);
        // Set form values
        setValue('firstName', userData.firstName || '');
        setValue('lastName', userData.lastName || '');
        setValue('email', userData.email || '');
        // setValue('address', userData.address || '');
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();
  }, []);

  const onSubmit = async (data: any) => {
    const updatedFields: any = {};

    const newUserData = {
      ...data,
      image: userProfilePicture?.secure_url,
    };

    // Compare current form values with the current user data and find changes
    Object.keys(newUserData).forEach((key) => {
      if (newUserData[key] && newUserData[key] !== currentUserData[key]) {
        updatedFields[key] = newUserData[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      setErrorMessage('No changes were made.');
      setTimeout(() => setErrorMessage(''), 4000);
      return; // Don't submit if no changes
    }

    console.log('changes', updatedFields);
    try {
      await updateUser(userInfo.userId, updatedFields);

      setErrorMessage('');
      setSuccessMessage(`Account data updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);

      //   if (onSubmitSuccess) {
      //   onSubmitSuccess(response.data);
      //   }
    } catch (error) {
      setErrorMessage('Error updating account data.');
    }
  };

  return (
    <div>
      <PageHeader
        heading='Update Account'
      />
      <div className='mt-6'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full max-w-4xl p-4 bg-nezeza_light_blue border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mx-auto my-3'
        >
          {/* Profile Picture Section */}
          <div className='flex flex-col items-center mb-3'>
            <div className='relative w-24 h-24'>
              <Image
                // fill={true}
                src={currentUserData?.image || defaultUserImage}
                alt={currentUserData?.image || defaultUserImage}
                width={50} // Adjust the width as needed
                height={50} // Adjust the height as needed
                className='w-full h-full rounded-full object-cover'
                unoptimized
              />
              {/* 
              <button
                type='button'
                className='absolute bottom-0 right-0 bg-nezeza_green_600 text-white border rounded-full p-1 shadow-sm'
                title='Change profile picture'
              >
                <Edit3 className='w-4 h-4 text-white' />
              </button> */}
            </div>
            <p className='text-sm text-nezeza_gray_600 mt-2'>
              Change profile picture
            </p>
            {/* Main product image */}
            <CloudinaryImageUpload
              className='sm:col-span-2' //span full row
              onResourceChange={setUserProfilePicture} // Set mainImageResource on upload success
            />
          </div>
          {/* Personal Information Section */}
          <div className='my-6'>
            <h2 className='text-lg font-bold'>Personal Information</h2>

            <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
              {/* Name Input */}
              <TextInput
                label='First Name'
                id='firstName'
                name='firstName'
                register={register}
                errors={errors}
                type='text'
                isRequired={false}
              />
              <TextInput
                label='Last Name'
                id='lastName'
                name='lastName'
                register={register}
                errors={errors}
                type='text'
                isRequired={false}
              />

              {/* Email (Uneditable) */}
              <TextInput
                label='Email'
                id='email'
                name='email'
                register={register}
                errors={errors}
                type='email'
                value=''
                disabled
                isRequired={false}
              />

              {/* Phone (Uneditable) */}
              <TextInput
                label='Phone'
                id='phone'
                name='phone'
                register={register}
                errors={errors}
                type='tel'
                value=''
                disabled={true}
                isRequired={false}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className='my-6'>
            <h2 className='text-lg font-bold'>Addresses</h2>

            <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
              <TextInput
                label='Address'
                id='address'
                name='address'
                register={register}
                errors={errors}
                type='text'
                isRequired={false}
              />
            </div>
          </div>

          {/* Change Password Section */}
          <div className='my-6'>
            <h2 className='text-lg font-bold'>Change Password</h2>
            <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
              <TextInput
                label='Current Password'
                id='currentPassword'
                name='currentPassword'
                register={register}
                errors={errors}
                type='password'
                isRequired={false}
              />

              <TextInput
                label='New Password'
                id='newPassword'
                name='newPassword'
                register={register}
                errors={errors}
                type='password'
                isRequired={false}
              />

              <TextInput
                label='Confirm New Password'
                id='confirmPassword'
                name='confirmPassword'
                register={register}
                errors={errors}
                type='password'
                isRequired={false}
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
              buttonTitle='Save Changes'
              loadingButtonTitle='Saving...'
            />
            <p className='text-center text-nezeza_gray_600'>
              You will be logged out for the changes to take effect.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

UserAccount.noLayout = true;
export default UserAccount;
