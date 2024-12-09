'use client';
import React from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';

interface TextInputProps {
  label: string;
  id: string;
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
  disabled?: boolean;
}

const TextInput = ({
  label,
  id,
  name,
  register,
  errors,
  isRequired = true,
  disabled=false,
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
          id={id}
          name={name}
          type={type}
          defaultValue={defaultValue}
          autoComplete={name}
          disabled={disabled}
          className={`mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none ${
            errors[name]
              ? 'border-red-500 text-red-500'
              : 'focus:border-green-500'
          } ${
            disabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : ''
          }`}
          placeholder={`Enter the ${label.toLowerCase()}`}
        />
        {errors[name] && (
          <span className='text-sm text-red-500'>{label} is required</span>
        )}
      </div>
    </div>
  );
};

export default TextInput;
