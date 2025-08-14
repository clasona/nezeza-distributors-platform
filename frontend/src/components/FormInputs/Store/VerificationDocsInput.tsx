import React, { useState, useEffect } from 'react';
import DocumentUploadWidget from '../../Cloudinary/DocumentUploadWidget';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FileText, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StoreApplicationFormData } from '@/types/storeApplication';
import Link from 'next/link';

interface VerificationDocsInputProps {
  errors: FieldErrors<StoreApplicationFormData>;
  defaultValue?: string;
  register: UseFormRegister<StoreApplicationFormData>;
  setIdentityDocResource: (resource: any) => void;
  setBusinessDocResource: (resource: any) => void;
  identityDocResource?: any; // Optional: Current identity document resource
  businessDocResource?: any; // Optional: Current business document resource
}

const VerificationDocsInput = ({
  register,
  errors,
  setIdentityDocResource,
  setBusinessDocResource,
  identityDocResource,
  businessDocResource,
}: VerificationDocsInputProps) => {
  const [localIdentityDocResource, setLocalIdentityDocResource] =
    useState<any>(identityDocResource || null);
  const [localBusinessDocResource, setLocalBusinessDocResource] =
    useState<any>(businessDocResource || null);

  // Sync internal state with external props
  useEffect(() => {
    setLocalIdentityDocResource(identityDocResource || null);
  }, [identityDocResource]);

  useEffect(() => {
    setLocalBusinessDocResource(businessDocResource || null);
  }, [businessDocResource]);

  const handleIdentityDocUpload = (url: string, info: any) => {
    const resource = {
      secure_url: url,
      original_filename: info.original_filename || info.display_name,
      format: info.format,
      resource_type: info.resource_type,
      bytes: info.bytes,
      public_id: info.public_id,
      ...info
    };
    setLocalIdentityDocResource(resource);
    setIdentityDocResource(resource);
  };

  const handleBusinessDocUpload = (url: string, info: any) => {
    const resource = {
      secure_url: url,
      original_filename: info.original_filename || info.display_name,
      format: info.format,
      resource_type: info.resource_type,
      bytes: info.bytes,
      public_id: info.public_id,
      ...info
    };
    setLocalBusinessDocResource(resource);
    setBusinessDocResource(resource);
  };

  return (
    <div className='w-full space-y-6'>
      <div className='text-center'>
        <div className='inline-flex items-center gap-2 bg-vesoko_background text-vesoko_secondary px-4 py-2 rounded-full text-sm font-medium mb-4'>
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
            <DocumentUploadWidget
              label=''
              onUpload={handleIdentityDocUpload}
              currentFile={localIdentityDocResource ? {
                url: localIdentityDocResource.secure_url,
                name: localIdentityDocResource.original_filename
              } : null}
              onRemove={() => {
                setLocalIdentityDocResource(null);
                setIdentityDocResource(null);
              }}
              accept='pdf,jpg,jpeg,png'
              maxFileSize={10}
              buttonText='Upload Identity Document'
              folder='identity-docs'
            />
          </div>
        </div>

        {/* Business Document Card */}
        <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-vesoko_green_100 rounded-lg flex items-center justify-center'>
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
            <DocumentUploadWidget
              label=''
              onUpload={handleBusinessDocUpload}
              currentFile={localBusinessDocResource ? {
                url: localBusinessDocResource.secure_url,
                name: localBusinessDocResource.original_filename
              } : null}
              onRemove={() => {
                setLocalBusinessDocResource(null);
                setBusinessDocResource(null);
              }}
              accept='pdf,doc,docx'
              maxFileSize={10}
              buttonText='Upload Business Document'
              folder='business-docs'
            />
          </div>
        </div>
      </div>
      
      {/* Help Text */}
      <div className='text-center text-sm text-gray-500'>
        <p>Having trouble uploading documents? <Link href='/contact' className='text-vesoko_primary hover:text-vesoko_primary_dark font-medium'>Contact our support team</Link> for assistance.</p>
      </div>
    </div>
  );
};

export default VerificationDocsInput;
