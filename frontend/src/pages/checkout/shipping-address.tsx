import ErrorMessageModal from '@/components/ErrorMessageModal';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import PageHeader from '@/components/PageHeader';
import RootLayout from '@/components/RootLayout';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { setShippingAddress } from '@/redux/nextSlice';
import { updateUserByEmail } from '@/utils/user/updateUser';
import { validateShippingAddress, isAddressComplete } from '@/utils/address/validateAddress';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddressProps, stateProps } from '../../../type';
import countries from '@/pages/data/countries.json';
import usStates from '@/pages/data/us_states.json';
import canadianProvinces from '@/pages/data/canadian_provinces.json';
import rwandanProvinces from '@/pages/data/rwandan_provinces.json';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import TextInput from '@/components/FormInputs/TextInput';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

const CheckoutAddressPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userInfo, cartItemsData, shippingAddress, buyNowProduct } = useSelector(
    (state: stateProps) => state.next
  );

  // Filter to only show US and Canada for now
  const allowedCountries = countries.filter(country => 
    country.code === 'US' || country.code === 'CA'
  );
  
  const countryOptions = allowedCountries.map((country) => ({
    value: country.code,
    label: country.name,
  }));

  const [selectedCountryOption, setSelectedCountryOption] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const [selectedStateOption, setSelectedStateOption] = useState<{
    value: string;
    label: string;
  } | null>(null);

  // State variables - declare before useEffect hooks
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationWarning, setValidationWarning] = useState('');
  const [isAutoValidating, setIsAutoValidating] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      street2: shippingAddress?.street2 || userInfo?.address?.street2 || '',
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
    // Set country dropdown selection
    const existingAddress = shippingAddress || userInfo?.address;
    if (existingAddress?.country) {
      const country = countries.find(c => c.code === existingAddress.country || c.name === existingAddress.country);
      if (country) {
        setSelectedCountryOption({
          value: country.code,
          label: country.name,
        });
        
        // Set state dropdown selection if applicable
        if (existingAddress.state && country.states) {
            let stateData: { abbreviation?: string; name: string }[] = [];
          switch (country.states) {
            case 'us_states':
              stateData = usStates;
              break;
            case 'canadian_provinces':
              stateData = canadianProvinces;
              break;
            case 'rwandan_provinces':
              stateData = rwandanProvinces;
              break;
          }
          
          const state = stateData.find(s => 
            s.abbreviation === existingAddress.state || 
            s.name === existingAddress.state
          );
          
          if (state) {
            setSelectedStateOption({
              value: state.abbreviation || state.name,
              label: state.name
            });
          }
        }
      }
    }
  }, [shippingAddress, userInfo, reset]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartItemsData?.length) {
      router.replace('/');
    }
  }, [cartItemsData, router]);

  // Check for error messages from URL params (when redirected from review page)
  useEffect(() => {
    if (router.query.error) {
      setErrorMessage(decodeURIComponent(router.query.error as string));
    }
    if (router.query.warning) {
      setValidationWarning(decodeURIComponent(router.query.warning as string));
    }
  }, [router.query]);

  // Auto-validate existing address if available
  useEffect(() => {
    const autoValidateExistingAddress = async () => {
      // Determine which address to validate (shipping address or user's saved address)
      const existingAddress = shippingAddress || userInfo?.address;
      
      if (!existingAddress) {
        // No existing address, show the form
        setShowForm(true);
        return;
      }

      // Check if address is complete (street2 requirement handled by validation)
      const hasAllRequiredFields = existingAddress.fullName &&
        existingAddress.street1 &&
        existingAddress.city &&
        existingAddress.state &&
        existingAddress.zip &&
        existingAddress.country;

      if (!hasAllRequiredFields) {
        // Address is incomplete, show the form
        setShowForm(true);
        return;
      }

      // Skip validation if address is already validated
      if (existingAddress.isValidated) {
        console.log('Address already validated, proceeding directly to review');
        dispatch(setShippingAddress(existingAddress));
        setTimeout(() => {
          router.push('/checkout/review');
        }, 500);
        return;
      }

      // Address looks complete, try to auto-validate it
      setIsAutoValidating(true);
      setSuccessMessage('Validating your saved address...');

      try {
        console.log('Auto-validating existing address:', existingAddress);
        const validationResult = await validateShippingAddress(existingAddress);
        
        if (validationResult.success && validationResult.valid) {
          // Address is valid, use it and proceed to review
          const finalAddress = validationResult.address || existingAddress;
          
          // Update user profile and Redux store with validated address
          await updateUserByEmail(userInfo?.email, { address: finalAddress });
          dispatch(setShippingAddress(finalAddress));
          
          setSuccessMessage('Address validated! Redirecting to order review...');
          setTimeout(() => {
            router.push('/checkout/review');
          }, 1500);
        } else {
          // Address validation failed, show form for re-entry
          setErrorMessage(
            validationResult.message || 
            'Your saved address could not be validated. Please verify and update it below.'
          );
          setShowForm(true);
        }
      } catch (error: any) {
        console.error('Auto-validation failed:', error);
        // Validation service failed, show form for manual entry
        setValidationWarning('Unable to validate your saved address. Please verify it below.');
        setShowForm(true);
      } finally {
        setIsAutoValidating(false);
      }
    };

    // Only auto-validate once when the component mounts or when cart changes
    if (cartItemsData?.length && !showForm && !isAutoValidating) {
      autoValidateExistingAddress();
    }
  }, [cartItemsData?.length, showForm, isAutoValidating]); // Removed problematic dependencies

  // Get state options based on selected country
  const getStateOptions = () => {
    if (!selectedCountryOption) return [];
    
    const selectedCountry = countries.find(c => c.code === selectedCountryOption.value);
    if (!selectedCountry?.states) return [];
    
    let stateData = [];
    switch (selectedCountry.states) {
      case 'us_states':
        stateData = usStates;
        break;
      case 'canadian_provinces':
        stateData = canadianProvinces;
        break;
      case 'rwandan_provinces':
        stateData = rwandanProvinces;
        break;
      default:
        return [];
    }
    
    return stateData.map((state: { name: string; abbreviation?: string }) => ({
      value: state.abbreviation ? state.abbreviation : state.name,
      label: state.name
    }));
  };

  const stateOptions = getStateOptions();
  const hasStateDropdown = stateOptions.length > 0;

  const handleCountryChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedCountryOption(option);
    // Reset state selection when country changes
    setSelectedStateOption(null);
    setValue('state', '');
  };

  const handleStateChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedStateOption(option);
    setValue('state', option?.value || '');
  };

  const onSubmit = async (data: any) => {
    setErrorMessage('');
    setSuccessMessage('');
    setValidationWarning('');

    // Check for form validation errors first
    if (Object.keys(errors).length > 0) {
      const errorFields = Object.keys(errors).join(', ');
      setErrorMessage(`Please fix the following errors: ${errorFields}`);
      return;
    }
    
    try {
      // Ensure country is properly set from the dropdown selection
      const addressData = {
        ...data,
        country: selectedCountryOption?.value || data.country || 'US' // Use country code (e.g., 'US', 'CA')
      };

      // Check if required dropdown selections are made
      if (!selectedCountryOption) {
        setErrorMessage('Please select a country.');
        return;
      }

      // For countries with state dropdowns, ensure state is selected
      if (hasStateDropdown && !selectedStateOption && !data.state) {
        setErrorMessage('Please select a state/province.');
        return;
      }

      // First check if the address has all required fields
      const completenessCheck = isAddressComplete(addressData, 'shipping');
      if (!completenessCheck.valid) {
        setErrorMessage(`Please fill in all required fields: ${completenessCheck.missingFields.join(', ')}`);
        return;
      }

      // Validate address with Shippo API via backend
      console.log('Validating address:', addressData);
      const validationResult = await validateShippingAddress(addressData);
      
      if (validationResult.success && validationResult.valid) {
        // Use the validated address if available, otherwise use original
        const finalAddress = validationResult.address || addressData;
        
        // Save to user profile and Redux store
        await updateUserByEmail(userInfo?.email, { address: finalAddress });
        dispatch(setShippingAddress(finalAddress));
        
        setSuccessMessage('Address validated and saved! Redirecting to order review...');
        setTimeout(() => {
          router.push('/checkout/review');
        }, 1200);
      } else {
        // Address validation failed but we can still proceed with a warning
        const warningMessage = validationResult.message || 'Address could not be fully validated';
        
        // Show warning and ask user to confirm
        setValidationWarning(`Warning: ${warningMessage}. You can continue, but shipping rates may be affected.`);
        
        // Still save the address for now - the backend will handle validation again
        await updateUserByEmail(userInfo?.email, { address: addressData });
        dispatch(setShippingAddress(addressData));
        
        // Add a delay before redirect to show the warning
        setTimeout(() => {
          router.push('/checkout/review');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Address submission error:', err);
      
      // If validation fails due to network/server issues, still allow proceeding
      if (err.message?.includes('validate') || err.message?.includes('network')) {
        setValidationWarning('Address validation service unavailable. Continuing with unvalidated address.');
        
        // Save address anyway and let backend handle validation
        const addressData = {
          ...data,
          country: selectedCountryOption?.value || data.country || 'US'
        };
        
        try {
          await updateUserByEmail(userInfo?.email, { address: addressData });
          dispatch(setShippingAddress(addressData));
          setTimeout(() => {
            router.push('/checkout/review');
          }, 2000);
        } catch (saveErr: any) {
          setErrorMessage('Failed to save address. Please try again.');
        }
      } else {
        setErrorMessage('Failed to process address. Please check your information and try again.');
      }
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
            <TextInput
              label='Full Name'
              id='fullName'
              name='fullName'
              register={register}
              errors={errors}
              type='text'
              isRequired = {true}
              // rules={{ required: 'Full name is required' }}
            />
            <TextInput
              label='Street Address'
              id='street1'
              name='street1'
              register={register}
              errors={errors}
              type='text'
              isRequired={true}
              // rules={{ required: 'Street address is required' }}
            />
            <TextInput
              label='Apt, Suite, etc. (required)'
              id='street2'
              name='street2'
              register={register}
              errors={errors}
              type='text'
              isRequired={true}
              placeholder='Apt, Suite, Unit, Building, Floor, etc. (required)'
            />
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <TextInput
                label='City'
                id='city'
                name='city'
                register={register}
                errors={errors}
                type='text'
                isRequired = {true}
                // rules={{ required: 'City is required' }}
              />
              {hasStateDropdown ? (
                <DropdownInputSearchable
                  label='State/Province'
                  id='state'
                  name='state'
                  value={selectedStateOption}
                  options={stateOptions}
                  onChange={handleStateChange}
                  register={register}
                  errors={errors}
                  isRequired = {true}
                  // rules={{ required: 'State/Province is required' }}
                />
              ) : (
                <TextInput
                  label='State/Province'
                  id='state'
                  name='state'
                  register={register}
                  errors={errors}
                  type='text'
                  isRequired = {true}
                  // rules={{ required: 'State/Province is required' }}
                />
              )}
              <TextInput
                label='Zip/Postal Code'
                id='zip'
                name='zip'
                register={register}
                errors={errors}
                type='text'
                isRequired = {true}
                // rules={{ required: 'Zip/Postal code is required' }}
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
              isRequired = {true}
              // rules={{ required: 'Country is required' }}
            />
            <TextInput
              label='Phone'
              id='phone'
              name='phone'
              type='tel'
              register={register}
              errors={errors}
              isRequired = {true}
              // rules={{ required: 'Phone number is required' }}
            />

            <SubmitButton
              isLoading={isSubmitting}
              buttonTitle='Continue to Review'
              className='w-full py-3 mt-6 bg-vesoko_primary text-white rounded-md hover:bg-vesoko_secondary transition-colors duration-300 text-lg font-semibold'
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
