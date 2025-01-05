import React, { useState } from 'react'
import CloudinaryFileUpload from '../../FormInputs/CloudinaryFileUpload';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';

interface VerificationDocsInputProps {
  errors: FieldErrors;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
}
const VerificationDocsInput = ({
  register,
  errors,
}: VerificationDocsInputProps) => {
  const [mainImageResource, setMainImageResource] = useState<any>(null);

  return (
    <>
      {/* TODO: Replace with upload docs */}
      {/* <CloudinaryFileUpload
        label='Store Registration Docs'
        className='sm:col-span-2' //span full row
        onResourceChange={setMainImageResource}
      /> */}
    </>
  );
};

export default VerificationDocsInput;