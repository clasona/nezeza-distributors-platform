'use client'
import React from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';

interface TextInputProps {
  label: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
  errors: FieldErrors;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  isRequired?: boolean;
}

const TextInput = ({
  label,
  name,
  register,
  errors,
  isRequired = true,
  type = 'text',
  className = 'sm:col-span-2',
  defaultValue = '',
}: TextInputProps) => {

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className='block text-sm font-medium leading-6 text-gray-700 mb-2'
      >
        {label}
        {isRequired && <span className='text-red-500'> *</span>}
      </label>
      <div className='mt-2'>
        <input
          {...register(name, { required: isRequired })}
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          autoComplete={name}
          className={`mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-green-500 ${
            errors[name] && 'border-red-500 text-red-500'
          }`}
          placeholder={`Enter the ${label.toLowerCase()}`}
        />
        {errors[name] && (
                  <span className='text-sm text-red-500'>{ label} is required</span>
        )}
      </div>
    </div>
  );
};

export default TextInput;
