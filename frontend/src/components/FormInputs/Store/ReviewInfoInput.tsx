import React from 'react';
import StoreFormHeading from './StoreFormHeading';
import { FieldValues, UseFormGetValues } from 'react-hook-form';
import ReviewInputItem from './ReviewInputItem';

interface ReviewInfoInputProps {
  getValues: UseFormGetValues<FieldValues>;
  identityDocResource: any;
  businessDocResource: any;
}
const ReviewInfoInput = ({
  getValues,
  identityDocResource,
  businessDocResource,
}: ReviewInfoInputProps) => {
  return (
    <>
      <div className='space-y-4 px-4 sm:px-6'>
        <StoreFormHeading heading='Review Your Information' />

        {/* Display the collected data */}
        <div className='bg-gray-100 p-4 rounded-md'>
          <StoreFormHeading heading='Primary Contact Info' />
          <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6 w-full'>
            <ReviewInputItem
              label='First Name'
              fieldName='firstName'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Last Name'
              fieldName='lastName'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Email'
              fieldName='email'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Phone'
              fieldName='phone'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Country of Citizenship'
              fieldName='citizenshipCountry'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Country of Birth'
              fieldName='birthCountry'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Date of Birth'
              fieldName='dob'
              getValues={getValues}
              className='sm:col-span-2'
            />
            <StoreFormHeading heading='Residence Address' />
            <ReviewInputItem
              label='Street Address'
              fieldName='residenceStreet'
              getValues={getValues}
            />
            <ReviewInputItem
              label='City'
              fieldName='residenceCity'
              getValues={getValues}
            />
            <ReviewInputItem
              label='State'
              fieldName='residenceState'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Country'
              fieldName='residenceCountry'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Zip Code'
              fieldName='residenceZipCode'
              getValues={getValues}
            />
          </div>
        </div>

        <div className='bg-gray-100 p-4 rounded-md'>
          <StoreFormHeading heading='Store Info' />
          <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
            <ReviewInputItem
              label='Store Type'
              fieldName='storeType'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Store Registration Number'
              fieldName='storeRegistrationNumber'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Store Name'
              fieldName='storeName'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Store Category'
              fieldName='storeCategory'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Store Description'
              fieldName='storeDescription'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Store Email'
              fieldName='storeEmail'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Store Phone'
              fieldName='storePhone'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Store Logo'
              fieldName='storeLogo'
              getValues={getValues}
            />
            <StoreFormHeading heading='Store Address' />
            <ReviewInputItem
              label='Street Address'
              fieldName='storeStreet'
              getValues={getValues}
            />
            <ReviewInputItem
              label='City'
              fieldName='storeCity'
              getValues={getValues}
            />
            <ReviewInputItem
              label='State'
              fieldName='storeState'
              getValues={getValues}
            />

            <ReviewInputItem
              label='Country'
              fieldName='storeCountry'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Zip Code'
              fieldName='storeZipCode'
              getValues={getValues}
            />
          </div>
        </div>
        {/* <div className='bg-gray-100 p-4 rounded-md'>
          <StoreFormHeading heading='Verification Docs - TBD' />
        </div> */}
        <div className='bg-gray-100 p-4 rounded-md'>
          <StoreFormHeading heading='Verification Documents' />
          <div className='grid grid-cols-1 gap-y-2'>
            {identityDocResource && (
              <div className='mb-2'>
                <p className='text-sm font-semibold'>Identity Document:</p>
                <p className='text-sm'>
                  File Name: {identityDocResource.original_filename}
                </p>
                <p className='text-sm'>
                  <a
                    href={identityDocResource.secure_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 underline'
                  >
                    Download
                  </a>
                </p>
              </div>
            )}
            {businessDocResource && (
              <div className='mb-2'>
                <p className='text-sm font-semibold'>Business Document:</p>
                <p className='text-sm'>
                  File Name: {businessDocResource.original_filename}
                </p>
                <p className='text-sm'>
                  <a
                    href={businessDocResource.secure_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 underline'
                  >
                    Download
                  </a>
                </p>
              </div>
            )}
            {!identityDocResource && !businessDocResource ? (
              <p className='text-sm text-gray-500'>No documents uploaded.</p>
            ) : !identityDocResource ? (
              <p className='text-sm text-red-500'>
                No identity document uploaded.
              </p>
            ) : (
              !businessDocResource && (
                <p className='text-sm text-red-500'>
                  No business document uploaded.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewInfoInput;
