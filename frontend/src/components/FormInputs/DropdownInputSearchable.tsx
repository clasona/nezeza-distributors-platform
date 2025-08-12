'use client';
import React from 'react';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import Select, { StylesConfig } from 'react-select';

interface DropdownInputSearchableProps {
  label?: string;
  id?: string;
  name: string;
  options: { value: string; label: string; [key: string]: any }[];
  className?: string;
  isRequired?: boolean;
  disabled?: boolean;
  onChange?: (selectedOption: { value: string; label: string } | null) => void;
  value?: { value: string; label: string } | null;
  placeholder?: string;
  defaultValue?: { value: string; label: string } | null;
  register?: UseFormRegister<FieldValues>; // Add register prop
  errors?: FieldErrors; // Add errors prop
}

const DropdownInputSearchable = ({
  label,
  name,
  options,
  isRequired = true,
  disabled = false,
  className = '',
  onChange,
  value,
  placeholder,
  defaultValue,
  register,
  errors,
}: DropdownInputSearchableProps) => {
  const handleChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    if (onChange) {
      onChange(selectedOption);
    }
    // If register is provided, trigger the change event for react-hook-form
    if (register) {
      const event = {
        target: {
          name: name,
          value: selectedOption?.value || '',
        },
      } as React.ChangeEvent<{ name?: string | undefined; value: string }>;
      register(name)?.onChange(event);
    }
  };

  const minWidthPx = 200;
  const customStyles: StylesConfig<{ value: string; label: string }, false> = {
    control: (provided, state) => ({
      ...provided,
      minWidth: `${minWidthPx}px`,
      borderColor: state.isFocused
        ? '#3182ce'
        : errors?.[name]
        ? '#e53e3e' // Highlight border for error
        : 'transparent',
      borderWidth: '1px',
      boxShadow: state.isFocused
        ? `0 0 0 1px #3182ce`
        : errors?.[name]
        ? `0 0 0 1px #e53e3e` // Highlight shadow for error
        : 'none',
      '&:hover': {
        borderColor: '#3182ce',
      },
    }),
    menu: (provided) => ({
      ...provided,
      minWidth: `${minWidthPx}px`, // Ensure the dropdown menu also has the minimum width
    }),
  };

  return (
    <div className={className}>
      {label && (
        <label className='block text-sm font-medium leading-6 text-gray-700'>
          {label}
          {isRequired && <span className='text-vesoko_red_600'> *</span>}
        </label>
      )}
      <Select
        options={options}
        onChange={handleChange}
        value={value}
        isDisabled={disabled}
        styles={customStyles}
        placeholder={placeholder}
        defaultValue={defaultValue}
        name={name} // Pass name to the Select component
        ref={register ? register(name)?.ref : null} // Register the ref
        onBlur={register ? register(name)?.onBlur : undefined} // Handle blur
        className='border border-gray-300 rounded-md shadow-sm focus:border-vesoko_green_600 focus:ring-vesoko_green_600 focus:ring-1 text-sm font-inter mt-1'
      />
      {errors?.[name] && (
        <p className='mt-1 text-sm text-red-500'>{label} is required</p>
      )}
    </div>
  );
};

export default DropdownInputSearchable;
