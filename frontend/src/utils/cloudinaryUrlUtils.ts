/**
 * Utility functions for handling Cloudinary URLs correctly
 */

/**
 * Fix Cloudinary URL to use correct resource type based on file extension
 * @param url - The Cloudinary URL to fix
 * @param fileType - Optional file type/extension
 * @returns Fixed URL with correct resource type
 */
export const fixCloudinaryUrl = (url: string, fileType?: string): string => {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  // Extract file type from URL if not provided
  if (!fileType) {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    fileType = filename.split('.').pop() || '';
  }

  const type = fileType.toLowerCase();
  
  // Determine correct resource type
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(type);
  const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(type);
  
  let correctResourceType = 'raw'; // Default for documents, PDFs, etc.
  
  if (isImage) {
    correctResourceType = 'image';
  } else if (isVideo) {
    correctResourceType = 'video';
  }

  // Replace incorrect resource type in URL
  const correctedUrl = url
    .replace('/image/upload/', `/${correctResourceType}/upload/`)
    .replace('/video/upload/', `/${correctResourceType}/upload/`)
    .replace('/raw/upload/', `/${correctResourceType}/upload/`);

  return correctedUrl;
};

/**
 * Get the correct Cloudinary URL for viewing a file (adds transformations if needed)
 * @param url - The base Cloudinary URL
 * @param fileType - File type/extension
 * @returns URL optimized for viewing
 */
export const getViewingUrl = (url: string, fileType?: string): string => {
  const fixedUrl = fixCloudinaryUrl(url, fileType);
  
  if (!fileType) {
    const urlParts = fixedUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    fileType = filename.split('.').pop() || '';
  }

  const type = fileType.toLowerCase();
  
  // For PDFs, add transformation to enable viewing in browser
  if (type === 'pdf') {
    // Add fl_attachment parameter to force download if needed, or remove it for viewing
    return fixedUrl.replace(/fl_attachment[^/]*/, '');
  }
  
  // For images, we can add quality optimization
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) {
    // Add quality optimization for images if not already present
    if (!fixedUrl.includes('q_auto')) {
      return fixedUrl.replace('/upload/', '/upload/q_auto,f_auto/');
    }
  }
  
  return fixedUrl;
};

/**
 * Get the correct Cloudinary URL for downloading a file
 * @param url - The base Cloudinary URL  
 * @param filename - Desired filename for download
 * @returns URL optimized for downloading
 */
export const getDownloadUrl = (url: string, filename?: string): string => {
  const fixedUrl = fixCloudinaryUrl(url);
  
  // Add attachment flag to force download
  if (fixedUrl.includes('/upload/')) {
    let downloadUrl = fixedUrl;
    
    // Add fl_attachment transformation if not present
    if (!downloadUrl.includes('fl_attachment')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    }
    
    // Add custom filename if provided
    if (filename && !downloadUrl.includes(`fl_attachment:${filename}`)) {
      downloadUrl = downloadUrl.replace('fl_attachment', `fl_attachment:${filename}`);
    }
    
    return downloadUrl;
  }
  
  return fixedUrl;
};

/**
 * Extract Cloudinary public_id from URL
 * @param url - Cloudinary URL
 * @returns public_id string
 */
export const extractPublicId = (url: string): string => {
  if (!url.includes('res.cloudinary.com')) {
    return '';
  }

  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return '';
    
    // Get everything after /upload/ but before the file extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
    const publicIdWithExtension = pathAfterUpload.split('/').pop() || '';
    const publicId = publicIdWithExtension.split('.')[0];
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return '';
  }
};

/**
 * Validate if URL is a valid Cloudinary URL
 * @param url - URL to validate
 * @returns boolean indicating if URL is valid Cloudinary URL
 */
export const isValidCloudinaryUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  return url.includes('res.cloudinary.com') && 
         url.includes('/upload/') && 
         url.startsWith('https://');
};

/**
 * Get file info from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Object with file information
 */
export const getFileInfoFromUrl = (url: string) => {
  if (!isValidCloudinaryUrl(url)) {
    return {
      filename: 'unknown',
      fileType: 'unknown',
      public_id: '',
      isValid: false
    };
  }

  try {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1] || 'unknown';
    const fileType = filename.split('.').pop() || 'unknown';
    const public_id = extractPublicId(url);
    
    return {
      filename,
      fileType,
      public_id,
      isValid: true
    };
  } catch (error) {
    return {
      filename: 'unknown',
      fileType: 'unknown', 
      public_id: '',
      isValid: false
    };
  }
};
