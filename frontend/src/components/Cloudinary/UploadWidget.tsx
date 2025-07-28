'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

declare global {
  interface Window {
    cloudinary?: any;
  }
}

interface CloudinaryUploadWidgetProps {
  onUpload: (urls: string[]) => void;
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
      },
      (error: any, result: any) => {
        // Only handle 'queues-end' to avoid duplicate uploads for multiple files
        if (!error && result && result.event === 'queues-end') {
          const urls =
            result.info.files?.map((f: any) => f.uploadInfo?.secure_url) || [];
          if (urls.length > 0) onUpload(urls);
        }
        // For single upload mode (maxFiles === 1), handle 'success'
        if (!error && result && result.event === 'success' && maxFiles === 1) {
          onUpload([result.info.secure_url]);
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
        'bg-nezeza_dark_blue text-white px-4 py-1.5 rounded hover:bg-nezeza_dark_blue_2 shadow transition'
      }
      disabled={!cloudinaryLoaded}
    >
      {buttonText}
    </button>
  );
}
