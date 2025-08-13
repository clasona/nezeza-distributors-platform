import React from 'react';
import Image from 'next/image';
import StoreFormHeading from './StoreFormHeading';
import { UseFormGetValues } from 'react-hook-form';
import ReviewInputItem from './ReviewInputItem';
import { StoreApplicationFormData } from '@/types/storeApplication';
import Link from 'next/link';

interface ReviewInfoInputProps {
  getValues: UseFormGetValues<StoreApplicationFormData>;
  identityDocResource: any;
  businessDocResource: any;
  storeLogoResource?: any;
}
const ReviewInfoInput = ({
  getValues,
  identityDocResource,
  businessDocResource,
  storeLogoResource,
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
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Last Name'
              fieldName='lastName'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Email'
              fieldName='email'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Phone'
              fieldName='phone'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Country of Citizenship'
              fieldName='citizenshipCountry'
              getValues={getValues as any}
            />
            {/* <ReviewInputItem
              label='Country of Birth'
              fieldName='birthCountry'
              getValues={getValues}
            /> */}
            <ReviewInputItem
              label='Date of Birth'
              fieldName='dob'
              getValues={getValues as any}
              className='sm:col-span-2'
            />
            <StoreFormHeading heading='Residence Address' />
            <ReviewInputItem
              label='Street Address'
              fieldName='residenceStreet'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='City'
              fieldName='residenceCity'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='State'
              fieldName='residenceState'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Country'
              fieldName='residenceCountry'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Zip Code'
              fieldName='residenceZipCode'
              getValues={getValues as any}
            />
          </div>
        </div>

        <div className='bg-gray-100 p-4 rounded-md'>
          <StoreFormHeading heading='Store Info' />
          <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
            <ReviewInputItem
              label='Store Type'
              fieldName='storeType'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Store Registration Number'
              fieldName='storeRegistrationNumber'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Store Name'
              fieldName='storeName'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Store Category'
              fieldName='storeCategory'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Store Description'
              fieldName='storeDescription'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Store Email'
              fieldName='storeEmail'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Store Phone'
              fieldName='storePhone'
              getValues={getValues as any}
            />
            {/* Store Logo - Show image if available */}
            <div className='sm:col-span-2'>
              <p className='mb-2'>
                <span className='text-gray-500'>Store Logo:</span>
              </p>
              {storeLogoResource ? (
                <div className='flex items-center gap-4 p-3 bg-gray-50 rounded-lg border'>
                  <Image 
                    src={storeLogoResource.secure_url} 
                    alt='Store Logo' 
                    width={64}
                    height={64}
                    className='w-16 h-16 object-cover rounded-lg border border-gray-200'
                  />
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      {storeLogoResource.original_filename || 'Store Logo'}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {storeLogoResource.format?.toUpperCase()} • {Math.round((storeLogoResource.bytes || 0) / 1024)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className='p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                  <p className='text-sm text-gray-500 italic'>No logo uploaded</p>
                </div>
              )}
            </div>
            <StoreFormHeading heading='Store Address' />
            <ReviewInputItem
              label='Street Address'
              fieldName='storeStreet'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='City'
              fieldName='storeCity'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='State'
              fieldName='storeState'
              getValues={getValues as any}
            />

            <ReviewInputItem
              label='Country'
              fieldName='storeCountry'
              getValues={getValues as any}
            />
            <ReviewInputItem
              label='Zip Code'
              fieldName='storeZipCode'
              getValues={getValues as any}
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
                  <Link
                    href={identityDocResource.secure_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 underline'
                  >
                    Download
                  </Link>
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
                  <Link
                    href={businessDocResource.secure_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 underline'
                  >
                    Download
                  </Link>
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
