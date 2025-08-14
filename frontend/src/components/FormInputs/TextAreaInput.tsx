'use client';
import React from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';

interface TextAreaInputProps {
  label: string;
  id: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  errors: FieldErrors;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  isRequired?: boolean;
}
const TextAreaInput = ({
  label,
  id,
  name,
  register,
  errors,
  isRequired = true,
  className = '',
  defaultValue = '',
}: TextAreaInputProps) => {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className='block text-sm font-medium leading-6 text-gray-700'
      >
        {label}
        {isRequired && <span className='text-vesoko_red_600'> *</span>}
      </label>
      <div>
        <textarea
          {...register(`${name}`, { required: isRequired })}
          name={name}
          id={name}
          rows={2}
          defaultValue={defaultValue}
          autoComplete={name}
          className={`block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-vesoko_primary ${
            errors[name] && 'border-vesoko_red_600'
          } ${errors[name] && 'text-vesoko_red_600'}`}
          placeholder={`Enter the ${label.toLowerCase()}`}
        />
        {errors[name] && (
          <span className='text-sm text-vesoko_red_600'>
            {label} is required
          </span>
        )}
      </div>
    </div>
  );
};

export default TextAreaInput;
