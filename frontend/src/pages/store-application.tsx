'use client';

import ErrorMessageModal from '@/components/ErrorMessageModal';
import PrimaryContactInput from '@/components/FormInputs/Store/PrimaryContactInput';
import ReviewInfoInput from '@/components/FormInputs/Store/ReviewInfoInput';
import StoreInfoInput from '@/components/FormInputs/Store/StoreInfoInput';
import VerificationDocsInput from '@/components/FormInputs/Store/VerificationDocsInput';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { CircleArrowLeft, CircleArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import {
  AddressProps,
  NewStoreProps,
  stateProps,
} from '../../type';
import { createStore } from '../utils/store/createStore';
import { createStoreApplication } from '../utils/store/createStoreApplication';

interface StoreRegistrationFormProps {
  onSubmitSuccess?: (data: any) => void; // Callback after successful submission
}

const StoreRegistrationForm = ({
  onSubmitSuccess,
}: StoreRegistrationFormProps) => {
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
    'Store Info',
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
    //change default customer role to role of current user?

    // Create the store first
    const storeAddress: AddressProps = {
      street: data.storeStreet,
      city: data.storeCity,
      state: data.storeState,
      country: data.storeCountry,
      zipCode: data.storeZipCode,
    };

    const storePayload: NewStoreProps = {
      name: data.storeName,
      email: data.storeEmail,
      description: data.storeDescription,
      ownerId: userInfo._id,
      storeType: data.storeType,
      registrationNumber: data.storeRegistrationNumber,
      category: data.storeCategory,
      phone: data.storePhone,
      // logo
      address: storeAddress,
      isActive: false,
    };

    const storeResponse = await createStore(storePayload);

    const { storeId } = storeResponse; // Extract the created store's ID

    console.log(storeId);

    // Use the storeId to create the store application
    const storeApplicationData = {
      ...data,
      primaryContactId: userInfo._id,
      storeId: storeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await createStoreApplication(
        userInfo,
        storeApplicationData
      );
      setErrorMessage('');
      setSuccessMessage('Store application submitted successfully.');
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
    <div className='bg-nezeza_powder_blue sm:px-2 md:px-4'>
      <form
        className='relative rounded-lg sm:p-6 md:p-8'
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className='text-3xl text-nezeza_dark_blue font-bold text-center mb-4'>
          Nezeza Store Application
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
          {/* Store Info Section */}
          {currentSection === 1 && (
            <StoreInfoInput
              register={register}
              setValue={setValue}
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
