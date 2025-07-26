import React, { useEffect, useState } from 'react';
import TextInput from '@/components/FormInputs/TextInput';
import { useForm } from 'react-hook-form';
import defaultUserImage from '@/images/defaultUserImage.png';
import Image from 'next/image';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import { updateUser } from '@/utils/user/updateUser';
import { updateUserPassword } from '@/utils/user/updatePassword';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import ErrorMessageModal from '@/components/ErrorMessageModal';
import { getUserById } from '@/utils/user/getUserById';
import CloudinaryImageUpload from '../FormInputs/CloudinaryImageUpload';
import PageHeader from '../PageHeader';
import { UserProps } from '../../../type';
import { useDispatch } from 'react-redux';
import { addUser } from '@/redux/nextSlice';

interface UserAccountProps {
  userInfo: UserProps;
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
  const [userProfilePicture, setUserProfilePicture] = useState<any>(null);
  const [isSaving, setSaving] = useState<boolean>(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const dispatch = useDispatch();

  const fetchUserData = async () => {
    if (!userInfo?._id) return; // Ensure userId exists before fetching
    try {
      const userData = await getUserById(userInfo._id);
      setCurrentUserData(userData);
      // Set form values
      setValue('firstName', userData.firstName || '');
      setValue('lastName', userData.lastName || '');
      setValue('email', userData.email || '');
      setValue('phone', userData.phone || '');
      setValue('dateOfBirth', userData.dateOfBirth || '');
      setValue('countryOfCitizenship', userData.countryOfCitizenship || '');
      // Address fields
      setValue('street1', userData.address?.street1 || '');
      setValue('street2', userData.address?.street2 || '');
      setValue('city', userData.address?.city || '');
      setValue('state', userData.address?.state || '');
      setValue('zip', userData.address?.zip || '');
      setValue('country', userData.address?.country || '');
    } catch (error) {
      console.error('Failed to fetch user data', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userInfo?._id]);

  const handlePasswordChange = async () => {
    const currentPassword = getValues('currentPassword');
    const newPassword = getValues('newPassword');
    const confirmPassword = getValues('confirmPassword');

    // Only proceed if user is actually trying to change password
    if (!currentPassword && !newPassword && !confirmPassword) {
      return; // No password change requested
    }

    // If any password field is filled, all must be filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('To change password, please fill in all password fields.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    try {
      await updateUserPassword(userInfo._id, {
        oldPassword: currentPassword,
        newPassword,
      });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      
      // Clear password fields after successful change
      setValue('currentPassword', '');
      setValue('newPassword', '');
      setValue('confirmPassword', '');
    } catch (error) {
      setErrorMessage('Error changing password.');
    }
  };

  const onSubmit = async (data: any) => {
    const updatedFields: any = {};
    setSaving(true);

    // Extract address fields and group them
    const addressFields = {
      street1: data.street1,
      street2: data.street2,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
    };

    // Remove address fields from main data and create structured data
    const { street1, street2, city, state, zip, country, ...otherData } = data;
    
    const newUserData = {
      ...otherData,
      image: userProfilePicture?.secure_url,
      address: addressFields,
    };

    // Compare current form values with the current user data and find changes
    Object.keys(newUserData).forEach((key) => {
      if (key === 'address') {
        // Special handling for address object
        const currentAddress = currentUserData?.address || {};
        const newAddress = newUserData.address;
        
        // Check if any address field has changed
        const addressChanged = Object.keys(newAddress).some(
          (addressKey) => newAddress[addressKey] !== (currentAddress[addressKey] || '')
        );
        
        if (addressChanged) {
          updatedFields.address = newAddress;
        }
      } else if (newUserData[key] && newUserData[key] !== currentUserData[key]) {
        updatedFields[key] = newUserData[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      setErrorMessage('No changes were made.');
      setTimeout(() => setErrorMessage(''), 4000);
      setSaving(false);
      return; // Don't submit if no changes
    }

    console.log('Sending updatedFields to backend:', updatedFields);

    try {
      await updateUser(userInfo._id, updatedFields);
      await handlePasswordChange();
      
      // Update Redux state with new user data including profile picture
      const updatedUserInfo = {
        ...userInfo,
        ...updatedFields,
      };
      dispatch(addUser(updatedUserInfo));
      
      // Update local state as well
      setCurrentUserData(prev => ({ ...prev, ...updatedFields }));
      
      setErrorMessage('');
      setSuccessMessage(`Account data updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      setErrorMessage('Error updating account data.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader heading="My Account" />
      <div className="mt-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-3xl p-6 bg-white border border-gray-200 rounded-lg shadow sm:p-8 md:p-10 mx-auto my-4"
        >
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={userProfilePicture?.secure_url || currentUserData?.image || defaultUserImage}
                alt="Profile Picture"
                width={128} 
                height={128}
                className="w-full h-full rounded-full object-cover border-4 border-gray-200 shadow-lg"
                unoptimized
              />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-gray-600 font-medium">
                Profile Picture
              </p>
              <CloudinaryImageUpload
                onResourceChange={setUserProfilePicture}
              />
            </div>
          </div>
          {/* Personal Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold">Personal Information</h2>

            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
              <TextInput
                label="First Name"
                id="firstName"
                name="firstName"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              />
              <TextInput
                label="Last Name"
                id="lastName"
                name="lastName"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              />

              <TextInput
                label="Email"
                id="email"
                name="email"
                register={register}
                errors={errors}
                type="email"
                disabled
                isRequired={false}
              />

              <TextInput
                label="Phone"
                id="phone"
                name="phone"
                register={register}
                errors={errors}
                type="tel"
                isRequired={false}
              />
              
              <TextInput
                label="Date of Birth"
                id="dateOfBirth"
                name="dateOfBirth"
                register={register}
                errors={errors}
                type="date"
                isRequired={false}
              />
              
              <TextInput
                label="Country of Citizenship"
                id="countryOfCitizenship"
                name="countryOfCitizenship"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Address Information</h2>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
              <TextInput
                label="Street Address 1"
                id="street1"
                name="street1"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              />
              <TextInput
                label="Street Address 2 (Optional)"
                id="street2"
                name="street2"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              />
              <TextInput
                label="City"
                id="city"
                name="city"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              />
              <TextInput
                label="State/Province"
                id="state"
                name="state"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              />
              <TextInput
                label="ZIP/Postal Code"
                id="zip"
                name="zip"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              />
              <TextInput
                label="Country"
                id="country"
                name="country"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              />
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold">Change Password</h2>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
              <TextInput
                label="Current Password"
                id="currentPassword"
                name="currentPassword"
                register={register}
                errors={errors}
                type="password"
                isRequired={false}
              />

              <TextInput
                label="New Password"
                id="newPassword"
                name="newPassword"
                register={register}
                errors={errors}
                type="password"
                isRequired={false}
              />

              <TextInput
                label="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                register={register}
                errors={errors}
                type="password"
                isRequired={false}
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mb-4">
            {successMessage && (<SuccessMessageModal successMessage={successMessage} />)}
            {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
            <SubmitButton
              isLoading={isSaving}
              buttonTitle="Save Changes"
              loadingButtonTitle="Saving..."
            />
          </div>
        </form>
      </div>
    </div>
  );
};

UserAccount.noLayout = true;
export default UserAccount;
