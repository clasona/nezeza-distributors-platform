'use client';
import React from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';

interface DropdownInputProps {
  label?: string;
  id: string;
  name: string;
  options: { value: string; label: string; [key: string]: any }[]; // Array of options
  errors: FieldErrors;
  className?: string;
  register: UseFormRegister<FieldValues>;
  isRequired?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  value?: string | number;
  defaultValue?: string | number;
}

const DropdownInput = ({
  label,
  id,
  name,
  options,
  register,
  errors,
  isRequired = true,
  disabled = false,
  isLoading = false,
  className = '',
  value,
  defaultValue,
}: DropdownInputProps) => {
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
        <select
          {...register(name, { required: isRequired })}
          id={id}
          name={name}
          disabled={disabled}
          defaultValue={defaultValue}
          value={value}
          className={`block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none ${
            errors[name]
              ? 'border-nezeza_red_600 text-nezeza_red_600'
              : 'focus:border-nezeza_green_600'
          } ${
            disabled
              ? 'bg-gray-200 text-nezeza_gray_600 cursor-not-allowed'
              : ''
          }`}
        >
          {/* Default/Placeholder Option */}
          <option value='' disabled hidden>
            Select a {label?.toLowerCase()}
          </option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors[name] && (
          <span className='text-sm text-nezeza_red_600'>
            {label} is required
          </span>
        )}
      </div>
    </div>
  );
};

export default DropdownInput;
