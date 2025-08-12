/**
 * Test script to verify Cloudinary URL fixes
 * Run with: node test-url-fix.js
 */

// Simulate the URL fixing functions (same logic as the React utility)
function fixCloudinaryUrl(url, fileType) {
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
}

function getViewingUrl(url, fileType) {
  const fixedUrl = fixCloudinaryUrl(url, fileType);
  
  if (!fileType) {
    const urlParts = fixedUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    fileType = filename.split('.').pop() || '';
  }

  const type = fileType.toLowerCase();
  
  // For PDFs, remove any attachment flags for better viewing
  if (type === 'pdf') {
    return fixedUrl.replace(/fl_attachment[^/]*\//, '');
  }
  
  return fixedUrl;
}

function getDownloadUrl(url, filename) {
  const fixedUrl = fixCloudinaryUrl(url);
  
  // Add attachment flag to force download
  if (fixedUrl.includes('/upload/')) {
    let downloadUrl = fixedUrl;
    
    // Add fl_attachment transformation if not present
    if (!downloadUrl.includes('fl_attachment')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    }
    
    return downloadUrl;
  }
  
  return fixedUrl;
}

// Test the specific failing URL
const testUrl = 'https://res.cloudinary.com/dn6xyowrk/image/upload/v1754976992/support-tickets/sntxsdu1vl9fcbr9vqim.pdf';
const filename = 'sntxsdu1vl9fcbr9vqim.pdf';
const fileType = 'pdf';

console.log('🔧 Cloudinary URL Fix Test');
console.log('=' .repeat(50));
console.log();

console.log('Original URL (BROKEN):');
console.log('❌', testUrl);
console.log();

console.log('Fixed URL (for viewing):');
const fixedUrl = getViewingUrl(testUrl, fileType);
console.log('✅', fixedUrl);
console.log();

console.log('Download URL (with attachment flag):');
const downloadUrl = getDownloadUrl(testUrl, filename);
console.log('💾', downloadUrl);
console.log();

console.log('Analysis:');
console.log('- Original uses: /image/upload/ (wrong for PDF)');
console.log('- Fixed uses: /raw/upload/ (correct for PDF)');
console.log('- This should make the PDF viewable in browser');
console.log();

console.log('Test these URLs in your browser:');
console.log('1. Original (will fail): ' + testUrl);
console.log('2. Fixed (should work): ' + fixedUrl);
console.log();

// Test additional formats
const additionalTests = [
  { url: 'https://res.cloudinary.com/dn6xyowrk/image/upload/v123/test.docx', expected: 'raw' },
  { url: 'https://res.cloudinary.com/dn6xyowrk/image/upload/v123/test.jpg', expected: 'image' },
  { url: 'https://res.cloudinary.com/dn6xyowrk/image/upload/v123/test.mp4', expected: 'video' },
  { url: 'https://res.cloudinary.com/dn6xyowrk/image/upload/v123/test.xlsx', expected: 'raw' }
];

console.log('Additional Format Tests:');
console.log('-' .repeat(30));
additionalTests.forEach(test => {
  const fixed = fixCloudinaryUrl(test.url);
  const resourceType = fixed.includes('/image/upload/') ? 'image' : 
                      fixed.includes('/video/upload/') ? 'video' : 'raw';
  const isCorrect = resourceType === test.expected;
  console.log(`${isCorrect ? '✅' : '❌'} ${test.url.split('/').pop()}: ${resourceType} (expected: ${test.expected})`);
});

module.exports = {
  fixCloudinaryUrl,
  getViewingUrl,
  getDownloadUrl
};
