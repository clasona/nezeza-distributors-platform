/**
 * Cloudinary PDF URL Normalizer
 * Ensures all PDF URLs are in the correct format for download without corruption
 */

/**
 * Normalize Cloudinary PDF URL to ensure proper download format
 * @param {string} url - The Cloudinary URL to normalize
 * @returns {string|null} - Normalized URL or null if invalid
 */
const normalizePdfUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Check if it's a Cloudinary URL
  if (!url.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    
    // Find the cloud name and upload index
    const cloudNameIndex = pathSegments.findIndex(segment => segment !== 'image' && segment !== 'video' && segment !== 'raw');
    const uploadIndex = pathSegments.indexOf('upload');
    
    if (cloudNameIndex === -1 || uploadIndex === -1) {
      return null;
    }

    const cloudName = pathSegments[cloudNameIndex];
    
    // Extract public_id (everything after 'upload/')
    const publicIdSegments = pathSegments.slice(uploadIndex + 1);
    
    if (publicIdSegments.length === 0) {
      return null;
    }

    // Remove transformations - anything that looks like transformation parameters
    const cleanSegments = publicIdSegments.filter(segment => {
      // Skip transformation parameters (w_300, h_200, etc.)
      return !segment.match(/^[a-z]_\d+$/) && 
             !segment.match(/^[a-z]_[a-z]+$/) && 
             !segment.includes(',');
    });

    if (cleanSegments.length === 0) {
      return null;
    }

    // Get the public_id (join remaining segments)
    let publicId = cleanSegments.join('/');
    
    // Ensure it ends with .pdf
    if (!publicId.toLowerCase().endsWith('.pdf')) {
      // Remove any existing extension and add .pdf
      publicId = publicId.replace(/\.[^.]*$/, '') + '.pdf';
    }

    // Construct the normalized URL
    const normalizedUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`;
    
    return normalizedUrl;
  } catch (error) {
    console.error('Error normalizing PDF URL:', error);
    return null;
  }
};

/**
 * Extract public_id from normalized PDF URL
 * @param {string} url - The normalized Cloudinary PDF URL
 * @returns {string|null} - The public_id or null if invalid
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const match = url.match(/\/raw\/upload\/(.+)\.pdf$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

/**
 * Validate and normalize attachment URLs
 * @param {Array} attachments - Array of attachment URLs or objects
 * @param {number} maxCount - Maximum number of attachments allowed
 * @returns {Object} - { isValid: boolean, normalizedAttachments: Array, errors: Array }
 */
const validateAndNormalizePdfAttachments = (attachments, maxCount = 10) => {
  const errors = [];
  const normalizedAttachments = [];

  if (!Array.isArray(attachments)) {
    return {
      isValid: false,
      normalizedAttachments: [],
      errors: ['Attachments must be an array']
    };
  }

  if (attachments.length > maxCount) {
    return {
      isValid: false,
      normalizedAttachments: [],
      errors: [`Too many attachments. Maximum allowed: ${maxCount}`]
    };
  }

  attachments.forEach((attachment, index) => {
    let url = attachment;
    
    // Handle different attachment formats
    if (typeof attachment === 'object') {
      url = attachment.url || attachment.secure_url || attachment.link;
    }

    if (!url) {
      errors.push(`Attachment ${index + 1}: Missing URL`);
      return;
    }

    // Check if it's a PDF (basic check)
    if (!url.toLowerCase().includes('.pdf') && !url.includes('format=pdf')) {
      errors.push(`Attachment ${index + 1}: Only PDF files are allowed`);
      return;
    }

    const normalizedUrl = normalizePdfUrl(url);
    
    if (!normalizedUrl) {
      errors.push(`Attachment ${index + 1}: Invalid or unsupported URL format`);
      return;
    }

    const publicId = extractPublicId(normalizedUrl);
    
    // Store both URL and structured data
    normalizedAttachments.push({
      url: normalizedUrl,
      public_id: publicId,
      resource_type: 'raw',
      format: 'pdf',
      filename: `${publicId?.split('/').pop() || 'document'}.pdf`,
      fileType: 'pdf',
      originalUrl: url
    });
  });

  return {
    isValid: errors.length === 0,
    normalizedAttachments,
    errors
  };
};

/**
 * Generate download URL from stored attachment data
 * @param {Object} attachmentData - The stored attachment data
 * @returns {string} - Download URL
 */
const generateDownloadUrl = (attachmentData) => {
  if (!attachmentData) {
    return null;
  }

  // If we have a normalized URL, use it
  if (attachmentData.url) {
    return attachmentData.url;
  }

  // If we have structured data, construct the URL
  if (attachmentData.public_id && attachmentData.resource_type === 'raw') {
    // Extract cloud name from environment or use default
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudName) {
      return `https://res.cloudinary.com/${cloudName}/raw/upload/${attachmentData.public_id}.${attachmentData.format || 'pdf'}`;
    }
  }

  return null;
};

/**
 * Process attachments for safe JSON parsing
 * @param {string|Array} attachments - Attachments as string or array
 * @returns {Array} - Parsed attachments array
 */
const safeParseAttachments = (attachments) => {
  if (!attachments) {
    return [];
  }

  if (Array.isArray(attachments)) {
    return attachments;
  }

  if (typeof attachments === 'string') {
    try {
      const parsed = JSON.parse(attachments);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing attachments JSON:', error);
      return [];
    }
  }

  return [];
};

module.exports = {
  normalizePdfUrl,
  extractPublicId,
  validateAndNormalizePdfAttachments,
  generateDownloadUrl,
  safeParseAttachments
};
