import { CldUploadWidget, CloudinaryUploadWidgetInfo } from 'next-cloudinary';
import React, { useState } from 'react';
import Button from './Button';
import { Upload } from 'lucide-react';

interface CloudinaryImageUploadProps {
  label?: string;
  className?: string;
  setImageUrl: (url: string) => void; // Optional: For displaying a preview URL
  onResourceChange: (resource: any) => void; // Required: Callback to send resource to parent
}
const CloudinaryImageUpload = ({
  label,
  className = '',
  setImageUrl,
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
      {/* <label
        htmlFor='course-image'
        className='block text-sm font-medium leading-6 text-gray-900'
      >
        {label}
      </label> */}
      {/* using cloudinary */}
      {/* <CldUploadWidget uploadPreset='nezeza-preset-unsigned-1'> */}
      <CldUploadWidget
        // options={{ sources: ['local', 'url', 'unsplash'] }}
        signatureEndpoint='/api/cloudinary-sign-image/route'
        onSuccess={(result, { widget }) => {
          if (result.info) {
            // console.log('yves', result.info.secure_url);

            setResource(result.info); // { public_id, secure_url, etc }
            onResourceChange(result.info); // Call the callback with the resource

        //     setImageUrl(resource.secure_url); // Send the URL to parent component (if required)
        //   if (setImageUrl) {
        //     setImageUrl(resource.secure_url); // Optional: Set URL for preview
        //   }
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
            // <button onClick={handleOnClick}>Upload Image</button>
            <Button
              buttonTitle='Upload Image'
              icon={Upload}
              className='space-x-3 px-6 py-2 text-white bg-nezeza_dark_blue hover:bg-nezeza_green_800'
              //   onClick={() => open()}
                  onClick={handleOnClick}
            />
          );
        }}
      </CldUploadWidget>

      {resource && (
        <div>
          <p className='mt-2 text-nezeza_green_600'>
            Image uploaded successfully
          </p>
          <img src={resource.secure_url} alt='Uploaded Image' width='100' />
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageUpload;
