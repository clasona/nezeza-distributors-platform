import React from 'react';
import StoreFormHeading from './StoreFormHeading';
import { FieldValues, UseFormGetValues } from 'react-hook-form';
import ReviewInputItem from './ReviewInputItem';

interface ReviewInfoInputProps {
  getValues: UseFormGetValues<FieldValues>;
}
const ReviewInfoInput = ({ getValues }: ReviewInfoInputProps) => {
  return (
    <>
      <div className='space-y-4'>
        <StoreFormHeading heading='Review Your Information' />

        {/* Display the collected data */}
        <div className='bg-gray-100 p-4 rounded-md'>
          <StoreFormHeading heading='Primary Contact Info' />
          <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
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
              fieldName='residenceZipcode'
              getValues={getValues}
            />
          </div>
        </div>

        <div className='bg-gray-100 p-4 rounded-md'>
          <StoreFormHeading heading='Business Info' />
          <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
            <ReviewInputItem
              label='Business Type'
              fieldName='businessType'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Business Registration Number'
              fieldName='businessRegistrationNumber'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Business Name'
              fieldName='storeName'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Business Category'
              fieldName='businessCategory'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Business Description'
              fieldName='businessDescription'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Business Email'
              fieldName='businessEmail'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Business Phone'
              fieldName='businessPhone'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Business Logo'
              fieldName='businessLogo'
              getValues={getValues}
            />
            <StoreFormHeading heading='Business Address' />
            <ReviewInputItem
              label='Street Address'
              fieldName='businessStreet'
              getValues={getValues}
            />
            <ReviewInputItem
              label='City'
              fieldName='businessCity'
              getValues={getValues}
            />
            <ReviewInputItem
              label='State'
              fieldName='businessState'
              getValues={getValues}
            />

            <ReviewInputItem
              label='Country'
              fieldName='businessCountry'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Zip Code'
              fieldName='businessZipcode'
              getValues={getValues}
            />
          </div>
        </div>

        <div className='bg-gray-100 p-4 rounded-md'>
          <StoreFormHeading heading='Bank Details' />
          <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
            <ReviewInputItem
              label='Routing Number'
              fieldName='routingNumber'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Account Number'
              fieldName='accountNumber'
              getValues={getValues}
            />
            <StoreFormHeading heading='Card Details' />
            <ReviewInputItem
              label="Cardholder's Full Name"
              fieldName='cardholderFullName'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Card Number'
              fieldName='cardNumber'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Expiration Date'
              fieldName='expirationDate'
              getValues={getValues}
            />
            <ReviewInputItem
              label='CVV'
              fieldName='cvv'
              getValues={getValues}
            />
            <StoreFormHeading heading='Billing Address' />
            <ReviewInputItem
              label='Street Address'
              fieldName='billingStreet'
              getValues={getValues}
            />
            <ReviewInputItem
              label='City'
              fieldName='billingCity'
              getValues={getValues}
            />
            <ReviewInputItem
              label='State'
              fieldName='billingState'
              getValues={getValues}
            />

            <ReviewInputItem
              label='Country'
              fieldName='billingCountry'
              getValues={getValues}
            />
            <ReviewInputItem
              label='Zip Code'
              fieldName='billingZipcode'
              getValues={getValues}
            />
          </div>
        </div>

        <div className='bg-gray-100 p-4 rounded-md'>
          <StoreFormHeading heading='Verification Docs - TBD' />
          {/* <p>Upload: {getValues('verificationDocs')?.length} files uploaded</p> */}
        </div>

        {/* <div className='text-center'>
                <button
                  type='submit'
                  className='bg-nezeza_green_600 text-white px-6 py-2 rounded-md hover:bg-nezeza_green_800'
                >
                  Submit
                </button>
              </div> */}
      </div>
    </>
  );
};

export default ReviewInfoInput;
