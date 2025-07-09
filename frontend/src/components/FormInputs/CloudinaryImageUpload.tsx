import { CldUploadWidget, CloudinaryUploadWidgetInfo } from 'next-cloudinary';
import React, { useState } from 'react';
import Button from './Button';
import { Upload } from 'lucide-react';

interface CloudinaryImageUploadProps {
  label?: string;
  className?: string;
  onResourceChange: (resource: any) => void; // Required: Callback to send resource to parent
}
const CloudinaryImageUpload = ({
  label,
  className = '',
  onResourceChange,
}: CloudinaryImageUploadProps) => {
  const [resource, setResource] = useState<any>(null);

  return (
    <div>
      {label && ( // Only render the label if it's provided
        <label
          htmlFor='course-image'
          className='block text-sm font-medium leading-6 text-gray-900 ' // Added margin-bottom
        >
          {label}
        </label>
      )}
      {/* <CldUploadWidget uploadPreset='vesoko-preset-unsigned-1'> */}
      <CldUploadWidget
        options={{
          resourceType: 'image', // Cloudinary supports 'raw' for files
          // sources: ['local', 'url'], // Restrict sources as needed
        }}
        signatureEndpoint='/api/cloudinary-sign-image/route'
        onSuccess={(result, { widget }) => {
          if (result.info) {
            setResource(result.info); // { public_id, secure_url, etc }
            onResourceChange(result.info); // Call the callback with the resource
          }
        }}
        onQueuesEnd={(result, { widget }) => {
          widget.close();
        }}
      >
        {({ open }) => {
          function handleOnClick() {
            setResource(undefined);
            open();
          }
          return (
            <Button
              buttonTitle='Upload Image'
              icon={Upload}
              className='space-x-3 px-6 py-2 text-white bg-vesoko_dark_blue hover:bg-vesoko_green_800'
              onClick={handleOnClick}
            />
          );
        }}
      </CldUploadWidget>

      {resource && (
        <div>
          <p className='mt-2 text-vesoko_green_600'>
            Image uploaded successfully
          </p>
          <img src={resource.secure_url} alt='Uploaded Image' width='100' />
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageUpload;
