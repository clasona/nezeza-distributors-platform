import React, { useState } from 'react';
import DocumentUploadWidget from '../components/Cloudinary/DocumentUploadWidget';
import { Download, ExternalLink, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

const TestCloudinaryPage = () => {
  const [identityDocResource, setIdentityDocResource] = useState<any>(null);
  const [businessDocResource, setBusinessDocResource] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({
    identityDoc: null,
    businessDoc: null,
  });


  // Function to test file accessibility
  const testFileAccess = async (resource: any, docType: string) => {
    if (!resource || !resource.secure_url) {
      setTestResults(prev => ({
        ...prev,
        [docType]: {
          status: 'error',
          message: 'No file URL to test',
          resource: null,
        }
      }));
      return;
    }

    try {
      // Test if the file is accessible
      const response = await fetch(resource.secure_url, {
        method: 'HEAD',
      });

      setTestResults(prev => ({
        ...prev,
        [docType]: {
          status: response.ok ? 'success' : 'error',
          message: response.ok 
            ? `File is accessible (Status: ${response.status})`
            : `File not accessible (Status: ${response.status})`,
          resource: resource,
          url: resource.secure_url,
          filename: resource.original_filename,
          format: resource.format,
          resourceType: resource.resource_type,
          fileSize: resource.bytes,
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [docType]: {
          status: 'error',
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          resource: resource,
          url: resource.secure_url,
        }
      }));
    }
  };

  const handleIdentityDocUpload = (url: string, info: any) => {
    console.log('Identity Doc Upload:', url, info);
    const resource = {
      secure_url: url,
      original_filename: info.original_filename,
      format: info.format,
      resource_type: info.resource_type,
      bytes: info.bytes,
      ...info
    };
    setIdentityDocResource(resource);
    testFileAccess(resource, 'identityDoc');
  };

  const handleBusinessDocUpload = (url: string, info: any) => {
    console.log('Business Doc Upload:', url, info);
    const resource = {
      secure_url: url,
      original_filename: info.original_filename,
      format: info.format,
      resource_type: info.resource_type,
      bytes: info.bytes,
      ...info
    };
    setBusinessDocResource(resource);
    testFileAccess(resource, 'businessDoc');
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Cloudinary File Upload Test Page
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            This page tests the VerificationDocsInput component to ensure files are uploaded correctly 
            to Cloudinary and can be viewed and downloaded properly.
          </p>
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Upload both identity and business documents using the form below</li>
            <li>Check the test results section for file accessibility status</li>
            <li>Use the "View" and "Download" buttons to test file access</li>
            <li>Check browser console for detailed upload information</li>
          </ol>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <DocumentUploadWidget
            label="1. Identity Document"
            onUpload={handleIdentityDocUpload}
            currentFile={identityDocResource ? {
              url: identityDocResource.secure_url,
              name: identityDocResource.original_filename
            } : null}
            onRemove={() => setIdentityDocResource(null)}
            accept="pdf,jpg,jpeg,png"
            maxFileSize={10}
          />
          <DocumentUploadWidget
            label="2. Business Document"
            onUpload={handleBusinessDocUpload}
            currentFile={businessDocResource ? {
              url: businessDocResource.secure_url,
              name: businessDocResource.original_filename
            } : null}
            onRemove={() => setBusinessDocResource(null)}
            accept="pdf,doc,docx"
            maxFileSize={10}
          />
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Results</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identity Document Results */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Identity Document
              </h3>
              
              {testResults.identityDoc ? (
                <div className="space-y-4">
                  <div className={`flex items-center gap-2 ${
                    testResults.identityDoc.status === 'success' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {testResults.identityDoc.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">{testResults.identityDoc.message}</span>
                  </div>
                  
                  {testResults.identityDoc.resource && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="text-sm">
                        <strong>Filename:</strong> {testResults.identityDoc.filename || 'N/A'}
                      </div>
                      <div className="text-sm">
                        <strong>Format:</strong> {testResults.identityDoc.format || 'N/A'}
                      </div>
                      <div className="text-sm">
                        <strong>Size:</strong> {testResults.identityDoc.fileSize 
                          ? `${(testResults.identityDoc.fileSize / 1024 / 1024).toFixed(2)} MB`
                          : 'N/A'}
                      </div>
                      <div className="text-sm">
                        <strong>Resource Type:</strong> {testResults.identityDoc.resourceType || 'N/A'}
                      </div>
                      <div className="text-sm break-all">
                        <strong>URL:</strong> {testResults.identityDoc.url}
                      </div>
                      
                      {testResults.identityDoc.status === 'success' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => openInNewTab(testResults.identityDoc.url)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </button>
                          <button
                            onClick={() => downloadFile(testResults.identityDoc.url, testResults.identityDoc.filename)}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No identity document uploaded yet</p>
              )}
            </div>

            {/* Business Document Results */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Business Document
              </h3>
              
              {testResults.businessDoc ? (
                <div className="space-y-4">
                  <div className={`flex items-center gap-2 ${
                    testResults.businessDoc.status === 'success' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {testResults.businessDoc.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">{testResults.businessDoc.message}</span>
                  </div>
                  
                  {testResults.businessDoc.resource && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="text-sm">
                        <strong>Filename:</strong> {testResults.businessDoc.filename || 'N/A'}
                      </div>
                      <div className="text-sm">
                        <strong>Format:</strong> {testResults.businessDoc.format || 'N/A'}
                      </div>
                      <div className="text-sm">
                        <strong>Size:</strong> {testResults.businessDoc.fileSize 
                          ? `${(testResults.businessDoc.fileSize / 1024 / 1024).toFixed(2)} MB`
                          : 'N/A'}
                      </div>
                      <div className="text-sm">
                        <strong>Resource Type:</strong> {testResults.businessDoc.resourceType || 'N/A'}
                      </div>
                      <div className="text-sm break-all">
                        <strong>URL:</strong> {testResults.businessDoc.url}
                      </div>
                      
                      {testResults.businessDoc.status === 'success' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => openInNewTab(testResults.businessDoc.url)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </button>
                          <button
                            onClick={() => downloadFile(testResults.businessDoc.url, testResults.businessDoc.filename)}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No business document uploaded yet</p>
              )}
            </div>
          </div>

          {/* Debug Information */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Identity Document Resource:</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(identityDocResource, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Business Document Resource:</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(businessDocResource, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCloudinaryPage;
