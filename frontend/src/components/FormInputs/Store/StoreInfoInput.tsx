import { useEffect, useState } from 'react';
import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
  useFormState,
  UseFormGetValues,
} from 'react-hook-form';
import AddressInput from '../AddressInput';
import CloudinaryImageUpload from '../CloudinaryImageUpload';
import DropdownInput from '../DropdownInput';
import TextAreaInput from '../TextAreaInput';
import TextInput from '../TextInput';
import StoreFormHeading from './StoreFormHeading';
import { Store, Mail, Phone, ClipboardList, Type, Image, CheckCircle, AlertCircle, Copy, MessageSquare } from 'lucide-react';
import { StoreApplicationFormData } from '@/types/storeApplication';
import { sendEmailVerification, verifyEmailCode } from '@/utils/verification/sendEmailVerification';
import { sendSMSVerification, verifySMSCode } from '@/utils/verification/sendSMSVerification';

interface StoreInfoInputProps {
  errors: FieldErrors<StoreApplicationFormData>;
  defaultValue?: string;
  register: UseFormRegister<StoreApplicationFormData>;
  setValue: UseFormSetValue<StoreApplicationFormData>;
  control: Control<StoreApplicationFormData>;
  getValues: UseFormGetValues<StoreApplicationFormData>;
  onVerificationStatusChange?: (emailVerified: boolean, phoneVerified: boolean) => void;
  setStoreLogoResource?: (resource: any) => void;
}

