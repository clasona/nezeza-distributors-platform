import AddressInput from '@/components/FormInputs/AddressInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import PageHeader from '@/components/PageHeader';
import RootLayout from '@/components/RootLayout';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { setShippingAddress } from '@/redux/nextSlice';
import { validateShippingAddress } from '@/utils/address/validateAddress';
import { updateUserByEmail } from '@/utils/user/updateUser';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps } from '../../../type';
import usStates from '@/pages/data/us_states.json';

const CheckoutAddressPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userInfo, cartItemsData, shippingAddress, buyNowProduct } = useSelector(
    (state: stateProps) => state.next
  );


  // State variables - declare before useEffect hooks
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationWarning, setValidationWarning] = useState('');
  const [isAutoValidating, setIsAutoValidating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);

  // Use react-hook-form for all inputs
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm();

  // Helper function to normalize country codes/names to the format expected by AddressInput
  const normalizeCountry = (countryInput: string): string => {
    if (!countryInput) return '';
    
    // Country code to name mapping
    const countryMap: Record<string, string> = {
      'US': 'united states',
      'CA': 'canada', 
      'RW': 'rwanda'
    };
    
    const upperInput = countryInput.toUpperCase();
    if (countryMap[upperInput]) {
      return countryMap[upperInput];
    }
    
    // If it's not a code, assume it's a name and normalize to lowercase
    return countryInput.toLowerCase();
  };

  // Helper function to normalize state names using the JSON data
  const normalizeState = (stateInput: string, countryCode: string = ''): string => {
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

  // Helper function to convert country names back to codes for shipping validation
  const countryNameToCode = (countryName: string): string => {
    if (!countryName) return '';
    
    const nameToCodeMap: Record<string, string> = {
      'united states': 'US',
      'canada': 'CA',
      'rwanda': 'RW'
    };
    
    return nameToCodeMap[countryName.toLowerCase()] || countryName.toUpperCase();
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

  // Memoize address data to prevent infinite re-renders
  const initialAddressData = useMemo(() => {
    const rawCountry = shippingAddress?.country || userInfo?.address?.country || '';
    const rawState = shippingAddress?.state || userInfo?.address?.state || '';
    const normalizedCountry = normalizeCountry(rawCountry);
    
    return {
      name:
        shippingAddress?.name ||
        userInfo?.address?.name ||
        userInfo?.firstName ||
        '',
      street1: shippingAddress?.street1 || userInfo?.address?.street1 || '',
      street2: shippingAddress?.street2 || userInfo?.address?.street2 || '',
      city: shippingAddress?.city || userInfo?.address?.city || '',
      state: normalizeState(rawState, rawCountry), // Pass rawCountry instead of normalizedCountry
      zip: shippingAddress?.zip || userInfo?.address?.zip || '',
      country: normalizedCountry,
      phone: shippingAddress?.phone || userInfo?.address?.phone || '',
      email:
        shippingAddress?.email ||
        userInfo?.address?.email ||
        userInfo?.email ||
        '',
    };
  }, [shippingAddress, userInfo]);

  // Initialize form with existing address data only once
  useEffect(() => {
    if (!isFormInitialized) {
      reset(initialAddressData);
      setIsFormInitialized(true);
    }
  }, [initialAddressData, isFormInitialized]); // Remove 'reset' to prevent infinite loops

  // Redirect if no items (cart or buy now)
  useEffect(() => {
    // For Buy Now flow, check buyNowProduct; for cart flow, check cartItemsData
    const hasItems = (buyNowProduct && buyNowProduct.isBuyNow) || (cartItemsData?.length > 0);
    
    if (!hasItems) {
      console.log('No items found, redirecting to home. buyNowProduct:', buyNowProduct, 'cartItemsData:', cartItemsData?.length);
      router.replace('/');
    }
  }, [cartItemsData, buyNowProduct, router]);

  // Check for error messages from URL params (when redirected from review page)
  useEffect(() => {
    if (router.query.error) {
      setErrorMessage(decodeURIComponent(router.query.error as string));
    }
    if (router.query.warning) {
      setValidationWarning(decodeURIComponent(router.query.warning as string));
    }
  }, [router.query]);

  // Auto-validate existing address: if valid, redirect to review; else, show form
  useEffect(() => {
    const isEditMode = router.query.edit === 'true';
    const hasBasicFields = initialAddressData &&
      initialAddressData.name &&
      initialAddressData.street1 &&
      initialAddressData.city &&
      initialAddressData.state &&
      initialAddressData.zip &&
      initialAddressData.country;

    if (isEditMode) {
      setShowForm(true);
      return;
    }

    if (hasBasicFields) {
      // Actually validate the address with the backend
      setIsAutoValidating(true);
      
      const validateExistingAddress = async () => {
        try {
          const countryCode = countryNameToCode(initialAddressData.country);
          const stateCode = stateNameToCode(initialAddressData.state, countryCode);
          
          const addressForValidation = {
            ...initialAddressData,
            country: countryCode,
            state: stateCode
          };
          
          const result = await validateShippingAddress(addressForValidation);
          
          if (result.success && result.valid) {
            // Address is valid, redirect to review
            router.push('/checkout/review');
          } else {
            // Address is invalid, show form with error
            const errorMessage = result.error || result.message || 'Address validation failed';
            setErrorMessage(`Invalid shipping address: ${errorMessage}`);
            setShowForm(true);
          }
        } catch (error) {
          console.error('Auto-validation error:', error);
          setErrorMessage('Failed to validate address. Please check and update your information.');
          setShowForm(true);
        } finally {
          setIsAutoValidating(false);
        }
      };
      
      validateExistingAddress();
    } else {
      setShowForm(true);
    }
  }, [router.query.edit, initialAddressData, router]);

  // Handle address validation completion from AddressInput
  const handleAddressValidation = (isValid: boolean, validatedAddress?: any, error?: string) => {
    setHasAttemptedValidation(true);
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
    setErrorMessage('');
    setSuccessMessage('');
    setValidationWarning('');

    try {
      // Convert form data back to proper codes for shipping validation
      const countryCode = countryNameToCode(data.country);
      const stateCode = stateNameToCode(data.state, countryCode);
      
      const addressForSaving = {
        ...data,
        country: countryCode, // Convert back to country code (e.g., "US", "CA")
        state: stateCode, // Convert back to state code for US (e.g., "IL", "CA")
      };
      
      console.log('Saving address with codes:', addressForSaving);
      
      // Save to user profile and Redux store with proper codes
      await updateUserByEmail(userInfo?.email, { address: addressForSaving });
      dispatch(setShippingAddress(addressForSaving));
      
      setSuccessMessage('Address saved! Redirecting to order review...');
      setTimeout(() => {
        router.push('/checkout/review');
      }, 1200);
    } catch (err: any) {
      console.error('Address submission error:', err);
      setErrorMessage('Failed to save address. Please try again.');
    }
  };

  // Check if we have items (cart or buy now)
  const hasItems = (buyNowProduct && buyNowProduct.isBuyNow) || (cartItemsData?.length > 0);
  
  if (!hasItems) {
    return (
      <RootLayout>
        <div className='flex items-center justify-center min-h-[calc(100vh-100px)]'>
          <p>No items found. Redirecting...</p>
        </div>
      </RootLayout>
    );
  }

  // Show loading state during auto-validation
  if (isAutoValidating) {
    return (
      <RootLayout>
        <div className='bg-vesoko_primary min-h-[calc(100vh-100px)] flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-vesoko_primary mx-auto mb-4'></div>
            <h2 className='text-xl font-semibold text-vesoko_primary mb-2'>Validating Address</h2>
            <p className='text-gray-600'>Checking your saved address for shipping compatibility...</p>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Show form only if auto-validation is complete and form should be shown
  if (!showForm && !isAutoValidating) {
    return (
      <RootLayout>
        <div className='bg-vesoko_primary min-h-[calc(100vh-100px)] flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-vesoko_primary mx-auto mb-4'></div>
            <h2 className='text-xl font-semibold text-vesoko_primary mb-2'>Loading</h2>
            <p className='text-gray-600'>Preparing your checkout...</p>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className='bg-vesoko_primary min-h-[calc(100vh-100px)] p-2 sm:p-4 md:p-8 flex items-center justify-center'>
        <div className='bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl max-w-2xl w-full'>
          <PageHeader heading='Enter Shipping Address' />
          
          {(errorMessage || validationWarning) && (
            <div className='mb-4'>
              {/* Error message as text not on modal */}
              {errorMessage && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg mb-2'>
                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                        <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-red-800'>{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              {validationWarning && (
                <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <svg className='h-5 w-5 text-yellow-400' viewBox='0 0 20 20' fill='currentColor'>
                        <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                        </svg>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-yellow-800'>{validationWarning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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
            {hasAttemptedValidation && !isAddressValid && (
              <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg mt-4'>
                <div className='flex items-start'>
                  <div className='flex-shrink-0'>
                    <svg className='h-5 w-5 text-amber-400' viewBox='0 0 20 20' fill='currentColor'>
                      <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-amber-800'>
                      Please validate your address before continuing. Click "Validate Address" and resolve any issues.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <SubmitButton
              isLoading={isSubmitting}
              buttonTitle={hasAttemptedValidation && !isAddressValid ? 'Please Validate Address First' : 'Continue to Review'}
              className={`w-full py-3 mt-6 text-white rounded-md transition-colors duration-300 text-lg font-semibold ${
                hasAttemptedValidation && !isAddressValid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-vesoko_primary hover:bg-vesoko_secondary'
              }`}
              disabled={isSubmitting || (hasAttemptedValidation && !isAddressValid)}
            />
          </form>

          <div className='mt-4 text-gray-500 text-sm'>
            <span>
              <strong>Note:</strong> This is a one-time step. Your shipping
              address will be securely added to your file for future checkouts.
            </span>
          </div>

          {/* Back to cart/products link */}
          <div className='mt-4 text-center'>
            <Link 
              href={buyNowProduct && buyNowProduct.isBuyNow ? '/' : '/cart'}
              className='text-vesoko_primary hover:underline text-sm'
            >
              ← {buyNowProduct && buyNowProduct.isBuyNow ? 'Back to Products' : 'Back to Cart'}
            </Link>
          </div>

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
