'use client';

import ErrorMessageModal from '@/components/ErrorMessageModal';
import PrimaryContactInput from '@/components/FormInputs/Store/PrimaryContactInput';
import ReviewInfoInput from '@/components/FormInputs/Store/ReviewInfoInput';
import StoreInfoInput from '@/components/FormInputs/Store/StoreInfoInput';
import VerificationDocsInput from '@/components/FormInputs/Store/VerificationDocsInput';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { handleError } from '@/utils/errorUtils';
import { CircleArrowLeft, CircleArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
  const [identityDocResource, setIdentityDocResource] = useState<any>(null);
  const [businessDocResource, setBusinessDocResource] = useState<any>(null);

  const sections = ['Primary Contact', 'Store Info', 'Docs', 'Review & Submit'];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const onSubmit = async (data: any) => {
    if (currentSection === sections.length - 1) {
      console.log(
        'Identity Doc Resource (Before Submit):',
        identityDocResource
      );
      console.log(
        'Business Doc Resource (Before Submit):',
        businessDocResource
      );
      if (!identityDocResource || !businessDocResource) {
        console.log('yvesssss');
        // setErrorMessage(
        //   'Please upload both identity document and business document.'
        // );
        alert('Please upload both identity document and business document.');

        return;
      }
      const storeApplicationData = {
        primaryContactInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          citizenshipCountry: data.citizenshipCountry,
          birthCountry: data.birthCountry,
          dob: data.dob,
          residenceAddress: {
            street: data.residenceStreet,
            city: data.residenceCity,
            state: data.residenceState,
            zipCode: data.residenceZipCode,
            country: data.residenceCountry,
          },
        },
        storeInfo: {
          storeType: data.storeType,
          registrationNumber: data.storeRegistrationNumber,
          name: data.storeName,
          category: data.storeCategory,
          description: data.storeDescription,
          email: data.storeEmail,
          phone: data.storePhone,
          address: {
            street: data.storeStreet,
            city: data.storeCity,
            state: data.storeState,
            zipCode: data.storeZipCode,
            country: data.storeCountry,
          },
        },
        verificationDocs: {
          businessDocument: businessDocResource.secure_url,
          primaryContactIdentityDocument: identityDocResource.secure_url,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const response = await createStoreApplication(storeApplicationData);
        console.log(response);
        if (response.status !== 201) {
          setSuccessMessage('');
          setErrorMessage(response.data.msg || 'Store application failed.');
        } else {
          setErrorMessage('');
          setSuccessMessage('Store application submitted successfully.');

          // TODO: Reset form inputs
          // reset();

          if (onSubmitSuccess) {
            onSubmitSuccess(response.data); // Call the callback with the response data
          }
        }
      } catch (error: any) {
        handleError(error);
        setErrorMessage(error);
      }
    } else {
      handleNext();
    }
  };

  return (
    <div className='bg-nezeza_powder_blue sm:px-2 md:px-4'>
      <form
        className='relative rounded-lg p-4 sm:p-6 md:p-8'
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
          {currentSection === 2 && (
            <VerificationDocsInput
              register={register}
              errors={errors}
              setIdentityDocResource={setIdentityDocResource}
              setBusinessDocResource={setBusinessDocResource}
            />
          )}
          {/* Review & Submit Section */}
          {currentSection === 3 && (
            <ReviewInfoInput
              getValues={getValues}
              identityDocResource={identityDocResource}
              businessDocResource={businessDocResource}
            />
          )}
        </div>

        {/* Absolute Positioned Navigation Arrows */}

        <button
          type='button'
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
          type='button'
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
              type='button'
              className='px-4 py-1 bg-gray-200 text-gray-700 rounded-md mr-2'
              onClick={() => setCurrentSection(currentSection - 1)}
            >
              Previous
            </button>
          )}
          {currentSection < sections.length - 1 && (
            <button
              type='button'
              className='bg-nezeza_dark_blue text-white px-4 py-1 rounded-md hover:bg-nezeza_yellow hover:text-black'
              onClick={handleNext}
            >
              Next
            </button>
          )}
          {currentSection === sections.length - 1 && (
            <button
              type='submit'
              className='bg-nezeza_green_600 text-white px-4 py-1 rounded-md hover:bg-nezeza_green_800'
              // onClick={() =>
              //   (window.location.href = '/post-store-application-submission')
              // }
              // onClick={handleNext}
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
