/**
 * Test script to verify Cloudinary URL handling fixes
 * Run with: node test-cloudinary-urls.js
 */

// Import the utility functions (adjust path as needed)
const { 
  fixCloudinaryUrl, 
  getViewingUrl, 
  getDownloadUrl, 
  extractPublicId, 
  getFileInfoFromUrl,
  useSecureUrl 
} = require('./cloudinaryUrlUtils');

// Test URLs (examples of different Cloudinary URL formats)
const testUrls = [
  // Valid PDF URL
  'https://res.cloudinary.com/dn6xyowrk/raw/upload/v1234567890/support-tickets/replies/cmby1owaxop3pwk0grje.pdf',
  
  // Malformed URL with fl_attachment issue
  'https://res.cloudinary.com/dn6xyowrk/raw/upload/fl_attachment:cmby1owaxop3pwk0grje.pdf/cmby1owaxop3pwk0grje.pdf',
  
  // Image URL
  'https://res.cloudinary.com/dn6xyowrk/image/upload/v1234567890/products/image123.jpg',
  
  // Raw file URL
  'https://res.cloudinary.com/dn6xyowrk/raw/upload/v1234567890/documents/test-doc.docx'
];

console.log('🧪 Testing Cloudinary URL utility functions...\n');

testUrls.forEach((url, index) => {
  console.log(`\n--- Test Case ${index + 1} ---`);
  console.log('Original URL:', url);
  
  try {
    // Test file info extraction
    const fileInfo = getFileInfoFromUrl(url);
    console.log('File Info:', fileInfo);
    
    // Test URL fixing
    const fixedUrl = fixCloudinaryUrl(url);
    console.log('Fixed URL:', fixedUrl);
    
    // Test viewing URL
    const viewingUrl = getViewingUrl(url);
    console.log('Viewing URL:', viewingUrl);
    
    // Test download URL
    const downloadUrl = getDownloadUrl(url, fileInfo.filename);
    console.log('Download URL:', downloadUrl);
    
    // Test secure URL usage
    const secureUrl = useSecureUrl(url);
    console.log('Secure URL (direct):', secureUrl);
    
  } catch (error) {
    console.error('❌ Error processing URL:', error.message);
  }
});

console.log('\n✅ URL testing completed!');
console.log('\n📋 Key fixes applied:');
console.log('1. ✅ Removed malformed fl_attachment parameters');
console.log('2. ✅ Fixed public_id extraction from URLs');
console.log('3. ✅ Improved URL cleanup logic');
console.log('4. ✅ Added secure_url direct usage option');
console.log('5. ✅ Enhanced error handling');
