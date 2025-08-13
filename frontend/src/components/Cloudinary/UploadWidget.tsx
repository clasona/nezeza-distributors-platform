'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

declare global {
  interface Window {
    cloudinary?: any;
  }
}

export interface CloudinaryFileInfo {
  url: string;
  secure_url: string;
  public_id: string;
  original_filename: string;
  filename?: string;
  format: string;
  resource_type: string;
  bytes: number;
  [key: string]: any;
}

interface CloudinaryUploadWidgetProps {
  onUpload: (files: CloudinaryFileInfo[]) => void;
  maxFiles?: number;
  folder?: string;
  buttonText?: string;
  className?: string;
  children?: ReactNode;
}

export default function CloudinaryUploadWidget({
  onUpload,
  maxFiles = 10,
  folder = 'products',
  buttonText = 'Upload Images',
  className = '',
  children,
}: CloudinaryUploadWidgetProps) {
  const widgetRef = useRef<any>(null);
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);

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
          // Optionally: show error to user
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
        sources: ['local', 'url', 'camera'],
        multiple: maxFiles > 1,
        maxFiles,
        folder,
        resourceType: 'auto', // Auto-detect resource type based on file
        clientAllowedFormats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'xls', 'xlsx', 'zip'],
        maxFileSize: 10485760, // 10MB limit
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return;
        }

        console.log('Cloudinary upload result:', result);
        console.log('Event type:', result?.event);
        console.log('MaxFiles setting:', maxFiles);

        // Only handle 'queues-end' to avoid duplicate uploads for multiple files
        if (result && result.event === 'queues-end') {
          console.log('Processing queues-end event');
          console.log('Result info:', result.info);
          
          const files: CloudinaryFileInfo[] = result.info.files?.map((f: any) => {
            console.log('Processing file in queues-end:', f);
            return {
              url: f.uploadInfo?.secure_url || f.uploadInfo?.url,
              secure_url: f.uploadInfo?.secure_url,
              public_id: f.uploadInfo?.public_id,
              original_filename: f.uploadInfo?.original_filename || f.name || 'unknown',
              filename: f.uploadInfo?.display_name || f.uploadInfo?.original_filename || f.name,
              format: f.uploadInfo?.format,
              resource_type: f.uploadInfo?.resource_type,
              bytes: f.uploadInfo?.bytes || 0,
              // Include all other properties for compatibility
              ...f.uploadInfo
            };
          }) || [];
          
          console.log('Processed files from queues-end:', files);
          
          if (files.length > 0) {
            console.log('Calling onUpload with files:', files);
            onUpload(files);
          } else {
            console.warn('No files processed from queues-end event');
          }
        }
        
        // For single upload mode (maxFiles === 1), handle 'success'
        if (result && result.event === 'success' && maxFiles === 1) {
          console.log('Processing success event for single file');
          
          const file: CloudinaryFileInfo = {
            url: result.info?.secure_url || result.info?.url,
            secure_url: result.info?.secure_url,
            public_id: result.info?.public_id,
            original_filename: result.info?.original_filename || 'unknown',
            filename: result.info?.display_name || result.info?.original_filename,
            format: result.info?.format,
            resource_type: result.info?.resource_type,
            bytes: result.info?.bytes || 0,
            // Include all other properties for compatibility
            ...result.info
          };
          
          console.log('Calling onUpload with single file:', [file]);
          onUpload([file]);
        }
        
        // Let's also handle individual 'success' events for multiple files
        if (result && result.event === 'success' && maxFiles > 1) {
          console.log('Processing individual success event in multi-file mode');
          console.log('Individual file result:', result.info);
          
          const file: CloudinaryFileInfo = {
            url: result.info?.secure_url || result.info?.url,
            secure_url: result.info?.secure_url,
            public_id: result.info?.public_id,
            original_filename: result.info?.original_filename || 'unknown',
            filename: result.info?.display_name || result.info?.original_filename,
            format: result.info?.format,
            resource_type: result.info?.resource_type,
            bytes: result.info?.bytes || 0,
            // Include all other properties for compatibility
            ...result.info
          };
          
          console.log('Calling onUpload with individual file:', [file]);
          onUpload([file]);
        }
      }
    );
    widgetRef.current = myWidget;

    // Defensive: check .open exists before calling
    if (myWidget && typeof myWidget.open === 'function') {
      myWidget.open();
    } else {
      alert('Cloudinary widget failed to initialize.');
    }
  };

  return children ? (
    <span
      onClick={openWidget}
      style={{
        display: 'inline-block',
        cursor: cloudinaryLoaded ? 'pointer' : 'not-allowed',
      }}
    >
      {children}
    </span>
  ) : (
    <button
      type='button'
      onClick={openWidget}
      className={
        className ||
        'bg-vesoko_dark_blue text-white px-4 py-1.5 rounded hover:bg-vesoko_dark_blue_2 shadow transition'
      }
      disabled={!cloudinaryLoaded}
    >
      {buttonText}
    </button>
  );
}
