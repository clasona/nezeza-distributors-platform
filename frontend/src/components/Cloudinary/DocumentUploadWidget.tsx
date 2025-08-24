'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { FileText, Upload, Check, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    cloudinary?: any;
  }
}

interface DocumentUploadWidgetProps {
  onUpload: (url: string, info: any) => void;
  folder?: string;
  buttonText?: string;
  className?: string;
  children?: ReactNode;
  accept?: string;
  maxFileSize?: number; // in MB
  label?: string;
  currentFile?: { url: string; name: string } | null;
  onRemove?: () => void;
}

export default function DocumentUploadWidget({
  onUpload,
  folder = 'store-documents',
  buttonText = 'Upload Document',
  className = '',
  children,
  accept = 'pdf,doc,docx,jpg,jpeg,png',
  maxFileSize = 10,
  label,
  currentFile,
  onRemove,
}: DocumentUploadWidgetProps) {
  const widgetRef = useRef<any>(null);
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.cloudinary) {
      // Prevent loading multiple scripts
      if (!document.getElementById('cloudinary-widget-script')) {
        const script = document.createElement('script');
        script.id = 'cloudinary-widget-script';
        script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
        script.onload = () => setCloudinaryLoaded(true);
        script.onerror = () => {
          setCloudinaryLoaded(false);
          console.error('Failed to load Cloudinary widget');
        };
        document.body.appendChild(script);
      } else {
        setCloudinaryLoaded(true);
      }
    } else if (typeof window !== 'undefined' && window.cloudinary) {
      setCloudinaryLoaded(true);
    }
  }, []);

  const openWidget = () => {
    if (!cloudinaryLoaded || !window.cloudinary) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;

    if (!cloudName || !uploadPreset) {
      alert('Cloudinary configuration missing.');
      return;
    }

    // Defensive: destroy previous widget if exists
    if (widgetRef.current && typeof widgetRef.current.close === 'function') {
      widgetRef.current.close();
    }

    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ['local'], // Only local files for documents for security
        multiple: false, // Single file upload
        maxFiles: 1,
        folder,
        resourceType: 'auto', // Let Cloudinary determine the best type
        clientAllowedFormats: accept.split(','),
        maxFileSize: maxFileSize * 1024 * 1024, // Convert MB to bytes
        cropping: false, // Disable cropping for documents
        showAdvancedOptions: false,
        showSkipCropButton: false,
        showCompletedButton: true,
        showUploadMoreButton: false,
        theme: 'minimal',
      },
      (error: any, result: any) => {
        console.log('Cloudinary widget event:', result?.event, result, error);
        
        if (error) {
          console.error('Cloudinary upload error:', error);
          setIsUploading(false);
          return;
        }

        if (result) {
          switch (result.event) {
            case 'open':
              setIsUploading(true);
              break;
            case 'close':
              setIsUploading(false);
              break;
            case 'success':
              console.log('Upload successful:', result.info);
              setIsUploading(false);
              onUpload(result.info.secure_url, result.info);
              break;
            case 'abort':
            case 'error':
              setIsUploading(false);
              break;
          }
        }
      }
    );

    widgetRef.current = myWidget;

    // Defensive: check .open exists before calling
    if (myWidget && typeof myWidget.open === 'function') {
      myWidget.open();
    } else {
      alert('Cloudinary widget failed to initialize.');
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // If we have a custom render prop (children), use that
  if (children) {
    return (
      <span
        onClick={openWidget}
        style={{
          display: 'inline-block',
          cursor: cloudinaryLoaded && !isUploading ? 'pointer' : 'not-allowed',
        }}
      >
        {children}
      </span>
    );
  }

  // Default rendering with file status
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
          {label}
        </label>
      )}
      
      {!currentFile ? (
        // Upload button when no file is present
        <button
          type="button"
          onClick={openWidget}
          disabled={!cloudinaryLoaded || isUploading}
          className={
            className ||
            `w-full flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed rounded-lg transition-all duration-200 ${
              isUploading
                ? 'border-blue-300 bg-blue-50 text-blue-700 cursor-wait'
                : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700'
            }`
          }
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
              <span className="font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8" />
              <div className="text-center">
                <span className="font-medium block">{buttonText}</span>
                <span className="text-sm text-gray-500 mt-1">
                  {accept.toUpperCase().replace(/,/g, ', ')} • Max {maxFileSize}MB
                </span>
              </div>
            </>
          )}
        </button>
      ) : (
        // File uploaded successfully display
        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-vesoko_green_100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700">Upload Successful</span>
              </div>
              <p className="text-sm text-green-700 font-medium truncate" title={currentFile.name}>
                {currentFile.name}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <a
                  href={currentFile.url.replace('/upload/', '/upload/f_jpg/')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                  title="View document as converted image"
                >
                  <FileText className="h-3 w-3" />
                  View
                </a>
                {onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {/* <p className="text-xs text-amber-600">
                ⚠️ PDF converted to viewable image format due to access restrictions
              </p> */}
            </div>
          </div>
        </div>
      )}
      
      {/* Info text */}
      <p className="text-xs text-gray-500 mt-2">
        Supported formats: {accept.toUpperCase().replace(/,/g, ', ')} • Maximum file size: {maxFileSize}MB
      </p>
    </div>
  );
}
