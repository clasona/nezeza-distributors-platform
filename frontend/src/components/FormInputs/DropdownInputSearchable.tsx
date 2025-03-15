'use client';
import React from 'react';
import Select, { StylesConfig } from 'react-select';

interface DropdownInputSearchableProps {
  label?: string;
  id?: string;
  name?: string;
  options: { value: string; label: string; [key: string]: any }[];
  className?: string;
  isRequired?: boolean;
  disabled?: boolean;
  onChange?: (selectedOption: { value: string; label: string } | null) => void;
  value?: { value: string; label: string } | null;
}

const DropdownInputSearchable = ({
  label,
  options,
  isRequired = true,
  disabled = false,
  className = '',
  onChange,
  value,
}: DropdownInputSearchableProps) => {
  const handleChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    if (onChange) {
      onChange(selectedOption);
    }
  };

  const customStyles: StylesConfig<{ value: string; label: string }, false> = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#38a169' : 'transparent', // nezeza_green_600
      borderWidth: '1px',
      boxShadow: state.isFocused ? '0 0 0 1px #38a169' : 'none',
      '&:hover': {
        borderColor: '#38a169',
      },
    }),
  };

  return (
    <div className={className}>
      {label && (
        <label className='block text-sm font-medium leading-6 text-gray-700'>
          {label}
          {isRequired && <span className='text-nezeza_red_600'> *</span>}
        </label>
      )}
      <Select
        options={options}
        onChange={handleChange}
        value={value}
        isDisabled={disabled}
        styles={customStyles}
      />
    </div>
  );
};

export default DropdownInputSearchable;
