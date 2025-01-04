'use client';

import ErrorMessageModal from '@/components/ErrorMessageModal';
import DropdownInput from '@/components/FormInputs/DropdownInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import TextAreaInput from '@/components/FormInputs/TextAreaInput';
import TextInput from '@/components/FormInputs/TextInput';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import countries from './data/countries.json';
import { CircleArrowLeft, CircleArrowRight } from 'lucide-react';
import AddressInput from '@/components/FormInputs/AddressInput';
import PrimaryContactInput from '@/components/FormInputs/Store/PrimaryContactInput';
import BusinessInfoInput from '@/components/FormInputs/Store/BusinessInfoInput';
import BillingInfoInput from '@/components/FormInputs/Store/BillingInfoInput';
import VerificationDocsInput from '@/components/FormInputs/Store/VerificationDocsInput';
import StoreFormHeading from '@/components/FormInputs/Store/StoreFormHeading';
import ReviewInfoInput from '@/components/FormInputs/Store/ReviewInfoInput';
import { submitStoreData } from './utils/store/submitStoreData';
import { useSelector } from 'react-redux';
import { stateProps } from '../../type';

interface StoreRegistrationFormProps {
  onSubmitSuccess?: (data: any) => void; // Callback after successful submission
}

const StoreRegistrationForm = ({onSubmitSuccess}: StoreRegistrationFormProps) => {
 const {
   register,
   handleSubmit,
   formState: { errors },
   getValues,
   control,
   setValue,
   reset,
 } = useForm();
  
  const [currentSection, setCurrentSection] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  const onSubmit = async (data: any) => {
    const storeData = {
      ...data,
      // image: mainImageResource?.secure_url, // Main product image URL
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // owner: storeInfo._id,
    };

    try {
      const response = await submitStoreData(userInfo, storeData);
      setErrorMessage('');
      setSuccessMessage('Store data submitted for review successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);

      // TODO: Reset form inputs
      // reset();

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data); // Call the callback with the response data
      }
    } catch (error) {
      setErrorMessage('Error submitting store data.');
    }
  };

  return (
    <div className='w-full max-w-4xl mx-auto relative'>
      <form
        className='w-full max-w-4xl mx-auto bg-nezeza_light_blue border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 my-4'
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className='text-3xl text-nezeza_dark_blue font-bold text-center mb-4'>
          Nezeza Store Registration
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
          {/* Primary Contact Info Section */}
          {currentSection === 0 && (
            <PrimaryContactInput
              register={register}
              errors={errors}
              setValue={setValue}
              control={control}
            />
          )}
          {/* Business Info Section */}
          {currentSection === 1 && (
            <BusinessInfoInput
              register={register}
              errors={errors}
              control={control}
            />
          )}
          {/* Billing Info Section */}
          {currentSection === 2 && (
            <BillingInfoInput
              register={register}
              errors={errors}
              control={control}
            />
          )}
          {/* Verification Docs  Section */}
          {currentSection === 3 && (
            <VerificationDocsInput register={register} errors={errors} />
          )}
          {/* Review & Submit Section */}
          {currentSection === 4 && <ReviewInfoInput getValues={getValues} />}
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
          <CircleArrowLeft className='' />
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
          <CircleArrowRight className='' />
        </button>

        {/* Buttons for navigation */}
        <div className='flex justify-end mt-4'>
          {currentSection > 0 && (
            <button
              className='px-4 py-1 bg-gray-200 text-gray-700 rounded-md mr-2'
              onClick={() => setCurrentSection(currentSection - 1)}
            >
              Previous
            </button>
          )}
          {currentSection < sections.length - 1 ? (
            <button
              className='bg-nezeza_dark_blue text-white px-4 py-1 rounded-md hover:bg-nezeza_yellow hover:text-black'
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button
              type='submit'
              className='bg-nezeza_green_600 text-white px-4 py-1 rounded-md hover:bg-green-700'
              // onClick={() =>
              //   (window.location.href = '/post-store-application-submission')
              // }
            >
              SUBMIT
            </button>
          )}
        </div>
        {/* Success and Error Modals */}
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
        {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
      </form>
    </div>
  );
};
StoreRegistrationForm.noLayout = true;
export default StoreRegistrationForm;
