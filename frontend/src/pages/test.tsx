import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import PrimaryContactInput from './PrimaryContactInput';
import BusinessInfoInput from './BusinessInfoInput';
import BillingInfoInput from './BillingInfoInput';
import VerificationDocsInput from './VerificationDocsInput';
import SuccessMessageModal from './SuccessMessageModal';
import ErrorMessageModal from './ErrorMessageModal';

const StoreSetupForm = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues, // Use this to get form values
    control,
  } = useForm();

  const sections = [
    'Primary Contact',
    'Business Info',
    'Billing Info',
    'Verification Docs',
    'Review & Submit',
  ];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
    }
  };

  const onSubmit: SubmitHandler<any> = (data) => {
    // Placeholder logic for form submission
    try {
      // Simulate successful submission
      setSuccessMessage('Store setup completed successfully.');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error submitting store setup.');
    }
  };

  return (
    <div className='w-full max-w-4xl mx-auto relative'>
      <form
        className='w-full max-w-4xl mx-auto bg-nezeza_light_blue border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 my-4'
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className='text-3xl text-nezeza_dark_blue font-bold text-center mb-4'>
          Nezeza Store Setup
        </h2>
        <p className='text-center mb-6 text-nezeza_gray_600'>
          Please fill in information as it appears on your official ID and
          registered business documents.
        </p>

        {/* Progress Bar */}
        <div className='flex justify-between items-center mb-6'>
          {sections.map((section, index) => (
            <div
              key={index}
              className={`flex-1 text-center cursor-pointer ${
                index <= currentSection
                  ? 'text-nezeza_green_800'
                  : 'text-gray-400'
              }`}
              onClick={() => setCurrentSection(index)}
            >
              <span className='font-semibold'>{section}</span>
              {index < sections.length - 1 && <span className='mx-2'>→</span>}
            </div>
          ))}
        </div>

        {/* Section Forms */}
        <div>
          {currentSection === 0 && <PrimaryContactInput register={register} />}
          {currentSection === 1 && <BusinessInfoInput register={register} />}
          {currentSection === 2 && <BillingInfoInput register={register} />}
          {currentSection === 3 && (
            <VerificationDocsInput register={register} />
          )}

          {/* Review & Submit Section */}
          {currentSection === 4 && (
            <div className='space-y-4'>
              <h3 className='text-xl font-semibold'>Review Your Information</h3>

              {/* Display the collected data */}
              <div className='bg-gray-100 p-4 rounded-md'>
                <h4 className='font-semibold'>Primary Contact</h4>
                <p>
                  Name: {getValues('firstName')} {getValues('lastName')}
                </p>
                <p>Email: {getValues('email')}</p>
                <p>Phone: {getValues('phone')}</p>
              </div>

              <div className='bg-gray-100 p-4 rounded-md'>
                <h4 className='font-semibold'>Business Info</h4>
                <p>Business Name: {getValues('businessName')}</p>
                <p>Business Type: {getValues('businessType')}</p>
                <p>Tax ID: {getValues('taxId')}</p>
              </div>

              <div className='bg-gray-100 p-4 rounded-md'>
                <h4 className='font-semibold'>Billing Info</h4>
                <p>Street: {getValues('street')}</p>
                <p>City: {getValues('city')}</p>
                <p>State: {getValues('state')}</p>
                <p>Zip Code: {getValues('zipCode')}</p>
              </div>

              <div className='bg-gray-100 p-4 rounded-md'>
                <h4 className='font-semibold'>Verification Docs</h4>
                <p>
                  Upload: {getValues('verificationDocs')?.length} files uploaded
                </p>
              </div>

              <div className='text-center'>
                <button
                  type='submit'
                  className='bg-nezeza_green_600 text-white px-6 py-2 rounded-md hover:bg-nezeza_green_800'
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Absolute Positioned Navigation Arrows */}
        <button
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 ${
            currentSection > 0 ? 'text-nezeza_dark_blue' : 'text-gray-400'
          }`}
          onClick={handlePrevious}
          disabled={currentSection === 0}
          style={{ fontSize: '1.5rem' }}
        >
          <CircleArrowLeft />
        </button>

        <button
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${
            currentSection < sections.length - 1
              ? 'text-nezeza_dark_blue'
              : 'text-gray-400'
          }`}
          onClick={handleNext}
          disabled={currentSection === sections.length - 1}
          style={{ fontSize: '1.5rem' }}
        >
          <CircleArrowRight />
        </button>
      </form>

      {/* Success and Error Modals */}
      {successMessage && (
        <SuccessMessageModal successMessage={successMessage} />
      )}
      {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
    </div>
  );
};

export default StoreSetupForm;
