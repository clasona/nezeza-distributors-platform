import { Upload } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';
import Button from './Button';

interface CloudinaryFileUploadProps {
  label?: string;
  className?: string;
  onResourceChange: (resource: any) => void; // Required: Callback to send resource to parent
}
const CloudinaryFileUpload = ({
  label,
  className = '',
  onResourceChange,
}: CloudinaryFileUploadProps) => {
  const [resource, setResource] = useState<any>(null);

  return (
    <div>
      {label && (
        <label
          htmlFor='file-upload'
          className='block text-sm font-medium leading-6 text-gray-900'
        >
          {label}
        </label>
      )}
      <CldUploadWidget
        // signatureEndpoint='/api/cloudinary-sign-image/route' // Update to the endpoint for file signing
        uploadPreset='vesoko-preset-unsigned-1'
        options={{
          resourceType: 'raw', // Cloudinary supports 'raw' for files
          // TODO: Restrict to PDF files
          sources: ['local', 'google_drive', 'dropbox'], // Restrict sources as needed
          multiple: false,
        }}
        onSuccess={(result, { widget }) => {
          if (result.info) {
            setResource(result.info); // Store file details locally
            onResourceChange(result.info); // Send file details to parent
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
              buttonTitle='Upload File'
              icon={Upload}
              className='space-x-3 px-6 py-2 text-white bg-vesoko_dark_blue hover:bg-vesoko_green_800'
              onClick={handleOnClick}
            />
          );
        }}
      </CldUploadWidget>

      {resource && (
        <div className='mt-2'>
          <p className='text-vesoko_green_600'>
            File uploaded successfully: {resource.original_filename}
          </p>
          <p>
            <a
              href={resource.secure_url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-vesoko_dark_blue underline'
            >
              Download File
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default CloudinaryFileUpload;
