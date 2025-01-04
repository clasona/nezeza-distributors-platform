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
  // defaultValue?: string;
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
  disabled = false,
  type = 'text',
  className = '',
  // defaultValue = '',
}: TextInputProps) => {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className='block text-sm font-medium leading-6 text-gray-700'
      >
        {label}
        {isRequired && <span className='text-nezeza_red_600'> *</span>}
      </label>
      <div>
        <input
          {...register(name, { required: isRequired })}
          id={id}
          name={name}
          type={type}
          // defaultValue={defaultValue}
          autoComplete={name}
          disabled={disabled}
          className={`block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none ${
            errors[name]
              ? 'border-nezeza_red_600 text-nezeza_red_600'
              : 'focus:border-nezeza_green_600'
          } ${
            disabled
              ? 'bg-gray-200 text-nezeza_gray_600 cursor-not-allowed'
              : ''
          }`}
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

export default TextInput;
