'use client';

import React from 'react';
import AttachmentViewer from '@/components/Support/AttachmentViewer';

const DemoAttachmentsPage = () => {
  // Sample attachment data for testing
  const sampleAttachments = [
    {
      url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      filename: 'sample-image.jpg',
      fileType: 'jpg',
      fileSize: 2048576, // 2MB
      public_id: 'sample-image'
    },
    {
      url: 'https://res.cloudinary.com/demo/raw/upload/sample-document.pdf',
      filename: 'business-proposal.pdf',
      fileType: 'pdf',
      fileSize: 5242880, // 5MB
      public_id: 'business-proposal'
    },
    {
      url: 'https://res.cloudinary.com/demo/raw/upload/spreadsheet.xlsx',
      filename: 'financial-report.xlsx',
      fileType: 'xlsx',
      fileSize: 1048576, // 1MB
      public_id: 'financial-report'
    },
    {
      url: 'https://res.cloudinary.com/demo/raw/upload/archive.zip',
      filename: 'project-files.zip',
      fileType: 'zip',
      fileSize: 10485760, // 10MB
      public_id: 'project-files'
    },
    'https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_fill/sample2.jpg',
    'https://res.cloudinary.com/demo/raw/upload/document.txt'
  ];

  const imageAttachments = [
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
    'https://res.cloudinary.com/demo/image/upload/sample3.jpg'
  ];

  const documentAttachments = [
    {
      url: 'https://res.cloudinary.com/demo/raw/upload/sample-document.pdf',
      filename: 'user-manual.pdf',
      fileType: 'pdf',
      fileSize: 3145728, // 3MB
      public_id: 'user-manual'
    },
    {
      url: 'https://res.cloudinary.com/demo/raw/upload/document.docx',
      filename: 'terms-of-service.docx',
      fileType: 'docx',
      fileSize: 524288, // 512KB
      public_id: 'terms-of-service'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Attachment Viewer Demo
          </h1>
          
          <div className="space-y-12">
            {/* Mixed Attachments */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Mixed File Types
              </h2>
              <p className="text-gray-600 mb-4">
                Demonstrates various file types including images, PDFs, documents, and archives.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <AttachmentViewer 
                  attachments={sampleAttachments}
                  title="Support Ticket Attachments"
                  maxDisplay={3}
                />
              </div>
            </section>

            {/* Image Gallery */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Image Gallery
              </h2>
              <p className="text-gray-600 mb-4">
                Shows how images are displayed with preview thumbnails.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <AttachmentViewer 
                  attachments={imageAttachments}
                  title="Product Images"
                />
              </div>
            </section>

            {/* Document Files */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Document Files
              </h2>
              <p className="text-gray-600 mb-4">
                Displays document files with appropriate icons and file information.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <AttachmentViewer 
                  attachments={documentAttachments}
                  title="Contract Documents"
                />
              </div>
            </section>

            {/* Large List with Pagination */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Large File List (with Show More)
              </h2>
              <p className="text-gray-600 mb-4">
                Demonstrates the "Show More" functionality for large lists of attachments.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <AttachmentViewer 
                  attachments={[
                    ...sampleAttachments,
                    ...imageAttachments,
                    ...documentAttachments,
                    'https://res.cloudinary.com/demo/raw/upload/file1.txt',
                    'https://res.cloudinary.com/demo/raw/upload/file2.csv',
                    'https://res.cloudinary.com/demo/raw/upload/file3.json'
                  ]}
                  title="All Project Files"
                  maxDisplay={4}
                />
              </div>
            </section>

            {/* Admin Ticket View (Compact) */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Admin Ticket View (Compact)
              </h2>
              <p className="text-gray-600 mb-4">
                Shows how attachments appear in admin ticket lists with limited space.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="bg-white border rounded p-4 max-w-xs">
                  <AttachmentViewer 
                    attachments={sampleAttachments.slice(0, 2)}
                    title=""
                    maxDisplay={1}
                    className="max-w-32"
                  />
                </div>
              </div>
            </section>

            {/* No Attachments State */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No Attachments
              </h2>
              <p className="text-gray-600 mb-4">
                Shows the component behavior when there are no attachments.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <AttachmentViewer 
                  attachments={[]}
                  title="Empty Attachments"
                />
                <p className="text-gray-500 mt-4 text-sm">
                  (The component renders nothing when there are no attachments)
                </p>
              </div>
            </section>
          </div>

          {/* Feature List */}
          <div className="mt-12 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              AttachmentViewer Features
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li>• 📁 Supports multiple file types with appropriate icons</li>
              <li>• 🖼️ Image previews with click-to-view modal</li>
              <li>• 📄 PDF preview support in modal</li>
              <li>• 💾 Direct download functionality</li>
              <li>• 🔗 Open in new tab option</li>
              <li>• 📊 File size and type information display</li>
              <li>• 📱 Responsive grid layout</li>
              <li>• 👀 "Show More" functionality for large lists</li>
              <li>• 🎨 Consistent styling across all file types</li>
              <li>• ⚡ Handles both string URLs and full attachment objects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoAttachmentsPage;
