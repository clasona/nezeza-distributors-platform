// /**
//  * Utility functions for handling Cloudinary URLs correctly
//  */

// /**
//  * Fix Cloudinary URL to use correct resource type based on file extension
//  * @param url - The Cloudinary URL to fix
//  * @param fileType - Optional file type/extension
//  * @returns Fixed URL with correct resource type
//  */
// export const fixCloudinaryUrl = (url: string, fileType?: string): string => {
//   if (!url || !url.includes('res.cloudinary.com')) {
//     return url;
//   }

//   // Extract file type from URL if not provided
//   if (!fileType) {
//     const urlParts = url.split('/');
//     const filename = urlParts[urlParts.length - 1];
//     fileType = filename.split('.').pop() || '';
//   }

//   const type = fileType.toLowerCase();
  
//   // Determine correct resource type
//   const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(type);
//   const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(type);
  
//   let correctResourceType = 'raw'; // Default for documents, PDFs, etc.
  
//   if (isImage) {
//     correctResourceType = 'image';
//   } else if (isVideo) {
//     correctResourceType = 'video';
//   }

//   // Replace incorrect resource type in URL
//   const correctedUrl = url
//     .replace('/image/upload/', `/${correctResourceType}/upload/`)
//     .replace('/video/upload/', `/${correctResourceType}/upload/`)
//     .replace('/raw/upload/', `/${correctResourceType}/upload/`);

//   return correctedUrl;
// };

// /**
//  * Get the correct Cloudinary URL for viewing a file (adds transformations if needed)
//  * @param url - The base Cloudinary URL
//  * @param fileType - File type/extension
//  * @returns URL optimized for viewing
//  */
// export const getViewingUrl = (url: string, fileType?: string): string => {
//   const fixedUrl = fixCloudinaryUrl(url, fileType);
  
//   if (!fileType) {
//     const urlParts = fixedUrl.split('/');
//     const filename = urlParts[urlParts.length - 1];
//     fileType = filename.split('.').pop() || '';
//   }

//   const type = fileType.toLowerCase();
  
//   // For PDFs, ensure we remove any malformed fl_attachment parameters for viewing
//   if (type === 'pdf') {
//     // Remove any fl_attachment parameters (including malformed ones like fl_attachment:filename)
//     let cleanUrl = fixedUrl.replace(/fl_attachment[^,\/]*/g, '');
//     // Clean up any double commas or leading commas in transformations
//     cleanUrl = cleanUrl.replace(/\/upload\/,+/g, '/upload/').replace(/\/upload\/$/g, '/upload/');
//     return cleanUrl;
//   }
  
//   // For images, we can add quality optimization
//   if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) {
//     // Add quality optimization for images if not already present
//     if (!fixedUrl.includes('q_auto')) {
//       return fixedUrl.replace('/upload/', '/upload/q_auto,f_auto/');
//     }
//   }
  
//   return fixedUrl;
// };

// /**
//  * Get the correct Cloudinary URL for downloading a file
//  * @param url - The base Cloudinary URL  
//  * @param filename - Desired filename for download
//  * @returns URL optimized for downloading
//  */
// export const getDownloadUrl = (url: string, filename?: string): string => {
//   const fixedUrl = fixCloudinaryUrl(url);
  
//   // For download, we should use the original secure_url if available without modifications
//   // Cloudinary URLs with proper public_ids work better without forced transformations
//   if (fixedUrl.includes('/upload/')) {
//     let downloadUrl = fixedUrl;
    
//     // Remove any existing malformed fl_attachment parameters first
//     downloadUrl = downloadUrl.replace(/fl_attachment[^,\/]*/g, '');
//     // Clean up any double commas in transformations
//     downloadUrl = downloadUrl.replace(/\/upload\/,+/g, '/upload/').replace(/\/upload\/$/g, '/upload/');
    
//     // Only add fl_attachment if we want to force download (optional)
//     // For most cases, the direct URL works better for PDFs and documents
//     if (filename && filename.toLowerCase().includes('.pdf')) {
//       // For PDFs, we can add fl_attachment to force download, but use proper syntax
//       if (!downloadUrl.includes('fl_attachment')) {
//         downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
//       }
//     }
    
//     return downloadUrl;
//   }
  
//   return fixedUrl;
// };

// /**
//  * Extract Cloudinary public_id from URL
//  * @param url - Cloudinary URL
//  * @returns public_id string
//  */
// export const extractPublicId = (url: string): string => {
//   if (!url.includes('res.cloudinary.com')) {
//     return '';
//   }

