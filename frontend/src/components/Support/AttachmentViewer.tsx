'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Eye, 
  FileText, 
  Image as ImageIcon, 
  File, 
  X,
  ExternalLink,
  FileSpreadsheet,
  FileType,
  Archive
} from 'lucide-react';
import { 
  fixCloudinaryUrl, 
  getViewingUrl, 
  getDownloadUrl, 
  getFileInfoFromUrl 
} from '@/utils/cloudinaryUrlUtils';

interface AttachmentItem {
  url: string;
  filename?: string;
  fileType?: string;
  fileSize?: number;
  public_id?: string;
}

interface AttachmentViewerProps {
  attachments: (string | AttachmentItem)[];
  title?: string;
  className?: string;
  maxDisplay?: number;
}

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
  attachments,
  title = "Attachments",
  className = "",
  maxDisplay
}) => {
  const [viewingAttachment, setViewingAttachment] = useState<AttachmentItem | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Normalize attachments to consistent format
  const normalizedAttachments: AttachmentItem[] = attachments.map((attachment) => {
    if (typeof attachment === 'string') {
      const url = attachment;
      const fileInfo = getFileInfoFromUrl(url);
      return {
        url: fixCloudinaryUrl(url, fileInfo.fileType),
        filename: fileInfo.filename,
        fileType: fileInfo.fileType,
        fileSize: 0,
        public_id: fileInfo.public_id
      };
    }
    // Fix URL for objects too
    return {
      ...attachment,
      url: fixCloudinaryUrl(attachment.url, attachment.fileType)
    };
  });

  // Determine which attachments to display
  const displayedAttachments = maxDisplay && !showAll 
    ? normalizedAttachments.slice(0, maxDisplay)
    : normalizedAttachments;

  const remainingCount = maxDisplay 
    ? Math.max(0, normalizedAttachments.length - maxDisplay)
    : 0;

  // Get file icon based on type
  const getFileIcon = (fileType: string = '') => {
    const type = fileType.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (['pdf'].includes(type)) {
      return <FileText className="w-4 h-4" />;
    } else if (['doc', 'docx'].includes(type)) {
      return <FileText className="w-4 h-4" />;
    } else if (['xls', 'xlsx', 'csv'].includes(type)) {
      return <FileSpreadsheet className="w-4 h-4" />;
    } else if (['zip', 'rar', '7z'].includes(type)) {
      return <Archive className="w-4 h-4" />;
    } else if (['txt', 'md'].includes(type)) {
      return <FileType className="w-4 h-4" />;
    }
    
    return <File className="w-4 h-4" />;
  };

  // Check if file can be previewed
  const canPreview = (fileType: string = '') => {
    const type = fileType.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'].includes(type);
  };

  // Format file size
  const formatFileSize = (bytes: number = 0) => {
    if (bytes === 0) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle download
  const handleDownload = async (attachment: AttachmentItem) => {
    try {
      // Get proper download URL with correct resource type
      const downloadUrl = getDownloadUrl(attachment.url, attachment.filename);
      
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab with corrected URL
      const fallbackUrl = getDownloadUrl(attachment.url, attachment.filename);
      window.open(fallbackUrl, '_blank');
    }
  };

  // Handle preview
  const handlePreview = (attachment: AttachmentItem) => {
    if (canPreview(attachment.fileType || '')) {
      // Make sure to use correct URL with proper resource type
      setViewingAttachment({
        ...attachment,
        url: getViewingUrl(attachment.url, attachment.fileType)
      });
    } else {
      // Open using a corrected URL for viewing
      window.open(getViewingUrl(attachment.url, attachment.fileType), '_blank');
    }
  };

  if (normalizedAttachments.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {title} ({normalizedAttachments.length})
        </h4>
      )}

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayedAttachments.map((attachment, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getFileIcon(attachment.fileType)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate" title={attachment.filename}>
                    {attachment.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {attachment.fileType?.toUpperCase()} • {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
              </div>
            </div>

            {/* Image preview for images */}
            {attachment.fileType && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(attachment.fileType.toLowerCase()) && (
              <div className="mb-3">
                <img
                  src={getViewingUrl(attachment.url, attachment.fileType)}
                  alt={attachment.filename}
                  className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                  onClick={() => handlePreview(attachment)}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-1">
              {canPreview(attachment.fileType) && (
                <button
                  onClick={() => handlePreview(attachment)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  title="Preview file"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
              )}
              
              <button
                onClick={() => handleDownload(attachment)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                title="Download file"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
              
              <button
                onClick={() => window.open(attachment.url, '_blank')}
                className="flex items-center justify-center px-2 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Show more/less button */}
      {maxDisplay && normalizedAttachments.length > maxDisplay && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showAll ? 'Show Less' : `Show ${remainingCount} More`}
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {viewingAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                {getFileIcon(viewingAttachment.fileType)}
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewingAttachment.filename}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(viewingAttachment)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewingAttachment(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
              {viewingAttachment.fileType && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(viewingAttachment.fileType.toLowerCase()) ? (
                <img
                  src={getViewingUrl(viewingAttachment.url, viewingAttachment.fileType)}
                  alt={viewingAttachment.filename}
                  className="max-w-full h-auto"
                />
              ) : viewingAttachment.fileType?.toLowerCase() === 'pdf' ? (
                <iframe
                  src={getViewingUrl(viewingAttachment.url, viewingAttachment.fileType)}
                  className="w-full h-[600px]"
                  title={viewingAttachment.filename}
                />
              ) : (
                <div className="text-center py-8">
                  <File className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Cannot preview this file type.</p>
                  <button
                    onClick={() => handleDownload(viewingAttachment)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentViewer;
