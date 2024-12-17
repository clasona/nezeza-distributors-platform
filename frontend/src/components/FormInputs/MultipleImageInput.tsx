import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface MultiImageInputProps {
  onFilesChange: (files: File[]) => void;
}

const MultiImageInput: React.FC<MultiImageInputProps> = ({ onFilesChange }) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleDrop = (acceptedFiles: File[]) => {
    // Limit to 5 images
    const newFiles = acceptedFiles.slice(0, 5);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setPreviews(newPreviews);
    onFilesChange(newFiles);
  };

  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      onDrop: handleDrop,
      accept: {
        'image/jpeg': [],
        'image/jpg': [],
        'image/png': [],
      },
      multiple: true,
    });
  //TODO: not sure what this does: https://react-dropzone.org/#!/Accepting%20specific%20file%20types
  // const acceptedFileItems = acceptedFiles.map((file) => (
  //   <li key={file.path}>
  //     {file.path} - {file.size} bytes
  //   </li>
  // ));

  // const fileRejectionItems = fileRejections.map(({ file, errors }) => (
  //   <li key={file.path}>
  //     {file.path} - {file.size} bytes
  //     <ul>
  //       {errors.map((e) => (
  //         <li key={e.code}>{e.message}</li>
  //       ))}
  //     </ul>
  //   </li>
  // ));

  return (
    <div
      {...getRootProps()}
      className='border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer'
    >
      <input {...getInputProps()} />
      <p className='text-gray-500 text-center'>
        Drag and drop up to 5 images here, or click to select files
      </p>
      <em>(Only *.jpg, *.jpeg and *.png images will be accepted)</em>
      <div className='mt-4 grid grid-cols-3 gap-2'>
        {previews.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Preview ${index + 1}`}
            className='w-20 h-20 object-cover rounded-md'
          />
        ))}
      </div>
    </div>
  );
};

export default MultiImageInput;
