'use client';
import React from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';
import Select, { StylesConfig } from 'react-select'; // Import react-select
import AsyncSelect from 'react-select/async';

interface DropdownInputSearchableProps {
  label: string;
  id: string;
  name: string;
  options: { value: string; label: string; [key: string]: any }[];
  errors: FieldErrors;
  className?: string;
  register: UseFormRegister<FieldValues>;
  isRequired?: boolean;
  disabled?: boolean;
    isLoading?: boolean;
    // multiSelect?: boolean;
}

const DropdownInputSearchable = ({
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
}: DropdownInputSearchableProps) => {
// const customStyles: StylesConfig<
//   { value: string; label: string; [key: string]: any }, // Option Type
//   false, // isMulti
//   { value: string; label: string; [key: string]: any } // Group Type
// > = {
//   control: (styles, { isFocused, isDisabled }) => ({
//     ...styles,
//     backgroundColor: isDisabled ? '#F9FAFB' : 'white', // Example: Light gray when disabled
//     border: errors[name] ? '1px solid #EF4444' : '1px solid #D1D5DB', // Tailwind red or gray
//     borderRadius: '0.375rem', // Tailwind rounded-md
//     padding: '0.5rem 0.75rem', // Tailwind px-3 py-2
//     fontSize: '0.875rem', // Tailwind text-sm
//     lineHeight: '1.5rem', // Tailwind leading-5
//     boxShadow: isFocused ? '0 0 0 2px rgba(93, 166, 114, 0.2)' : 'none', // Tailwind focus ring
//     cursor: isDisabled ? 'not-allowed' : 'default',
//     ':hover': {
//       borderColor: errors[name] ? '#EF4444' : '#6B7280', // Tailwind hover border color
//     },
//   }),
//   option: (styles, { data, isDisabled, isFocused, isSelected }) => ({
//     ...styles,
//     backgroundColor: isSelected ? '#3B82F6' : isFocused ? '#F3F4F6' : 'white', // Tailwind blue or light gray
//     color: isSelected ? 'white' : 'black',
//     cursor: isDisabled ? 'not-allowed' : 'default',
//     padding: '0.5rem', // Consistent padding
//   }),
//   singleValue: (styles, { data, isDisabled }) => ({
//     ...styles,
//     color: isDisabled ? '#6B7280' : 'black', // Tailwind gray or black
//   }),
//   input: (styles, { isDisabled }) => ({
//     ...styles,
//     color: isDisabled ? '#6B7280' : 'black', // Tailwind gray or black
//   }),
//   placeholder: (styles, { isDisabled }) => ({
//     ...styles,
//     color: isDisabled ? '#6B7280' : '#4B5563', // Tailwind gray
//   }),
// };

//   const handleInputChange = (inputValue, { action }) => {
//     // If you need to handle input change for debouncing or other logic
//     if (action === 'input-change') {
//       // console.log("Input Changed:", inputValue);
//     }
//   };

    return (
      <Select options={options} />

      // <div className={className}>
      //   <label
      //     htmlFor={name}
      //     className='block text-sm font-medium leading-6 text-gray-700'
      //   >
      //     {label}
      //     {isRequired && <span className='text-nezeza_red_600'> *</span>}
      //   </label>
      //   <div>
      //     <Select
      //       id={id}
      //       name={name}
      //       options={options}
      //       isSearchable={true} // Enable search
      //       isDisabled={disabled}
      //       isLoading={isLoading}
      //       styles={customStyles}
      //       placeholder={`Select a ${label.toLowerCase()}`}
      //       onChange={(selectedOption) => {
      //         // react-hook-form integration
      //         const event = {
      //           target: {
      //             name: name,
      //             value: selectedOption ? selectedOption.value : '', // Handle null/undefined
      //           },
      //         };
      //         register(name).onChange(event);
      //       }}
      //     //   onInputChange={handleInputChange} // For input change handling
      //       value={options.find(
      //         (option) => option.value === register(name).value
      //       )} // Set initial value
      //     />

      //     {errors[name] && (
      //       <span className='text-sm text-nezeza_red_600'>
      //         {label} is required
      //       </span>
      //     )}
      //   </div>
      // </div>
    );
};

export default DropdownInputSearchable;
