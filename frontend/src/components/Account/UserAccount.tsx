
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import TextInput from '@/components/FormInputs/TextInput';
import AddressInput from '@/components/FormInputs/AddressInput';
import { useForm } from 'react-hook-form';
import defaultUserImage from '@/images/defaultUserImage.png';
import Image from 'next/image';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import { updateUser } from '@/utils/user/updateUser';
import { forgotPassword } from '@/utils/auth/forgotPassword';
import { updateUserPassword } from '@/utils/user/updatePassword';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import ErrorMessageModal from '@/components/ErrorMessageModal';
import { getUserById } from '@/utils/user/getUserById';
import UploadWidget from '../Cloudinary/UploadWidget';
import PageHeader from '../PageHeader';
import { UserProps } from '../../../type';
import { useDispatch } from 'react-redux';
import { addUser } from '@/redux/nextSlice';
import usStates from '@/pages/data/us_states.json';

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
    control,
    reset,
  } = useForm();
  // const router = useRouter();
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [hasAttemptedAddressValidation, setHasAttemptedAddressValidation] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const handleSendResetPasswordEmail = async () => {
    setIsSendingReset(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await forgotPassword(userInfo?.email || '');
      setSuccessMessage('A password reset link has been sent to your email. Please check your inbox.');
    } catch (err: any) {
      setErrorMessage(err?.msg || err?.message || 'Failed to send reset link.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null);
  // Handle profile picture upload
  const handleProfilePictureUpload = async (urls: string[]) => {
    if (urls.length > 0 && userInfo?._id) {
      const imageUrl = urls[0];
      try {
        await updateUser(userInfo._id, { image: imageUrl });
        setUserProfilePicture(imageUrl);
        setCurrentUserData((prev: any) => ({ ...prev, image: imageUrl }));
        const updatedUserInfo = { ...userInfo, image: imageUrl };
        dispatch(addUser(updatedUserInfo));
        setSuccessMessage('Profile picture uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch {
        setErrorMessage('Failed to upload profile picture. Please try again.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  // Handle profile picture removal
  const handleProfilePictureRemove = async () => {
    if (!userInfo?._id) return;
    try {
      await updateUser(userInfo._id, { image: '' });
      setUserProfilePicture(null);
      setCurrentUserData((prev: any) => ({ ...prev, image: '' }));
      const updatedUserInfo = { ...userInfo, image: '' };
      dispatch(addUser(updatedUserInfo));
      setSuccessMessage('Profile picture removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Failed to remove profile picture. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };
  const [isSaving, setSaving] = useState<boolean>(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const dispatch = useDispatch();

  // Helper function to normalize state names using the JSON data
  const normalizeStateName = (stateInput: string, countryCode: string = ''): string => {
    if (!stateInput) return '';
    
    // Only normalize US states
    const isUSAddress = countryCode.toUpperCase() === 'US';
    if (!isUSAddress) return stateInput.toLowerCase();
    
    // Find state by abbreviation or name from JSON
    const state = usStates.find(s => 
      s.abbreviation === stateInput.toUpperCase() || 
      s.name.toLowerCase() === stateInput.toLowerCase()
    );
    
    return state ? state.name.toLowerCase() : stateInput.toLowerCase();
  };

  // Helper function to convert state names back to abbreviations using JSON data
  const stateNameToCode = (stateName: string, countryCode: string): string => {
    if (!stateName || countryCode !== 'US') return stateName;
    
    // Find state by name from JSON
    const state = usStates.find(s => 
      s.name.toLowerCase() === stateName.toLowerCase()
    );
    
    return state ? state.abbreviation : stateName;
  };

  const fetchUserData = useCallback(async () => {
    if (!userInfo?._id) return; // Ensure userId exists before fetching
    try {
      const userData = await getUserById(userInfo._id);
      setCurrentUserData(userData);
    } catch (error) {
      console.error('Failed to fetch user data', error);
    }
  }, [userInfo?._id]);

  // Memoize initial form data to prevent infinite re-renders
  const initialFormData = useMemo(() => {
    if (!currentUserData) return null;
    
    const rawCountry = currentUserData.address?.country || '';
    const rawState = currentUserData.address?.state || '';
    
    return {
      firstName: currentUserData.firstName || '',
      lastName: currentUserData.lastName || '',
      email: currentUserData.email || '',
      phone: currentUserData.phone || '',
      dateOfBirth: currentUserData.dateOfBirth || '',
      countryOfCitizenship: currentUserData.countryOfCitizenship || '',
      // Address fields - keep codes for AddressInput compatibility
      name: `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim(),
      street1: currentUserData.address?.street1 || '',
      street2: currentUserData.address?.street2 || '',
      city: currentUserData.address?.city || '',
      state: rawState, // Keep original state code/abbreviation
      zip: currentUserData.address?.zip || '',
      country: rawCountry, // Keep original country code
    };
  }, [currentUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Initialize form with user data only once
  useEffect(() => {
    if (initialFormData && !isFormInitialized) {
      reset(initialFormData);
      setIsFormInitialized(true);
    }
  }, [initialFormData, isFormInitialized]); // Remove 'reset' to prevent infinite loops

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
    } catch {
      setErrorMessage('Error changing password.');
    };
  };

  // Handle address validation completion from AddressInput
  const handleAddressValidation = (isValid: boolean, validatedAddress?: any, error?: string) => {
    setHasAttemptedAddressValidation(true);
    setIsAddressValid(isValid);
    
    if (isValid && validatedAddress) {
      console.log('Address validated by AddressInput:', validatedAddress);
      setErrorMessage(''); // Clear any previous errors
      // AddressInput has already updated the form fields, so we can proceed
    } else {
      setIsAddressValid(false);
      if (error) {
        setErrorMessage(error);
      }
    }
  };

  const onSubmit = async (data: any) => {
    const updatedFields: any = {};
    setSaving(true);

    // Address data should already be in the right format (codes)
    // since AddressInput manages this internally
    const addressFields = {
      name: data.name, // Full name from firstName + lastName
      street1: data.street1,
      street2: data.street2,
      city: data.city,
      state: data.state, // Already in code format from AddressInput
      zip: data.zip,
      country: data.country, // Already in code format from AddressInput
    };

    // Remove address fields from main data and create structured data
    const { name: _name, street1: _street1, street2: _street2, city: _city, state: _state, zip: _zip, country: _country, ...otherData } = data;
    
    const newUserData = {
      ...otherData,
      image: userProfilePicture || currentUserData?.image,
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
      setCurrentUserData((prev: any) => ({ ...prev, ...updatedFields }));
      
      setErrorMessage('');
      setSuccessMessage(`Account data updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
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
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                <Image
                  src={userProfilePicture || currentUserData?.image || defaultUserImage}
                  alt="Profile Picture"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              
              {/* Action buttons overlay */}
              {(userProfilePicture || currentUserData?.image) ? (
                <div className="absolute -bottom-2 -right-2 flex space-x-1">
                  {/* Update Profile Picture Button */}
                  <UploadWidget
                    onUpload={handleProfilePictureUpload}
                    maxFiles={1}
                    folder="user-profile-pictures"
                  >
                    <div className="w-10 h-10 bg-vesoko_primary hover:bg-vesoko_primary_dark rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 group/update">
                      <svg className="w-4 h-4 text-white group-hover/update:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </UploadWidget>
                  {/* Remove Profile Picture Button */}
                  <button
                    type="button"
                    onClick={handleProfilePictureRemove}
                    className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group/delete"
                  >
                    <svg className="w-4 h-4 text-white group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ) : (
                /* Upload Profile Picture Button - Centered over placeholder */
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <UploadWidget
                    onUpload={handleProfilePictureUpload}
                    maxFiles={1}
                    folder="user-profile-pictures"
                  >
                    <div className="w-16 h-16 bg-vesoko_primary hover:bg-vesoko_primary_dark rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 group/upload">
                      <svg className="w-6 h-6 text-white group-hover/upload:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </UploadWidget>
                </div>
              )}
              
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {(userProfilePicture || currentUserData?.image) ? 'Update or remove profile picture' : 'Upload profile picture'}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 font-medium mt-3">
              Profile Picture
            </p>
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
{/*               
              <TextInput
                label="Country of Citizenship"
                id="countryOfCitizenship"
                name="countryOfCitizenship"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              /> */}
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Address Information</h2>
            <div className="grid grid-cols-1 gap-y-4">
              <AddressInput
                addresseeFieldName='name'
                streetFieldName='street1'
                street2FieldName='street2'
                cityFieldName='city'
                stateFieldName='state'
                countryFieldName='country'
                zipFieldName='zip'
                register={register}
                setValue={setValue}
                errors={errors}
                control={control}
                enableValidation={true}
                validationType='shipping'
                showValidationButton={true}
                onValidationComplete={handleAddressValidation}
              />
              
              {/* Address validation requirement notice */}
              {hasAttemptedAddressValidation && !isAddressValid && (
                <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg mt-2'>
                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <svg className='h-5 w-5 text-amber-400' viewBox='0 0 20 20' fill='currentColor'>
                        <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-amber-800'>
                        Please validate your address before saving. Click "Validate Address" and resolve any issues.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mb-4">
            {successMessage && (<SuccessMessageModal successMessage={successMessage} />)}
            {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
            <SubmitButton
              isLoading={isSaving}
              buttonTitle={hasAttemptedAddressValidation && !isAddressValid ? 'Please Validate Address First' : 'Save Changes'}
              loadingButtonTitle="Saving..."
              className={`${hasAttemptedAddressValidation && !isAddressValid
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-vesoko_primary hover:bg-vesoko_primary_dark'
              } text-white font-medium py-2 px-4 rounded-lg transition-all duration-200`}
              disabled={isSaving || (hasAttemptedAddressValidation && !isAddressValid)}
            />
          </div>

          {/* Change Password Section (send reset link to email) */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Change Password</h2>
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={handleSendResetPasswordEmail}
                disabled={isSendingReset}
                className={`w-full h-12 bg-vesoko_secondary_light hover:bg-vesoko_primary/90 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center ${isSendingReset ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSendingReset ? 'Sending Link...' : 'Send Password Reset Link'}
              </button>
              <p className="text-sm text-gray-600 mt-2 text-center">We&apos;ll send a password reset link to your email.</p>
            </div>
          </div>

          
        </form>
      </div>
    </div>
  );
};

UserAccount.noLayout = true;
export default UserAccount;