//   try {
//     const urlParts = url.split('/');
//     const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
//     if (uploadIndex === -1) return '';
    
//     // Get everything after /upload/ (this includes transformations and path)
//     let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
    
//     // Remove any transformations (parameters before the actual path)
//     // Transformations are comma-separated and come before the path
//     const transformationRegex = /^[^/]*\//; // Matches transformation parameters at the start
//     pathAfterUpload = pathAfterUpload.replace(transformationRegex, '');
    
//     // The public_id includes the full path but excludes the file extension
//     const lastDotIndex = pathAfterUpload.lastIndexOf('.');
//     const publicId = lastDotIndex > 0 ? pathAfterUpload.substring(0, lastDotIndex) : pathAfterUpload;
    
//     return publicId;
//   } catch (error) {
//     console.error('Error extracting public_id from URL:', error);
//     return '';
//   }
// };

// /**
//  * Validate if URL is a valid Cloudinary URL
//  * @param url - URL to validate
//  * @returns boolean indicating if URL is valid Cloudinary URL
//  */
// export const isValidCloudinaryUrl = (url: string): boolean => {
//   if (!url || typeof url !== 'string') return false;
  
//   return url.includes('res.cloudinary.com') && 
//          url.includes('/upload/') && 
//          url.startsWith('https://');
// };

// /**
//  * Get file info from Cloudinary URL
//  * @param url - Cloudinary URL
//  * @returns Object with file information
//  */
// export const getFileInfoFromUrl = (url: string) => {
//   if (!isValidCloudinaryUrl(url)) {
//     return {
//       filename: 'unknown',
//       fileType: 'unknown',
//       public_id: '',
//       isValid: false
//     };
//   }

//   try {
//     const urlParts = url.split('/');
//     const filename = urlParts[urlParts.length - 1] || 'unknown';
//     const fileType = filename.split('.').pop() || 'unknown';
//     const public_id = extractPublicId(url);
    
//     return {
//       filename,
//       fileType,
//       public_id,
//       isValid: true
//     };
//   } catch (error) {
//     return {
//       filename: 'unknown',
//       fileType: 'unknown', 
//       public_id: '',
//       isValid: false
//     };
//   }
// };

// /**
//  * Use secure_url directly without modifications for best compatibility
//  * This is the preferred approach for URLs received from Cloudinary uploads
//  * @param secureUrl - The secure_url from Cloudinary response
//  * @param forceDownload - Whether to add download flag (optional)
//  * @returns Clean URL for direct use
//  */
// export const useSecureUrl = (secureUrl: string, forceDownload: boolean = false): string => {
//   if (!secureUrl || !secureUrl.includes('res.cloudinary.com')) {
//     return secureUrl;
//   }

//   // For PDF files, if we want to force download, we can add fl_attachment
//   if (forceDownload && secureUrl.toLowerCase().includes('.pdf')) {
//     if (!secureUrl.includes('fl_attachment')) {
//       return secureUrl.replace('/upload/', '/upload/fl_attachment/');
//     }
//   }

//   // Otherwise return the URL as-is for maximum reliability
//   return secureUrl;
// };


/**
 * Use Cloudinary's secure_url directly.
 * Optionally force download (adds fl_attachment).
 */
export const useSecureUrl = (secureUrl: string, forceDownload = false): string => {
  if (!secureUrl || !secureUrl.includes('res.cloudinary.com')) return secureUrl;
  if (forceDownload && !secureUrl.includes('fl_attachment')) {
    return secureUrl.replace('/upload/', '/upload/fl_attachment/');
  }
  return secureUrl;
};

/** Very light validator to catch accidental bare filenames. */
export const isCloudinaryDeliveryUrl = (url: string): boolean =>
  typeof url === 'string' &&
  url.startsWith('https://') &&
  url.includes('res.cloudinary.com/') &&
  url.includes('/upload/');

/** Return a safe viewing URL (no rewriting). */
export const getViewingUrl = (url: string): string => {
  return isCloudinaryDeliveryUrl(url) ? url : '';
};

/** Optional: clean download URL (only add fl_attachment). */
export const getDownloadUrl = (url: string): string => {
  if (!isCloudinaryDeliveryUrl(url)) return '';
  if (url.includes('fl_attachment')) return url;
  return url.replace('/upload/', '/upload/fl_attachment/');
};
