import React from 'react';
import AttachmentViewer from '@/components/Support/AttachmentViewer';
import { fixCloudinaryUrl, getViewingUrl, getDownloadUrl } from '@/utils/cloudinaryUrlUtils';

const TestCloudinaryFix: React.FC = () => {
  // Test URL similar to your failing one
  const testUrls = [
    {
      original: 'https://res.cloudinary.com/dn6xyowrk/image/upload/v1754976992/support-tickets/sntxsdu1vl9fcbr9vqim.pdf',
      filename: 'test-document.pdf',
      fileType: 'pdf',
      fileSize: 2048000
    },
    {
      original: 'https://res.cloudinary.com/dn6xyowrk/image/upload/v1754976992/support-tickets/sample-image.jpg',
      filename: 'test-image.jpg', 
      fileType: 'jpg',
      fileSize: 1024000
    },
    {
      original: 'https://res.cloudinary.com/dn6xyowrk/image/upload/v1754976992/support-tickets/test-doc.docx',
      filename: 'test-document.docx',
      fileType: 'docx', 
      fileSize: 512000
    }
  ];

  const attachments = testUrls.map(item => ({
    url: item.original,
    filename: item.filename,
    fileType: item.fileType,
    fileSize: item.fileSize,
    public_id: item.filename.split('.')[0]
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cloudinary URL Fix Test</h1>
      
      <div className="space-y-8">
        {/* URL Transformation Examples */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">URL Transformations</h2>
          <div className="space-y-4">
            {testUrls.map((item, index) => (
              <div key={index} className="border rounded p-4">
                <h3 className="font-medium mb-2">File: {item.filename}</h3>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Original URL:</strong>
                    <div className="bg-red-50 p-2 rounded mt-1 text-xs break-all">
                      {item.original}
                    </div>
                  </div>
                  
                  <div>
                    <strong>Fixed URL:</strong>
                    <div className="bg-green-50 p-2 rounded mt-1 text-xs break-all">
                      {fixCloudinaryUrl(item.original, item.fileType)}
                    </div>
                  </div>
                  
                  <div>
                    <strong>Viewing URL:</strong>
                    <div className="bg-blue-50 p-2 rounded mt-1 text-xs break-all">
                      {getViewingUrl(item.original, item.fileType)}
                    </div>
                  </div>
                  
                  <div>
                    <strong>Download URL:</strong>
                    <div className="bg-purple-50 p-2 rounded mt-1 text-xs break-all">
                      {getDownloadUrl(item.original, item.filename)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => window.open(getViewingUrl(item.original, item.fileType), '_blank')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Test View
                  </button>
                  <button
                    onClick={() => window.open(getDownloadUrl(item.original, item.filename), '_blank')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Test Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AttachmentViewer Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">AttachmentViewer Test</h2>
          <AttachmentViewer 
            attachments={attachments}
            title="Test Attachments with URL Fixes"
          />
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">What's Fixed</h2>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• <strong>PDF Files:</strong> Changed from /image/upload/ to /raw/upload/</li>
            <li>• <strong>Document Files:</strong> Changed from /image/upload/ to /raw/upload/</li>
            <li>• <strong>Image Files:</strong> Keep using /image/upload/ (correct)</li>
            <li>• <strong>Download URLs:</strong> Added fl_attachment parameter</li>
            <li>• <strong>Viewing URLs:</strong> Removed attachment flags for browser viewing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestCloudinaryFix;
