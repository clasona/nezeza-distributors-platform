import { Upload, FileText, Check, X, Download } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

interface CloudinaryTicketFileUploadProps {
  label?: string;
  className?: string;
  onFilesChange: (files: any[]) => void; // Callback to send files to parent
  maxFiles?: number;
}

const CloudinaryTicketFileUpload = ({
  label,
  className = '',
  onFilesChange,
  maxFiles = 5,
}: CloudinaryTicketFileUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (result: any) => {
    if (result.info && typeof result.info !== 'string') {
      const newFile = {
        filename: result.info.original_filename,
        url: result.info.secure_url,
        fileType: result.info.format,
        fileSize: result.info.bytes,
        public_id: result.info.public_id,
      };
      
      const updatedFiles = [...uploadedFiles, newFile];
      setUploadedFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {/* Upload Widget */}
        {uploadedFiles.length < maxFiles && (
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET || 'test-soko'}
            options={{
              resourceType: 'raw', // Allow any file type
              clientAllowedFormats: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'xls', 'xlsx'],
              maxFileSize: 10485760, // 10MB limit
              sources: ['local'],
              multiple: false,
              folder: 'support-tickets',
            }}
            onOpen={() => {
              setIsUploading(true);
              setError(null);
            }}
            onSuccess={(result, { widget }) => {
              console.log('Upload successful:', result);
              handleFileUpload(result);
              setIsUploading(false);
              setError(null);
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
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={isUploading || uploadedFiles.length >= maxFiles}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-dashed rounded-lg transition-all duration-200 ${
                    isUploading
                      ? 'border-blue-300 bg-blue-50 text-blue-700 cursor-wait'
                      : uploadedFiles.length >= maxFiles
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-vesoko_dark_blue hover:bg-vesoko_dark_blue hover:text-white'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      <span className="font-medium">Uploading...</span>
                    </>
                  ) : uploadedFiles.length >= maxFiles ? (
                    <>
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">Maximum files reached ({maxFiles})</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="font-medium">
                        Click to Upload Files ({uploadedFiles.length}/{maxFiles})
                      </span>
                    </>
                  )}
                </button>
              );
            }}
          </CldUploadWidget>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Uploaded Files ({uploadedFiles.length}/{maxFiles}):
            </p>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.fileType?.toUpperCase()} • {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-vesoko_dark_blue hover:text-vesoko_green_600 transition-colors"
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Instructions */}
        <div className="text-xs text-gray-500">
          <p>• Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF, ZIP, XLS, XLSX</p>
          <p>• Maximum file size: 10MB per file</p>
          <p>• Maximum {maxFiles} files allowed</p>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryTicketFileUpload;
