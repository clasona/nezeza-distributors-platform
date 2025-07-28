import React, { useState } from 'react';
import CloudinaryFileUpload from '../../FormInputs/CloudinaryFileUpload';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import StoreFormHeading from './StoreFormHeading';
import { FileText, Shield, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { StoreApplicationFormData } from '@/types/storeApplication';

interface VerificationDocsInputProps {
  errors: FieldErrors<StoreApplicationFormData>;
  defaultValue?: string;
  register: UseFormRegister<StoreApplicationFormData>;
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
    <div className='w-full space-y-6'>
      <div className='text-center'>
        <div className='inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4'>
          <Shield className='h-4 w-4' />
          Document Verification
        </div>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>Business Verification Documents</h2>
        <p className='text-gray-600 max-w-2xl mx-auto'>Please upload the required documents to verify your identity and business registration. All documents will be kept secure and confidential.</p>
      </div>

      {/* Important Information */}
      <div className='bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0' />
          <div>
            <h3 className='font-semibold text-amber-800 mb-2'>Document Requirements</h3>
            <ul className='space-y-1 text-amber-700 text-sm'>
              <li className='flex items-center gap-2'>
                <CheckCircle2 className='h-3 w-3 text-amber-600' />
                Clear and legible - high resolution scan or photo
              </li>
              <li className='flex items-center gap-2'>
                <CheckCircle2 className='h-3 w-3 text-amber-600' />
                PDF format preferred (images also accepted)
              </li>
              <li className='flex items-center gap-2'>
                <CheckCircle2 className='h-3 w-3 text-amber-600' />
                Valid and up-to-date registration information
              </li>
              <li className='flex items-center gap-2'>
                <CheckCircle2 className='h-3 w-3 text-amber-600' />
                Information must match details provided in previous steps
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Document Upload Cards */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Identity Document Card */}
        <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
              <FileText className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>1. Identity Document</h3>
              <p className='text-sm text-gray-500'>Primary contact verification</p>
            </div>
          </div>
          
          <div className='mb-4 space-y-3'>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Acceptable Documents:</h4>
              <div className='grid grid-cols-2 gap-1 text-sm text-gray-600'>
                <span>• Passport</span>
                <span>• Driver's License</span>
                <span>• Passport Card</span>
                <span>• State ID Card</span>
                <span>• Green Card</span>
                <span>• U.S. Visa</span>
              </div>
            </div>
            
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Must Include:</h4>
              <div className='text-sm text-gray-600 space-y-1'>
                <div>• Full legal name</div>
                <div>• Date of birth</div>
                <div>• Clear photo</div>
              </div>
            </div>
          </div>
          
          <div className='space-y-3'>
            <CloudinaryFileUpload
              label='Upload Identity Document'
              className='w-full'
              onResourceChange={handleIdentityDocChange}
            />
            {localIdentityDocResource ? (
              <div className='flex items-center gap-2 text-green-600 text-sm'>
                <CheckCircle2 className='h-4 w-4' />
                Document uploaded successfully
              </div>
            ) : (
              <div className='flex items-center gap-2 text-red-500 text-sm'>
                <AlertCircle className='h-4 w-4' />
                Identity document is required
              </div>
            )}
          </div>
        </div>

        {/* Business Document Card */}
        <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
              <FileText className='h-5 w-5 text-green-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>2. Business Document</h3>
              <p className='text-sm text-gray-500'>Company registration verification</p>
            </div>
          </div>
          
          <div className='mb-4 space-y-3'>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Acceptable Documents:</h4>
              <div className='text-sm text-gray-600 space-y-1'>
                <div>• IRS Letter 147C</div>
                <div>• IRS SS-4 confirmation letter</div>
                <div>• Business registration certificate</div>
              </div>
            </div>
            
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Must Include:</h4>
              <div className='text-sm text-gray-600 space-y-1'>
                <div>• Full company legal name</div>
                <div>• Tax ID / EIN</div>
                <div>• Business address</div>
              </div>
            </div>
          </div>
          
          <div className='space-y-3'>
            <CloudinaryFileUpload
              label='Upload Business Document'
              className='w-full'
              onResourceChange={handleBusinessDocChange}
            />
            {localBusinessDocResource ? (
              <div className='flex items-center gap-2 text-green-600 text-sm'>
                <CheckCircle2 className='h-4 w-4' />
                Document uploaded successfully
              </div>
            ) : (
              <div className='flex items-center gap-2 text-red-500 text-sm'>
                <AlertCircle className='h-4 w-4' />
                Business document is required
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Help Text */}
      <div className='text-center text-sm text-gray-500'>
        <p>Having trouble uploading documents? <a href='/contact' className='text-vesoko_green_600 hover:text-vesoko_green_700 font-medium'>Contact our support team</a> for assistance.</p>
      </div>
    </div>
  );
};

export default VerificationDocsInput;
