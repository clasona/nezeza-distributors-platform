/**
 * Utility functions for handling Cloudinary attachments in support tickets
 */

/**
 * Validate Cloudinary attachment data
 * @param {Array} cloudinaryAttachments - Array of Cloudinary file objects
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
const validateCloudinaryAttachments = (cloudinaryAttachments) => {
  const errors = [];
  
  if (!Array.isArray(cloudinaryAttachments)) {
    return { isValid: false, errors: ['Cloudinary attachments must be an array'] };
  }

  // Validate each attachment
  cloudinaryAttachments.forEach((attachment, index) => {
    const requiredFields = ['filename', 'url', 'fileType', 'fileSize', 'public_id'];
    
    requiredFields.forEach(field => {
      if (!attachment[field]) {
        errors.push(`Attachment ${index + 1}: Missing required field '${field}'`);
      }
    });

    // Validate URL format (should be Cloudinary URL)
    if (attachment.url && !attachment.url.includes('res.cloudinary.com')) {
      errors.push(`Attachment ${index + 1}: Invalid Cloudinary URL format`);
    }

    // Validate file size (max 10MB)
    if (attachment.fileSize && attachment.fileSize > 10 * 1024 * 1024) {
      errors.push(`Attachment ${index + 1}: File size exceeds 10MB limit`);
    }

    // Validate file type
    const allowedTypes = [
      'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 
      'png', 'gif', 'zip', 'xls', 'xlsx'
    ];
    
    if (attachment.fileType && !allowedTypes.includes(attachment.fileType.toLowerCase())) {
      errors.push(`Attachment ${index + 1}: Unsupported file type '${attachment.fileType}'`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Process and format Cloudinary attachments for database storage
 * @param {Array} cloudinaryAttachments - Raw Cloudinary attachment data
 * @returns {Array} - Formatted attachment objects
 */
const processCloudinaryAttachments = (cloudinaryAttachments) => {
  if (!cloudinaryAttachments || !Array.isArray(cloudinaryAttachments)) {
    return [];
  }

  return cloudinaryAttachments.map(attachment => ({
    filename: attachment.filename || attachment.original_filename || 'Unknown',
    url: attachment.url || attachment.secure_url,
    fileType: attachment.fileType || attachment.format || 'unknown',
    fileSize: attachment.fileSize || attachment.bytes || 0,
    public_id: attachment.public_id
  }));
};

/**
 * Combine traditional file uploads with Cloudinary attachments
 * @param {Array} traditionalAttachments - Processed traditional file uploads
 * @param {Array} cloudinaryAttachments - Processed Cloudinary attachments
 * @returns {Array} - Combined attachment array
 */
const combineAttachments = (traditionalAttachments = [], cloudinaryAttachments = []) => {
  const combined = [];
  
  // Add traditional attachments
  if (traditionalAttachments && traditionalAttachments.length > 0) {
    combined.push(...traditionalAttachments);
  }
  
  // Add Cloudinary attachments
  if (cloudinaryAttachments && cloudinaryAttachments.length > 0) {
    const processed = processCloudinaryAttachments(cloudinaryAttachments);
    combined.push(...processed);
  }
  
  return combined;
};

/**
 * Clean up Cloudinary files (for deletion when ticket is closed)
 * Note: This would typically integrate with Cloudinary's admin API
 * @param {Array} attachments - Array of attachment objects with public_ids
 * @returns {Promise} - Promise resolving when cleanup is complete
 */
const cleanupCloudinaryFiles = async (attachments) => {
  try {
    // Extract public_ids from attachments
    const publicIds = attachments
      .filter(attachment => attachment.public_id)
      .map(attachment => attachment.public_id);
    
    if (publicIds.length === 0) {
      return { success: true, message: 'No Cloudinary files to clean up' };
    }

    // TODO: Implement actual Cloudinary deletion
    // const cloudinary = require('cloudinary').v2;
    // const result = await cloudinary.api.delete_resources(publicIds);
    
    console.log(`Would delete ${publicIds.length} files from Cloudinary:`, publicIds);
    
    return {
      success: true,
      message: `Marked ${publicIds.length} files for cleanup`,
      publicIds
    };
  } catch (error) {
    console.error('Error cleaning up Cloudinary files:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to cleanup Cloudinary files'
    };
  }
};

/**
 * Log attachment processing for debugging
 * @param {Object} context - Context information
 * @param {Array} attachments - Processed attachments
 */
const logAttachmentProcessing = (context, attachments) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${context.action}] Processing attachments for ${context.type}:`, {
      ticketId: context.ticketId,
      userId: context.userId,
      attachmentCount: attachments.length,
      attachments: attachments.map(att => ({
        filename: att.filename,
        fileType: att.fileType,
        fileSize: att.fileSize,
        hasPublicId: !!att.public_id,
        isCloudinary: att.url.includes('res.cloudinary.com')
      }))
    });
  }
};

module.exports = {
  validateCloudinaryAttachments,
  processCloudinaryAttachments,
  combineAttachments,
  cleanupCloudinaryFiles,
  logAttachmentProcessing
};
