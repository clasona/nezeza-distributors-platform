import { Upload, FileText, Check } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

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
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className='block text-sm font-medium leading-6 text-gray-900 mb-2'>
          {label}
        </label>
      )}
      
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET || 'test-soko'}
        options={{
          resourceType: 'raw', // For documents/files
          clientAllowedFormats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'], // Allow common document formats
          maxFileSize: 10485760, // 10MB limit
          sources: ['local'], // Only allow local file uploads for security
          multiple: false,
          folder: 'store-documents', // Organize uploads in folders
        }}
        onOpen={() => {
          setIsUploading(true);
          setError(null);
        }}
        onSuccess={(result, { widget }) => {
          console.log('Upload successful:', result);
          if (result.info && typeof result.info !== 'string') {
            setResource(result.info);
            onResourceChange(result.info);
            setIsUploading(false);
            setError(null);
          }
        }}
        onError={(error) => {
          console.error('Upload error:', error);
          setError('Upload failed. Please try again.');
          setIsUploading(false);
        }}
        onClose={() => {
          setIsUploading(false);
        }}
      >
        {({ open }) => {
          const handleClick = () => {
            if (!isUploading) {
              open();
            }
          };
          
          return (
            <div className='space-y-3'>
              <button
                type='button'
                onClick={handleClick}
                disabled={isUploading}
                className={`w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-dashed rounded-lg transition-all duration-200 ${
                  resource
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : isUploading
                    ? 'border-blue-300 bg-blue-50 text-blue-700 cursor-wait'
                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-vesoko_dark_blue hover:bg-vesoko_dark_blue hover:text-white'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-current'></div>
                    <span className='font-medium'>Uploading...</span>
                  </>
                ) : resource ? (
                  <>
                    <Check className='h-5 w-5' />
                    <span className='font-medium'>File Uploaded Successfully</span>
                  </>
                ) : (
                  <>
                    <Upload className='h-5 w-5' />
                    <span className='font-medium'>Click to Upload Document</span>
                  </>
                )}
              </button>
              
              {error && (
                <div className='text-red-600 text-sm flex items-center gap-2'>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
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
