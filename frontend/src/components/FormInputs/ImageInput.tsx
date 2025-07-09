import React, { useState } from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';

interface ImageInputProps {
  label: string;
  id: string;
  name: string;
  register: UseFormRegister<FieldValues>; // This is passed from react-hook-form
  errors: FieldErrors;
  onFileChange?: (file: File | null) => void; // Optional callback for the parent
  accept?: string; // Accept specific file types (e.g., images)
  type?: string;
  className?: string;
  isRequired?: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({
  label,
  id,
  name,
  register,
  errors,
  isRequired = true,
  onFileChange,
  accept = 'image/*',
  className = '',
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }

    if (onFileChange) {
      onFileChange(file);
    }
  };

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
        <input
          {...register(name, { required: isRequired })}
          type='file'
          id={id}
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className='block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none'
        />
        {/* For if we want ro see preivew */}
        {/* {preview && (
          <img
            src={preview}
            alt='Preview'
            className='mt-2 max-w-full h-auto rounded-md'
          />
        )} */}
        {errors[name] && (
          <span className='text-sm text-vesoko_red_600'>
            {label} is required
          </span>
        )}
        {/* {errors?.[name] && (
        <p className='mt-1 text-sm text-red-600'>{errors[name].message}</p>
      )} */}
      </div>
    </div>
  );
};

export default ImageInput;
