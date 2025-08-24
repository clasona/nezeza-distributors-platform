import React, { useEffect, useState } from 'react';
import AddressInput from '../AddressInput';
import DropdownInput from '../DropdownInput';
import TextInput from '../TextInput';
import countries from '@/pages/data/countries.json';
import {
  Control,
  FieldErrors,
  UseFormRegister,
  useWatch,
} from 'react-hook-form';
import StoreFormHeading from './StoreFormHeading';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';
import { StoreApplicationFormData } from '@/types/storeApplication';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { sendEmailVerification, verifyEmailCode } from '@/utils/verification/sendEmailVerification';

interface PrimaryContactInputProps {
  errors: FieldErrors<StoreApplicationFormData>;
  defaultValue?: string;
  register: UseFormRegister<StoreApplicationFormData>;
  setValue: (name: keyof StoreApplicationFormData, value: string) => void;
  control: Control<StoreApplicationFormData>;
  onVerificationStatusChange?: (emailVerified: boolean, phoneVerified: boolean) => void;
}

const PrimaryContactInput = ({
  register,
  errors,
  setValue,
  control,
  onVerificationStatusChange,
}: PrimaryContactInputProps) => {
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );
  
  // Email verification state
  const [emailValidationStatus, setEmailValidationStatus] = useState<'idle' | 'sending' | 'code-sent' | 'verifying' | 'verified' | 'invalid' | 'code-error'>('idle');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [verificationErrors, setVerificationErrors] = useState({ email: '', phone: '' });
  
  // Watch email value
  const primaryEmailValue = useWatch({ control, name: 'email' });
  
  // transform countries & states json to have label and value as expected by DropdownInput element
  const countryOptions = countries.map((country) => ({
    value: country.name.toLowerCase(),
    label: country.name,
  }));

  // Notify parent component when verification status changes
  useEffect(() => {
    if (onVerificationStatusChange) {
      const emailVerified = emailValidationStatus === 'verified';
      onVerificationStatusChange(emailVerified, false); // Phone verification is false for now
    }
  }, [emailValidationStatus, onVerificationStatusChange]);

  // Email verification functions
  const sendEmailVerificationCode = async (email: string) => {
    if (!email) return;
    
    // Basic email validation first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailValidationStatus('invalid');
      setVerificationErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      return;
    }

    setEmailValidationStatus('sending');
    setVerificationErrors(prev => ({ ...prev, email: '' }));
    
    try {
      await sendEmailVerification(email);
      setEmailValidationStatus('code-sent');
    } catch (error: any) {
      setEmailValidationStatus('invalid');
      setVerificationErrors(prev => ({ ...prev, email: error || 'Failed to send verification email' }));
    }
  };

  const verifyEmailWithCode = async (email: string, code: string) => {
    if (!email || !code) return;
    
    setEmailValidationStatus('verifying');
    setVerificationErrors(prev => ({ ...prev, email: '' }));
    
    try {
      await verifyEmailCode(email, code);
      setEmailValidationStatus('verified');
      setEmailVerificationCode(''); // Clear the code input
    } catch (error: any) {
      setEmailValidationStatus('code-error'); // New error state to show error while keeping code input
      setVerificationErrors(prev => ({ ...prev, email: error || 'Invalid verification code' }));
    }
  };

  useEffect(() => {
    // Set the default values from userInfo
    if (userInfo) {
      if (userInfo.firstName) setValue('firstName', userInfo.firstName);
      if (userInfo.lastName) setValue('lastName', userInfo.lastName);
      if (userInfo.email) setValue('email', userInfo.email);
    }
  }, [userInfo, setValue]);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-x-6 px-4 sm:px-6 w-full'>
      <StoreFormHeading heading='Contact Info' />
      <TextInput
        label='First Name'
        id='firstName'
        name='firstName'
        register={register as any}
        errors={errors as any}
        type='text'
        className='col-span-1'
      />
      <TextInput
        label='Last Name'
        id='lastName'
        name='lastName'
        register={register as any}
        errors={errors as any}
        type='text'
        className='col-span-1'
      />
      {/* Primary Contact Email with Verification */}
      <div className='space-y-2 sm:col-span-2'>
        <TextInput
          label='Email'
          id='email'
          name='email'
          register={register as any}
          errors={errors as any}
          type='email'
          // disabled
        />
        <div className='flex items-center gap-2 flex-wrap'>
          {emailValidationStatus === 'idle' && (
            <button
              type='button'
              onClick={() => sendEmailVerificationCode(primaryEmailValue)}
              disabled={!primaryEmailValue}
              className='px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200'
            >
              <Mail className='inline-block w-4 h-4 mr-1' />
              Verify Primary Contact Email
            </button>
          )}
          {emailValidationStatus === 'sending' && (
            <div className='flex items-center gap-1 text-blue-600 text-sm'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
              <span>Sending verification email...</span>
            </div>
          )}
          {(emailValidationStatus === 'code-sent' || emailValidationStatus === 'code-error') && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <input
                  type='text'
                  placeholder='Enter 6-digit code'
                  value={emailVerificationCode}
                  onChange={(e) => setEmailVerificationCode(e.target.value)}
                  className='px-2 py-1 text-sm border border-gray-300 rounded-md w-32'
                  maxLength={6}
                />
                <button
                  type='button'
                  onClick={() => verifyEmailWithCode(primaryEmailValue, emailVerificationCode)}
                  disabled={emailVerificationCode.length !== 6}
                  className='px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200'
                >
                  Verify
                </button>
                <button
                  type='button'
                  onClick={() => sendEmailVerificationCode(primaryEmailValue)}
                  className='px-2 py-1.5 text-xs font-medium bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200'
                >
                  Resend
                </button>
              </div>
              {emailValidationStatus === 'code-error' && verificationErrors.email && (
                <div className='flex items-center gap-1 text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4' />
                  <span>{verificationErrors.email}</span>
                </div>
              )}
            </div>
          )}
          {emailValidationStatus === 'verifying' && (
            <div className='flex items-center gap-1 text-blue-600 text-sm'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
              <span>Verifying code...</span>
            </div>
          )}
          {emailValidationStatus === 'verified' && (
            <div className='flex items-center gap-1 text-green-600 text-sm'>
              <CheckCircle className='h-4 w-4' />
              <span>Email verified!</span>
            </div>
          )}
          {emailValidationStatus === 'invalid' && (
            <div className='flex items-center gap-1 text-red-600 text-sm'>
              <AlertCircle className='h-4 w-4' />
              <span>{verificationErrors.email || 'Verification failed'}</span>
            </div>
          )}
        </div>
      </div>
      <TextInput
        label='Phone'
        id='phone'
        name='phone'
        register={register as any}
        errors={errors as any}
        type='tel'
        // disabled
      />
      {/* Commented out for now - not requesting country of citizenship
      <DropdownInput
        label='Country of Citizenship'
        id='citizenshipCountry'
        name='citizenshipCountry'
        options={countryOptions}
        register={register as any}
        errors={errors as any}
      />
      */}
      <TextInput
        label='Date of Birth'
        id='dob'
        name='dob'
        register={register as any}
        errors={errors as any}
        type='date'
      />
      {/* <StoreFormHeading heading='Residence Address' />
      <AddressInput
        streetFieldName='residenceStreet'
        street2FieldName='residenceStreet2'
        cityFieldName='residenceCity'
        stateFieldName='residenceState'
        countryFieldName='residenceCountry'
        zipFieldName='residenceZipCode'
        register={register as any}
        errors={errors as any}
        control={control as any}
        setValue={setValue as any}
      /> */}
    </div>
  );
};

export default PrimaryContactInput;
