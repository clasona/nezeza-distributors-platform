# Cloudinary Integration Setup Guide

This guide explains how to properly configure Cloudinary for secure file uploads in the support system.

## Required Environment Variables

### Backend Environment Variables (Keep these secret!)
Add these to your backend `.env` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Frontend Environment Variables (Safe to expose)
Add these to your frontend `.env.local` file:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET=support_tickets_unsigned
```

## Getting Your Cloudinary Credentials

1. **Sign up for Cloudinary**: Go to [https://cloudinary.com](https://cloudinary.com) and create a free account.

2. **Get your credentials**: After signing up, go to your Dashboard:
   - **Cloud Name**: Found in your dashboard header
   - **API Key**: Found in the "API Keys" section
   - **API Secret**: Found in the "API Keys" section (click "Reveal")

3. **Create Upload Presets**:
   - Go to Settings > Upload presets
   - Create a new unsigned preset named `support_tickets_unsigned`
   - Configure these settings:
     - **Mode**: Unsigned
     - **Folder**: `support-tickets`
     - **Resource Type**: Auto
     - **Max File Size**: 10485760 (10MB)
     - **Allowed Formats**: pdf,doc,docx,txt,jpg,jpeg,png,gif,zip,xls,xlsx
     - **Auto Tagging**: support_ticket
     - **Access Mode**: Public

## Security Considerations

### Current Implementation Issues:
❌ **Using unsigned uploads**: Less secure, anyone with your preset can upload
❌ **Missing signed uploads**: More secure option not implemented  
❌ **No upload signature verification**: Cannot verify upload authenticity
❌ **Environment variables missing**: No proper API key configuration

### Recommended Production Setup:

#### 1. Use Signed Uploads (More Secure)
Replace unsigned uploads with signed uploads using your API secret.

#### 2. Backend Cloudinary Configuration
Create `backend/config/cloudinary.js`:
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

#### 3. Create Signed Upload Endpoint
Add to your backend API:
```javascript
// backend/routes/uploadRoutes.js
const cloudinary = require('../config/cloudinary');

router.post('/sign-upload', async (req, res) => {
  try {
    const { folder, public_id } = req.body;
    
    const signature = cloudinary.utils.api_sign_request(
      {
        folder,
        public_id,
        timestamp: Math.round(Date.now() / 1000),
      },
      process.env.CLOUDINARY_API_SECRET
    );
    
    res.json({
      signature,
      timestamp: Math.round(Date.now() / 1000),
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate signature' });
  }
});
```

## Current Implementation

The system currently uses the `CloudinaryUploadWidget` component from `/components/Cloudinary/UploadWidget.tsx` which:

✅ **Handles multiple file uploads**
✅ **Supports various file formats** 
✅ **Has proper error handling**
✅ **Uses folder organization**
✅ **Integrates with existing UI patterns**

### File Upload Flow:
1. User selects files through CloudinaryUploadWidget
2. Files are uploaded directly to Cloudinary
3. Cloudinary returns secure URLs
4. URLs are converted to attachment objects
5. Attachment objects are sent to backend with ticket/message data
6. Backend validates and stores attachment metadata

## File Constraints

- **Maximum file size**: 10MB per file
- **Maximum files per ticket**: 5 files
- **Maximum files per reply**: 3 files
- **Supported formats**: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF, ZIP, XLS, XLSX
- **Upload folders**: 
  - Initial tickets: `support-tickets/`
  - Replies: `support-tickets/replies/`

## Testing Your Setup

1. **Set environment variables** as described above
2. **Test file upload** in the support ticket creation form
3. **Verify files appear** in your Cloudinary dashboard
4. **Check file URLs** are properly stored in database
5. **Test file download** from ticket details page

## Troubleshooting

### Common Issues:

**Upload fails with "Configuration missing"**
- Check your `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set
- Check your upload preset exists and is unsigned

**Files upload but don't show in tickets**
- Check backend is receiving `cloudinaryAttachments` parameter
- Check attachment URL conversion logic in frontend

**"Invalid signature" errors (if using signed uploads)**
- Verify your `CLOUDINARY_API_SECRET` is correct
- Check timestamp is within allowed range (1 hour)

**Large file upload failures**
- Check file size is under 10MB limit
- Verify preset allows the file format

## Migration from CloudinaryTicketFileUpload

The old `CloudinaryTicketFileUpload` component has been replaced with the standard `CloudinaryUploadWidget` for consistency. Key changes:

- ✅ **Standardized UI** across the application
- ✅ **Better error handling** and loading states  
- ✅ **Consistent upload behavior** with product image uploads
- ✅ **Simplified maintenance** - one upload component to maintain
- ✅ **Better performance** with React optimizations

## Next Steps for Production

1. **Implement signed uploads** for better security
2. **Add file cleanup mechanism** for deleted tickets
3. **Set up CDN optimization** for faster file delivery
4. **Add virus scanning** for uploaded files
5. **Implement file versioning** for audit trails
6. **Add backup strategy** for uploaded files
