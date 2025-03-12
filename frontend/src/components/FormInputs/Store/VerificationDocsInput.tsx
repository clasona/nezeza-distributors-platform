import React, { useState } from 'react';
import CloudinaryFileUpload from '../../FormInputs/CloudinaryFileUpload';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import StoreFormHeading from './StoreFormHeading';

interface VerificationDocsInputProps {
  errors: FieldErrors;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  setIdentityDocResource: (resource: any) => void;
  setBusinessDocResource: (resource: any) => void;
}

const VerificationDocsInput = ({
  register,
  errors,
  setIdentityDocResource,
  setBusinessDocResource,
}: VerificationDocsInputProps) => {
  const [localIdentityDocResource, setLocalIdentityDocResource] =
    useState<any>(null);
  const [localBusinessDocResource, setLocalBusinessDocResource] =
    useState<any>(null);

    const handleIdentityDocChange = (resource: any) => {
      setLocalIdentityDocResource(resource);
      setIdentityDocResource(resource); // Update parent state
    };

    const handleBusinessDocChange = (resource: any) => {
      setLocalBusinessDocResource(resource);
      setBusinessDocResource(resource); // Update parent state
    };
  
  return (
    <div className='w-full'>
      <div className='max-w-3xl mx-auto p-4'>
        <StoreFormHeading heading='Business Verification Documents' />

        <div className='bg-gray-100 p-4 rounded-md mb-4 mt-4'>
          <p className='font-semibold mb-2'>Important</p>
          <p className='mb-2'>Documents must be:</p>

          <ul className='list-disc list-inside'>
            <li>Valid and representative of up-to-date registration</li>
            <li>Clear and large enough to read</li>
            <li>Can be uploaded in .pdf format</li>
          </ul>
        </div>

        <div className='mb-4'>
          <h2 className='text-lg font-semibold mb-2'>
            1. Primary Contact Identity Document
          </h2>
          <p className='mb-2'>Acceptable forms of identification:</p>
          <ul className='list-disc list-inside'>
            <li>Passport</li>
            <li>Passport card</li>
            <li>Driver license</li>
            <li>State issued ID card</li>
            <li>Resident permit ID / U.S. Green Card</li>
            <li>U.S. visa</li>
          </ul>
          <p className='mb-2'>
            Required information (must match what you provided in the primary
            contact info section):
          </p>
          <ul className='list-disc list-inside'>
            <li>Full legal name</li>
            <li>Date of birth (DOB)</li>
            <li>Photo of person</li>
          </ul>
        </div>
        <CloudinaryFileUpload
          className='w-full'
          onResourceChange={handleIdentityDocChange}
        />
        {localIdentityDocResource === null && (
          <p className='text-red-500 mt-1'>Identity document is required.</p>
        )}
        <div className='mb-4 mt-4'>
          <h2 className='text-lg font-semibold mb-2'>
            2. Company/Business Document
          </h2>
          <p className='mb-2'>Acceptable forms of legal entity verification:</p>
          <ul className='list-disc list-inside'>
            <li>IRS Letter 147C</li>
            <li>IRS SS-4 confirmation letter</li>
          </ul>
          <p className='mb-2'>
            Required information (must match what you provided in the store info
            section):
          </p>
          <ul className='list-disc list-inside'>
            <li>Full company legal entity name</li>
            <li>Tax ID from the local tax authority</li>
            <li>Company address</li>
          </ul>
        </div>
        <CloudinaryFileUpload
          className='w-full'
          onResourceChange={handleBusinessDocChange}
        />
        {localBusinessDocResource === null && (
          <p className='text-red-500 mt-1'>Business document is required.</p>
        )}
      </div>
    </div>
  );
};

export default VerificationDocsInput;
