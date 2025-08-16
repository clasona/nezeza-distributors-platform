/**
 * Database migration script to fix Cloudinary URLs with incorrect resource types
 * Run with: node scripts/fix-cloudinary-urls.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const { fixCloudinaryUrl } = require('../utils/cloudinaryAttachmentUtils');

// Import models - adjust paths as needed
const SupportTicket = require('../models/SupportTicket');

// Function to fix Cloudinary URL (same as backend utility)
function fixUrl(url, fileType) {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  if (!fileType && url) {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    fileType = filename.split('.').pop() || '';
  }

  if (!fileType) return url;

  const type = fileType.toLowerCase();
  
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(type);
  const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(type);
  
  let correctResourceType = 'raw';
  
  if (isImage) {
    correctResourceType = 'image';
  } else if (isVideo) {
    correctResourceType = 'video';
  }

  return url
    .replace('/image/upload/', `/${correctResourceType}/upload/`)
    .replace('/video/upload/', `/${correctResourceType}/upload/`)
    .replace('/raw/upload/', `/${correctResourceType}/upload/`);
}

async function fixCloudinaryUrls() {
  try {
    console.log('🔧 Starting Cloudinary URL Fix Migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find all support tickets with attachments
    const tickets = await SupportTicket.find({
      $or: [
        { 'attachments.0': { $exists: true } },
        { 'messages.attachments.0': { $exists: true } }
      ]
    });

    console.log(`📋 Found ${tickets.length} tickets with attachments`);

    let ticketsUpdated = 0;
    let attachmentsFixed = 0;

    for (const ticket of tickets) {
      let ticketModified = false;

      // Fix main ticket attachments
      if (ticket.attachments && ticket.attachments.length > 0) {
        ticket.attachments.forEach(attachment => {
          const originalUrl = attachment.url;
          const fixedUrl = fixUrl(originalUrl, attachment.fileType);
          
          if (originalUrl !== fixedUrl) {
            attachment.url = fixedUrl;
            attachmentsFixed++;
            ticketModified = true;
            console.log(`  🔧 Fixed: ${attachment.filename || 'Unknown'}`);
            console.log(`     From: ${originalUrl}`);
            console.log(`     To:   ${fixedUrl}`);
          }
        });
      }

      // Fix message attachments
      if (ticket.messages && ticket.messages.length > 0) {
        ticket.messages.forEach(message => {
          if (message.attachments && message.attachments.length > 0) {
            message.attachments.forEach(attachment => {
              const originalUrl = attachment.url;
              const fixedUrl = fixUrl(originalUrl, attachment.fileType);
              
              if (originalUrl !== fixedUrl) {
                attachment.url = fixedUrl;
                attachmentsFixed++;
                ticketModified = true;
                console.log(`  🔧 Fixed (message): ${attachment.filename || 'Unknown'}`);
                console.log(`     From: ${originalUrl}`);
                console.log(`     To:   ${fixedUrl}`);
              }
            });
          }
        });
      }

      // Save ticket if modified
      if (ticketModified) {
        await ticket.save();
        ticketsUpdated++;
        console.log(`✅ Updated ticket: ${ticket.ticketNumber}`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Tickets processed: ${tickets.length}`);
    console.log(`   Tickets updated: ${ticketsUpdated}`);
    console.log(`   Attachments fixed: ${attachmentsFixed}`);
    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📎 Disconnected from MongoDB');
  }
}

// Run the migration if called directly
if (require.main === module) {
  fixCloudinaryUrls();
}

module.exports = {
  fixCloudinaryUrls
};
