'use client';
import React from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';

interface TextInputProps {
  label: string;
  id: string;
  name: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
  errors: FieldErrors;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
  // defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  isRequired?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const TextInput = ({
  label,
  id,
  name,
  register,
  errors,
  isRequired = true,
  disabled = false,
  type = 'text',
  className = '',
  value,
  placeholder,
}: TextInputProps) => {
  const validationRules = {
    required: isRequired ? `${label} is required` : false,
    ...(type === 'email' && {
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address',
      },
    }),
  };

  return (
    <div className={`${className} col-span-1`}>
      <label
        htmlFor={name}
        className='block text-sm font-medium leading-6 text-gray-700'
      >
        {label}
        {isRequired && <span className='text-vesoko_red_600'> *</span>}
      </label>
      <div className='mt-1'>
        <input
          {...register(name, validationRules)}
          id={id}
          name={name}
          type={type}
          autoComplete={name}
          disabled={disabled}
          className={`block w-full px-3 py-2.5 text-sm border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-vesoko_green_500/20 ${
            errors[name]
              ? 'border-red-300 focus:border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-vesoko_green_500 bg-white hover:border-gray-400'
          } ${
            disabled
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : ''
          }`}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        />
        {errors[name] && (
          <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
            <span className='text-red-500'>⚠</span>
{String(errors[name]?.message) || `${label} is required`}
          </p>
        )}
      </div>
    </div>
  );
};

export default TextInput;
