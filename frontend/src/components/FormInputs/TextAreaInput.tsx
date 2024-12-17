'use client';
import React from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';

interface TextAreaInputProps {
  label: string;
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
  name,
  register,
  errors,
  isRequired = true,
  className = 'sm:col-span-2',
  defaultValue = '',
}: TextAreaInputProps) => {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className='block text-sm font-medium leading-6 text-gray-700 mb-2'
      >
        {label}
        {isRequired && <span className='text-nezeza_red_600'> *</span>}
      </label>
      <div className='mt-2'>
        <textarea
          {...register(`${name}`, { required: isRequired })}
          name={name}
          id={name}
          rows={3}
          defaultValue={defaultValue}
          autoComplete={name}
          className={`mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-nezeza_green_600 ${
            errors[name] && 'border-nezeza_red_600'
          } ${errors[name] && 'text-nezeza_red_600'}`}
          placeholder={`Enter the ${label.toLowerCase()}`}
        />
        {errors[name] && (
          <span className='text-sm text-nezeza_red_600'>
            {label} is required
          </span>
        )}
      </div>
    </div>
  );
};

export default TextAreaInput;