const StoreInfoInput = ({
  register,
  setValue,
  errors,
  control,
  getValues,
  onVerificationStatusChange,
  setStoreLogoResource: setParentStoreLogoResource,
}: StoreInfoInputProps) => {
  const [storeLogoResource, setStoreLogoResource] = useState<any>(null);
  const [emailValidationStatus, setEmailValidationStatus] = useState<'idle' | 'sending' | 'code-sent' | 'verifying' | 'verified' | 'invalid' | 'code-error'>('idle');
  const [phoneValidationStatus, setPhoneValidationStatus] = useState<'idle' | 'sending' | 'code-sent' | 'verifying' | 'verified' | 'invalid' | 'code-error'>('idle');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [verificationErrors, setVerificationErrors] = useState({ email: '', phone: '' });

  // Notify parent component when verification status changes
  useEffect(() => {
    if (onVerificationStatusChange) {
      const emailVerified = emailValidationStatus === 'verified';
      const phoneVerified = phoneValidationStatus === 'verified';
      onVerificationStatusChange(emailVerified, phoneVerified);
    }
  }, [emailValidationStatus, phoneValidationStatus, onVerificationStatusChange]);

  const selectedStoreTypeValue = useWatch({ control, name: 'storeType' });
  const storeEmailValue = useWatch({ control, name: 'storeEmail' });
  const storePhoneValue = useWatch({ control, name: 'storePhone' });

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

  // Phone verification functions
  const sendPhoneVerificationCode = async (phone: string) => {
    if (!phone) return;
    
    // Basic phone validation first
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
      setPhoneValidationStatus('invalid');
      setVerificationErrors(prev => ({ ...prev, phone: 'Invalid phone format' }));
      return;
    }

    setPhoneValidationStatus('sending');
    setVerificationErrors(prev => ({ ...prev, phone: '' }));
    
    try {
      await sendSMSVerification(phone);
      setPhoneValidationStatus('code-sent');
    } catch (error: any) {
      setPhoneValidationStatus('invalid');
      setVerificationErrors(prev => ({ ...prev, phone: error || 'Failed to send verification SMS' }));
    }
  };

  const verifyPhoneWithCode = async (phone: string, code: string) => {
    if (!phone || !code) return;
    
    setPhoneValidationStatus('verifying');
    setVerificationErrors(prev => ({ ...prev, phone: '' }));
    
    try {
      await verifySMSCode(phone, code);
      setPhoneValidationStatus('verified');
      setPhoneVerificationCode(''); // Clear the code input
    } catch (error: any) {
      setPhoneValidationStatus('code-error'); // New error state to show error while keeping code input
      setVerificationErrors(prev => ({ ...prev, phone: error || 'Invalid verification code' }));
    }
  };

  const handleLogoUpload = (resource: any) => {
    setStoreLogoResource(resource);
    // Store the logo URL in the form data
    if (resource) {
      setValue('storeLogo', resource.secure_url);
    } else {
      setValue('storeLogo', '');
    }
    // Also update parent component state for review page
    if (setParentStoreLogoResource) {
      setParentStoreLogoResource(resource);
    }
  };

  useEffect(() => {
    const selectedStoreType = localStorage.getItem('selectedStoreType') || '';
    setValue('storeType', selectedStoreType, { shouldValidate: true });
  }, [setValue]);

  const storeTypeOptions = [
    { value: 'retail', label: 'Retail' },  // Only retail type is available for now
  ];

  const storeCategoryOptions = [
    { value: '', label: 'Select category' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'services', label: 'Professional Services' },
    { value: 'other', label: 'Other' },
    // ... more categories
  ];

  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-x-6 px-4 sm:px-6 w-full'>
        <div className='flex items-center justify-between sm:col-span-2 mb-4'>
          <StoreFormHeading heading='Store Info' />
          <button
            type='button'
            onClick={() => {
              const values = getValues();
              setValue('storeEmail', values.email);
              setValue('storePhone', values.phone);
              setValue('storeStreet', values.residenceStreet);
              setValue('storeCity', values.residenceCity);
              setValue('storeState', values.residenceState);
              setValue('storeCountry', values.residenceCountry);
              setValue('storeZipCode', values.residenceZipCode);
            }}
            className='flex items-center gap-2 px-4 py-2 bg-vesoko_dark_blue text-white rounded-md hover:bg-vesoko_green_600 transition-all duration-200 text-sm font-medium'
          >
            <Copy className='h-4 w-4' />
            Reuse Primary Contact Info
          </button>
        </div>
        <DropdownInput
          label='Store Type'
          id='storeType'
          name='storeType'
          value={selectedStoreTypeValue}
          options={storeTypeOptions}
          register={register as any}
          errors={errors as any}
        />
        <TextInput
          label='Store Registration Number'
          id='storeRegistrationNumber'
          name='storeRegistrationNumber'
          register={register as any}
          errors={errors as any}
          type='number'
        />
        <TextInput
          label='Store Name'
          id='storeName'
          name='storeName'
          register={register as any}
          errors={errors as any}
          type='text'
        />
        <DropdownInput
          label='Store Category'
          id='storeCategory'
          name='storeCategory'
          options={storeCategoryOptions}
          register={register as any}
          errors={errors as any}
        />
        <TextAreaInput
          label='Store Description'
          id='storeDescription'
          name='storeDescription'
          register={register as any}
          errors={errors as any}
          type='text'
          className='sm:col-span-2'
        />
        {/* Store Email with Validation */}
        <div className='space-y-2'>
          <TextInput
            label='Store Email'
            id='storeEmail'
            name='storeEmail'
            register={register as any}
            errors={errors as any}
            type='email'
          />
          <div className='flex items-center gap-2 flex-wrap'>
            {emailValidationStatus === 'idle' && (
              <button
                type='button'
                onClick={() => sendEmailVerificationCode(storeEmailValue)}
                disabled={!storeEmailValue}
                className='px-3 py-1.5 text-xs font-medium bg-vesoko_dark_blue text-white rounded-md hover:bg-vesoko_green_600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200'
              >
                <Mail className='inline-block w-4 h-4 mr-1' />
                Send Verification Email
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
                    onClick={() => verifyEmailWithCode(storeEmailValue, emailVerificationCode)}
                    disabled={emailVerificationCode.length !== 6}
                    className='px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200'
                  >
                    Verify
                  </button>
                  <button
                    type='button'
                    onClick={() => sendEmailVerificationCode(storeEmailValue)}
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
        
        {/* Store Phone with Validation */}
        <div className='space-y-2'>
          <TextInput
            label='Store Phone'
            id='storePhone'
            name='storePhone'
            register={register as any}
            errors={errors as any}
            type='tel'
          />
          <div className='flex items-center gap-2 flex-wrap'>
            {phoneValidationStatus === 'idle' && (
              <button
                type='button'
                onClick={() => sendPhoneVerificationCode(storePhoneValue)}
                disabled={!storePhoneValue}
                className='px-3 py-1.5 text-xs font-medium bg-vesoko_dark_blue text-white rounded-md hover:bg-vesoko_green_600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200'
              >
                <MessageSquare className='inline-block w-4 h-4 mr-1' />
                Send Verification SMS
              </button>
            )}
            {phoneValidationStatus === 'sending' && (
              <div className='flex items-center gap-1 text-blue-600 text-sm'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                <span>Sending verification SMS...</span>
              </div>
            )}
            {(phoneValidationStatus === 'code-sent' || phoneValidationStatus === 'code-error') && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <input
                    type='text'
                    placeholder='Enter 6-digit code'
                    value={phoneVerificationCode}
                    onChange={(e) => setPhoneVerificationCode(e.target.value)}
                    className='px-2 py-1 text-sm border border-gray-300 rounded-md w-32'
                    maxLength={6}
                  />
                  <button
                    type='button'
                    onClick={() => verifyPhoneWithCode(storePhoneValue, phoneVerificationCode)}
                    disabled={phoneVerificationCode.length !== 6}
                    className='px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200'
                  >
                    Verify
                  </button>
                  <button
                    type='button'
                    onClick={() => sendPhoneVerificationCode(storePhoneValue)}
                    className='px-2 py-1.5 text-xs font-medium bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200'
                  >
                    Resend
                  </button>
                </div>
                {phoneValidationStatus === 'code-error' && verificationErrors.phone && (
                  <div className='flex items-center gap-1 text-red-600 text-sm'>
                    <AlertCircle className='h-4 w-4' />
                    <span>{verificationErrors.phone}</span>
                  </div>
                )}
              </div>
            )}
            {phoneValidationStatus === 'verifying' && (
              <div className='flex items-center gap-1 text-blue-600 text-sm'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                <span>Verifying code...</span>
              </div>
            )}
            {phoneValidationStatus === 'verified' && (
              <div className='flex items-center gap-1 text-green-600 text-sm'>
                <CheckCircle className='h-4 w-4' />
                <span>Phone verified!</span>
              </div>
            )}
            {phoneValidationStatus === 'invalid' && (
              <div className='flex items-center gap-1 text-red-600 text-sm'>
                <AlertCircle className='h-4 w-4' />
                <span>{verificationErrors.phone || 'Verification failed'}</span>
              </div>
            )}
          </div>
        </div>
        {/*Store logo */}
        <CloudinaryImageUpload
          label='Store Logo'
          className='sm:col-span-2' //span full row
          onResourceChange={handleLogoUpload} // Set mainImageResource on upload success
        />
        <StoreFormHeading heading='Store Address' />
        <AddressInput
          streetFieldName='storeStreet'
          cityFieldName='storeCity'
          stateFieldName='storeState'
          countryFieldName='storeCountry'
          zipFieldName='storeZipCode'
          register={register as any}
          errors={errors as any}
          control={control as any}
          setValue={setValue as any}
        />
      </div>
    </>
  );
};

export default StoreInfoInput;
