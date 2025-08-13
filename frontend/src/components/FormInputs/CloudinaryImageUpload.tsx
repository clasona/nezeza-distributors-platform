import { CldUploadWidget } from 'next-cloudinary';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, RefreshCw, Image as ImageIcon } from 'lucide-react';

interface CloudinaryImageUploadProps {
  label?: string;
  className?: string;
  onResourceChange: (resource: any) => void; // Required: Callback to send resource to parent
  initialResource?: any; // Optional: Initial resource to display
}
const CloudinaryImageUpload = ({
  label,
  className = '',
  onResourceChange,
  initialResource,
}: CloudinaryImageUploadProps) => {
  const [resource, setResource] = useState<any>(initialResource || null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync internal resource state with external initialResource prop
  useEffect(() => {
    setResource(initialResource || null);
  }, [initialResource]);

  const handleRemoveImage = () => {
    setResource(null);
    onResourceChange(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className='block text-sm font-medium leading-6 text-gray-900 mb-3'>
          {label}
        </label>
      )}
      
      <CldUploadWidget
        options={{
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          maxFileSize: 5242880, // 5MB limit
          sources: ['local'],
          multiple: false,
          folder: 'store-logos',
        }}
        signatureEndpoint='/api/cloudinary-sign-image/route'
        onOpen={() => {
          setIsUploading(true);
        }}
        onSuccess={(result, { widget }) => {
          console.log('Upload successful:', result);
          if (result.info && typeof result.info !== 'string') {
            setResource(result.info);
            onResourceChange(result.info);
            setIsUploading(false);
          }
        }}
        onError={(error) => {
          console.error('Upload error:', error);
          setIsUploading(false);
        }}
        onClose={() => {
          setIsUploading(false);
        }}
      >
        {({ open }) => {
          const handleUploadClick = () => {
            if (!isUploading) {
              open();
            }
          };
          
          return (
            <div className='space-y-4'>
              {/* Upload Area */}
              {!resource ? (
                <button
                  type='button'
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className={`w-full flex flex-col items-center justify-center gap-4 px-6 py-8 border-2 border-dashed rounded-xl transition-all duration-200 ${
                    isUploading
                      ? 'border-blue-300 bg-blue-50 text-blue-700 cursor-wait'
                      : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-vesoko_dark_blue hover:bg-vesoko_dark_blue hover:text-white'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-current'></div>
                      <span className='font-medium text-sm'>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className='h-12 w-12' />
                      <div className='text-center'>
                        <span className='font-medium text-lg block'>Upload Store Logo</span>
                        <span className='text-sm opacity-75'>PNG, JPG, GIF up to 5MB</span>
                      </div>
                    </>
                  )}
                </button>
              ) : (
                /* Image Preview */
                <div className='relative bg-white border border-gray-200 rounded-xl p-4'>
                  <div className='flex items-start gap-4'>
                    {/* Image Preview */}
                    <div className='flex-shrink-0'>
                      <Image 
                        src={resource.secure_url} 
                        alt='Store Logo Preview' 
                        width={96}
                        height={96}
                        className='w-24 h-24 object-cover rounded-lg border border-gray-200'
                      />
                    </div>
                    
                    {/* Image Details */}
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm font-medium text-gray-900 truncate'>
                        {resource.original_filename || 'Store Logo'}
                      </h4>
                      <p className='text-xs text-gray-500 mt-1'>
                        {resource.format?.toUpperCase()} • {Math.round((resource.bytes || 0) / 1024)} KB
                      </p>
                      <div className='flex items-center gap-2 mt-3'>
                        <button
                          type='button'
                          onClick={handleUploadClick}
                          className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-vesoko_dark_blue text-white rounded-md hover:bg-vesoko_green_600 transition-colors duration-200'
                        >
                          <RefreshCw className='h-3 w-3' />
                          Change
                        </button>
                        <button
                          type='button'
                          onClick={handleRemoveImage}
                          className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200'
                        >
                          <X className='h-3 w-3' />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default CloudinaryImageUpload;
