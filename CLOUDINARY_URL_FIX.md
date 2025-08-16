# Cloudinary URL Fix Documentation

## Problem

The support ticket system was generating incorrect Cloudinary URLs that resulted in files not being viewable. Specifically, PDF and document files were using the `/image/upload/` path instead of the correct `/raw/upload/` path.

### Example of the Issue

**Broken URL:** 
```
https://res.cloudinary.com/dn6xyowrk/image/upload/v1754976992/support-tickets/sntxsdu1vl9fcbr9vqim.pdf
```

**Fixed URL:**
```
https://res.cloudinary.com/dn6xyowrk/raw/upload/v1754976992/support-tickets/sntxsdu1vl9fcbr9vqim.pdf
```

## Root Cause

Cloudinary uses different resource types for different file formats:

- **Images** (jpg, png, gif, etc.): `/image/upload/`
- **Videos** (mp4, avi, etc.): `/video/upload/`  
- **Documents/Raw files** (pdf, doc, txt, etc.): `/raw/upload/`

The issue occurred because:

1. The Cloudinary upload widget wasn't properly configured to use `resourceType: 'auto'`
2. URLs were being stored without validation of the correct resource type
3. No URL correction was happening when displaying attachments

## Solution Implemented

### 1. Frontend URL Utilities (`/frontend/src/utils/cloudinaryUrlUtils.ts`)

Created utility functions to automatically fix URLs:

- `fixCloudinaryUrl()` - Corrects resource type based on file extension
- `getViewingUrl()` - Optimizes URLs for browser viewing  
- `getDownloadUrl()` - Adds attachment flags for downloading

### 2. Updated AttachmentViewer Component

The `AttachmentViewer` component now:

- Automatically fixes all attachment URLs on load
- Uses correct URLs for viewing, downloading, and previewing
- Handles both string URLs and attachment objects

### 3. Backend URL Processing

Updated `cloudinaryAttachmentUtils.js` to:

- Fix URLs during attachment processing
- Ensure stored URLs use correct resource types
- Validate URL formats

### 4. Upload Widget Configuration

Updated `CloudinaryUploadWidget.tsx` to:

- Use `resourceType: 'auto'` for proper detection
- Add file format restrictions
- Set appropriate file size limits

### 5. Database Migration Script

Created `/backend/scripts/fix-cloudinary-urls.js` to:

- Fix existing URLs in the database
- Update both ticket attachments and message attachments
- Provide detailed logging of changes

## File Types Handled

| File Extension | Cloudinary Resource Type | URL Path |
|----------------|-------------------------|----------|
| jpg, jpeg, png, gif, webp, svg | `image` | `/image/upload/` |
| mp4, avi, mov, wmv, flv, webm | `video` | `/video/upload/` |
| pdf, doc, docx, txt, xls, xlsx, zip | `raw` | `/raw/upload/` |

## Testing

### Test Script

A Node.js test script (`test-url-fix.js`) verifies the URL fixes:

```bash
node test-url-fix.js
```

### Test Page  

A React test page (`/test-cloudinary-fix`) demonstrates:

- URL transformations
- AttachmentViewer functionality  
- Before/after comparisons

### Manual Testing

1. **Original broken URL:** `https://res.cloudinary.com/dn6xyowrk/image/upload/v1754976992/support-tickets/sntxsdu1vl9fcbr9vqim.pdf`
2. **Fixed working URL:** `https://res.cloudinary.com/dn6xyowrk/raw/upload/v1754976992/support-tickets/sntxsdu1vl9fcbr9vqim.pdf`

## Implementation Steps

### 1. Deploy Code Changes

All frontend and backend changes are backward-compatible and can be deployed immediately.

### 2. Run Database Migration (Optional)

To fix existing URLs in the database:

```bash
cd backend
node scripts/fix-cloudinary-urls.js
```

### 3. Verify Fix

- Test attachment viewing in existing support tickets
- Create new tickets with various file types
- Verify URLs are generated correctly

## Benefits

- ✅ **PDF and document files now viewable in browser**
- ✅ **Proper download functionality**
- ✅ **Consistent URL handling across file types**  
- ✅ **Backward compatibility with existing attachments**
- ✅ **Automatic fixing of legacy URLs**
- ✅ **Improved user experience**

## Future Improvements

1. **Signed Uploads**: Implement signed upload presets for better security
2. **File Optimization**: Add automatic image optimization parameters
3. **CDN Integration**: Configure custom domain for faster delivery
4. **File Cleanup**: Implement automatic deletion of orphaned files
5. **Virus Scanning**: Add file scanning before storage

## Troubleshooting

### If Files Still Don't Load

1. Check browser console for network errors
2. Verify Cloudinary cloud name is correct
3. Ensure files exist in Cloudinary dashboard
4. Test URLs manually in browser

### If New Uploads Fail

1. Verify environment variables are set
2. Check Cloudinary upload preset configuration
3. Ensure file formats are in allowed list
4. Verify file size is under limits

### For Additional File Types

Add new extensions to the file type arrays in:
- `cloudinaryUrlUtils.ts`
- `cloudinaryAttachmentUtils.js`
- Upload widget configuration

## Support

For issues related to this fix:

1. Check browser console errors
2. Review backend logs for attachment processing
3. Test URLs directly in browser
4. Run the test script to verify fix logic
5. Check Cloudinary dashboard for file existence
