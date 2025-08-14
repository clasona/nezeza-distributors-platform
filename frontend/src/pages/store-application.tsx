'use client';

import Link from 'next/link';
import ErrorMessageModal from '@/components/ErrorMessageModal';
import PrimaryContactInput from '@/components/FormInputs/Store/PrimaryContactInput';
import ReviewInfoInput from '@/components/FormInputs/Store/ReviewInfoInput';
import StoreInfoInput from '@/components/FormInputs/Store/StoreInfoInput';
import VerificationDocsInput from '@/components/FormInputs/Store/VerificationDocsInput';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { handleError } from '@/utils/errorUtils';
import { CircleArrowLeft, CircleArrowRight, ArrowLeft, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createStoreApplication } from '../utils/store/createStoreApplication';
import { useRouter } from 'next/navigation';
import { StoreApplicationFormData } from '@/types/storeApplication';
import { useCallback } from 'react';
import AutoSaveIndicator from '@/components/AutoSaveIndicator';
import RestoreDataModal from '@/components/RestoreDataModal';
import { validateShippingAddress, AddressData } from '@/utils/address/validateAddress';

interface StoreRegistrationFormProps {
  onSubmitSuccess?: (data: any) => void; // Callback after successful submission
}

const StoreRegistrationForm = ({
  onSubmitSuccess,
}: StoreRegistrationFormProps) => {
  const methods = useForm<StoreApplicationFormData>({
    mode: 'onChange', // This will validate on every change
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      citizenshipCountry: '',
      dob: '',
      residenceStreet: '',
      residenceStreet2: '',
      residenceCity: '',
      residenceState: '',
      residenceCountry: '',
      residenceZipCode: '',
      storeType: '',
      storeRegistrationNumber: '',
      storeName: '',
      storeCategory: '',
      storeDescription: '',
      storeEmail: '',
      storePhone: '',
      storeStreet: '',
      storeStreet2: '',
      storeCity: '',
      storeState: '',
      storeCountry: '',
      storeZipCode: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    control,
    setValue,
    reset,
    trigger,
    clearErrors,
  } = methods;

  const [currentSection, setCurrentSection] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [identityDocResource, setIdentityDocResource] = useState<any>(null);
  const [businessDocResource, setBusinessDocResource] = useState<any>(null);
  const [storeLogoResource, setStoreLogoResource] = useState<any>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | undefined>();
  const [savedFieldCount, setSavedFieldCount] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [documentsError, setDocumentsError] = useState('');
  const router = useRouter();

  const sections = ['Primary Contact', 'Store Info', 'Docs', 'Review & Submit'];

  // Custom auto-save that includes document resources
  const saveFormData = useCallback(() => {
    const formData = getValues();
    const saveData = {
      formData,
      identityDocResource,
      businessDocResource,
      storeLogoResource,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('store-application-form', JSON.stringify(saveData));
      setIsAutoSaving(true);
      setTimeout(() => {
        setIsAutoSaving(false);
        setLastSavedTime(Date.now());
        setSavedFieldCount(Object.keys(formData).length + 
          (identityDocResource ? 1 : 0) + 
          (businessDocResource ? 1 : 0) + 
          (storeLogoResource ? 1 : 0));
      }, 500);
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  }, [getValues, identityDocResource, businessDocResource, storeLogoResource]);

  const loadFormData = useCallback(() => {
    try {
      const stored = localStorage.getItem('store-application-form');
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Check if data is too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > maxAge) {
        localStorage.removeItem('store-application-form');
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.warn('Failed to load form data:', error);
      localStorage.removeItem('store-application-form');
      return null;
    }
  }, []);

  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem('store-application-form');
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  }, []);

  const hasSavedData = useCallback((): boolean => {
    return loadFormData() !== null;
  }, [loadFormData]);

  const getSavedDataInfo = useCallback(() => {
    const savedData = loadFormData();
    if (!savedData) return null;
    
    const fieldCount = Object.keys(savedData.formData || {}).length +
      (savedData.identityDocResource ? 1 : 0) +
      (savedData.businessDocResource ? 1 : 0) +
      (savedData.storeLogoResource ? 1 : 0);
    
    return {
      timestamp: savedData.timestamp,
      fieldCount,
      age: Date.now() - savedData.timestamp
    };
  }, [loadFormData]);

  // Auto-save form data whenever it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveFormData();
    }, 2000); // Save 2 seconds after changes stop

    return () => clearTimeout(timeoutId);
  }, [saveFormData]);

  // Restore saved data on component mount
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      // Restore form fields
      Object.entries(savedData.formData || {}).forEach(([fieldName, value]) => {
        setValue(fieldName as any, value);
      });
      
      // Restore document resources
      if (savedData.identityDocResource) {
        setIdentityDocResource(savedData.identityDocResource);
      }
      if (savedData.businessDocResource) {
        setBusinessDocResource(savedData.businessDocResource);
      }
      if (savedData.storeLogoResource) {
        setStoreLogoResource(savedData.storeLogoResource);
        setValue('storeLogo', savedData.storeLogoResource.secure_url);
      }
      
      // Show restore modal
      const info = getSavedDataInfo();
      if (info && info.fieldCount > 0) {
        setShowRestoreModal(true);
        setSavedFieldCount(info.fieldCount);
        setLastSavedTime(info.timestamp);
      }
    }
  }, []);

  const handleNext = async () => {
    const isStepValid = await trigger(); // triggers validation for current fields
    
    // Additional validation for Primary Contact section (section 0) - verify primary contact email    
    if (currentSection === 0) {
      let errorMsg = '';
      if (!emailVerified) {
        errorMsg = 'Please verify your primary contact email before proceeding.';
      }
      // COMMENTED OUT - Phone verification not required for now
      // if (!phoneVerified) {
      //   errorMsg = 'Please verify your phone before proceeding.';
      // }
      if (errorMsg) {
        setVerificationError(errorMsg);
        return; // Don't proceed
      } else {
        setVerificationError(''); // Clear any previous error
      }
    }
    

    // Check that documents are uploaded for Docs section (section 2)
    if (currentSection === 2) {
      if (!identityDocResource || !businessDocResource) {
        setDocumentsError('Please upload both identity and business documents before proceeding.');
        return;
      } else {
        setDocumentsError('');
      }
    }
    
    if (isStepValid && currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const onSubmit = async (data: StoreApplicationFormData) => {
    if (!identityDocResource || !businessDocResource) {
      alert('Please upload both identity document and business document.');
      return;
    }
    const storeApplicationData = {
      status: 'Pending',
      primaryContactInfo: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        citizenshipCountry: data.citizenshipCountry,
        birthCountry: data.citizenshipCountry, // Use citizenshipCountry as birthCountry for now
        dob: data.dob,
        residenceAddress: {
          street: data.residenceStreet,
          street1: data.residenceStreet, // For Shippo API compatibility
          street2: data.residenceStreet2 || '', // Optional second address line
          city: data.residenceCity,
          state: data.residenceState,
          zip: data.residenceZipCode,
          country: data.residenceCountry,
          phone: data.phone, // For Shippo API compatibility
        },
      },
      storeInfo: {
        storeType: data.storeType,
        registrationNumber: data.storeRegistrationNumber || '', // Keep as string to support EIN format with dashes
        name: data.storeName,
        category: data.storeCategory,
        description: data.storeDescription,
        email: data.storeEmail,
        phone: data.storePhone,
        logo: data.storeLogo || (storeLogoResource ? storeLogoResource.secure_url : ''),
        address: {
          street: data.storeStreet,
          street1: data.storeStreet, // For Shippo compatibility
          street2: data.storeStreet2 || '', // Optional second address line
          city: data.storeCity,
          state: data.storeState,
          zip: data.storeZipCode,
          country: data.storeCountry,
          phone: data.storePhone,
        },
      },
      verificationDocs: {
        businessDocument: businessDocResource.secure_url,
        primaryContactIdentityDocument: identityDocResource.secure_url,
      },
    };

    try {
      console.log('Submitting store application:', storeApplicationData);
      const response = await createStoreApplication(storeApplicationData);
      if (response.status !== 201) {
        setSuccessMessage('');
        setErrorMessage(response.data.msg || 'Store application failed.');
      } else {
        setErrorMessage('');
        // Clear saved data after successful submission
        clearSavedData();

        // Reset form state
        setIdentityDocResource(null);
        setBusinessDocResource(null);
        setStoreLogoResource(null);
        
        if (onSubmitSuccess) {
          onSubmitSuccess(response.data); // Call the callback with the response data
        }

        // Navigate to success page immediately without showing modal
        router.push('/post-store-application-submission');
      }
    } catch (error: any) {
      handleError(error);
      // setErrorMessage(error);
      alert(error || 'An unexpected error occurred.');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-vesoko_primary50 via-white to-purple-50'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link 
            href='/select-store-type'
            className='inline-flex items-center gap-2 text-vesoko_primary hover:text-vesoko_primary font-medium mb-8 transition-colors duration-200'
          >
            <ArrowLeft className='h-5 w-5' />
            Back to Store Type
          </Link>
          
          <div className='inline-flex items-center gap-2 bg-vesoko_background text-vesoko_secondary px-4 py-2 rounded-full text-sm font-medium mb-6'>
            <FileText className='h-4 w-4' />
            Store Application Form
          </div>
          
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
            Tell Us About
            <span className='block text-vesoko_primary'>Your Business</span>
          </h1>
          
          <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8'>
            Please provide accurate information as it appears on your official documents. 
            This helps us verify your business and set up your store correctly.
          </p>
        </div>

        <form
          className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Progress Bar */}
          <div className='bg-gradient-to-r from-vesoko_primary to-vesoko_primary px-8 py-6'>
            <div className='flex items-center justify-between mb-4'>
              {sections.map((section, index) => {
                const isActive = index === currentSection;
                const isCompleted = index < currentSection;
                
                return (
                  <div key={index} className='flex items-center flex-1'>
                    <div className='flex items-center'>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isActive 
                            ? 'bg-white text-vesoko_primary' 
                            : 'bg-white/20 text-white/60'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <span className={`ml-3 text-sm font-medium transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-white/70'
                      }`}>
                        {section}
                      </span>
                    </div>
                    {index < sections.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                        isCompleted ? 'bg-green-400' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            
          <div className='flex items-center justify-between'>
            <div className='text-white text-sm'>
              Step {currentSection + 1} of {sections.length} - {sections[currentSection]}
            </div>
            <AutoSaveIndicator
              isAutoSaving={isAutoSaving}
              lastSavedTime={lastSavedTime}
              savedFieldCount={savedFieldCount}
              onClearSavedData={() => {
                clearSavedData();
                setLastSavedTime(undefined);
                setSavedFieldCount(0);
              }}
              className='text-white/80'
            />
          </div>
          </div>

          <div className='p-8 relative'>
            {/* Form Sections*/}
            <div>
              {/* Primary Contact Info Section */}
              {currentSection === 0 && (
                <>
                  <PrimaryContactInput
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    control={control}
                    onVerificationStatusChange={(emailVerified, phoneVerified) => {
                      setEmailVerified(emailVerified);
                      setPhoneVerified(phoneVerified);
                      // Clear error when email is verified (phone verification not required for now)
                      if (emailVerified) {
                        setVerificationError('');
                      }
                    }}
                  />
                  {/* Verification Error Message */}
                  {verificationError && (
                    <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0'>
                          <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                          </svg>
                        </div>
                        <div className='ml-3'>
                          <p className='text-sm font-medium text-red-800'>
                            {verificationError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {/* Store Info Section */}
              {currentSection === 1 && (
                <>
                  <StoreInfoInput
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    control={control}
                    getValues={getValues}
                    setStoreLogoResource={setStoreLogoResource}
                    onVerificationStatusChange={(emailVerified, phoneVerified) => {
                      setEmailVerified(emailVerified);
                      setPhoneVerified(phoneVerified);
                      // Clear error when both are verified
                      if (emailVerified && phoneVerified) {
                        setVerificationError('');
                      }
                    }}
                  />
                  {/* Verification Error Message */}
                  {verificationError && (
                    <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0'>
                          <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                          </svg>
                        </div>
                        <div className='ml-3'>
                          <p className='text-sm font-medium text-red-800'>
                            {verificationError}
                          </p>
                        </div>
                      </div>
                    </div>
              )}
            </>
          )}
          {/* Verification Docs  Section */}
          {currentSection === 2 && (
            <>
              <VerificationDocsInput
                register={register}
                errors={errors}
                setIdentityDocResource={setIdentityDocResource}
                setBusinessDocResource={setBusinessDocResource}
                identityDocResource={identityDocResource}
                businessDocResource={businessDocResource}
              />
              {/* Documents Error Message */}
              {documentsError && (
                <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-red-800'>
                        {documentsError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {/* Review & Submit Section */}
          {currentSection === 3 && (
            <ReviewInfoInput
              getValues={getValues}
              identityDocResource={identityDocResource}
              businessDocResource={businessDocResource}
              storeLogoResource={storeLogoResource}
            />
              )}
            </div>

            {/* Absolute Positioned Navigation Arrows */}
            <button
              type='button'
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 ${
                currentSection > 0 ? 'text-vesoko_primary' : 'text-gray-400'
              }`}
              onClick={handlePrevious}
              disabled={currentSection === 0}
              style={{ fontSize: '1.5rem' }}
            >
              <CircleArrowLeft />
            </button>

            <button
              type='button'
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${
                currentSection < sections.length - 1
                  ? 'text-vesoko_primary'
                  : 'text-gray-400'
              }`}
              onClick={handleNext}
              disabled={currentSection === sections.length - 1}
              style={{ fontSize: '1.5rem' }}
            >
              <CircleArrowRight className='' />
            </button>

            {/* Buttons for navigation */}
            <div className='flex justify-end mt-8'>
              {currentSection > 0 && (
                <button
                  type='button'
                  className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg mr-4 hover:bg-gray-300 transition-colors duration-200'
                  onClick={() => setCurrentSection(currentSection - 1)}
                >
                  Previous
                </button>
              )}
              {currentSection < sections.length - 1 && (
                <button
                  type='button'
                  className='bg-vesoko_primary text-white px-6 py-2 rounded-lg hover:bg-vesoko_primary transition-colors duration-200'
                  onClick={handleNext}
                >
                  Next
                </button>
              )}
              {currentSection === sections.length - 1 && (
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className={`${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-vesoko_primary hover:bg-vesoko_secondary'
                  } text-white px-6 py-2 rounded-lg transition-colors duration-200`}
                >
                  {isSubmitting ? 'Submitting...' : 'SUBMIT APPLICATION'}
                </button>
              )}
            </div>
          </div>
        </form>
        
        {/* Success and Error Modals */}
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
        {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
        
        {/* Restore data modal */}
        <RestoreDataModal
          isOpen={showRestoreModal}
          onClose={() => setShowRestoreModal(false)}
          onKeepData={() => {
            setShowRestoreModal(false);
            // Data is already restored in the useEffect
          }}
          onDiscardData={() => {
            clearSavedData();
            setShowRestoreModal(false);
            setLastSavedTime(undefined);
            setSavedFieldCount(0);
            // Reset form and document states
            reset();
            setIdentityDocResource(null);
            setBusinessDocResource(null);
            setStoreLogoResource(null);
          }}
          savedFieldCount={savedFieldCount}
          savedTime={lastSavedTime || Date.now()}
        />
      </div>
    </div>
  );
};
StoreRegistrationForm.noLayout = true;
export default StoreRegistrationForm;
