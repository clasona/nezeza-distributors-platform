/**
 * Test script to verify Cloudinary support ticket attachments
 * Run with: node test-cloudinary-support.js
 */

const axios = require('axios');

// Replace these with your actual values
const BACKEND_URL = 'http://localhost:3001/api/v1'; // Adjust port if different
const AUTH_TOKEN = 'your-auth-token-here'; // Get from browser dev tools

// Test Cloudinary attachment data
const testCloudinaryAttachments = [
  {
    filename: 'test-document.pdf',
    url: 'https://res.cloudinary.com/demo/raw/upload/v1234567890/support-tickets/test-document.pdf',
    fileType: 'pdf',
    fileSize: 125000,
    public_id: 'support-tickets/test-document'
  },
  {
    filename: 'screenshot.png', 
    url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/support-tickets/screenshot.png',
    fileType: 'png',
    fileSize: 85000,
    public_id: 'support-tickets/screenshot'
  }
];

async function testCreateTicketWithCloudinaryAttachments() {
  try {
    console.log('🧪 Testing support ticket creation with Cloudinary attachments...\n');

    const response = await axios.post(`${BACKEND_URL}/support`, {
      subject: 'Test Cloudinary Attachments',
      description: 'This is a test ticket to verify Cloudinary attachment handling',
      category: 'technical_support',
      priority: 'medium',
      cloudinaryAttachments: JSON.stringify(testCloudinaryAttachments)
    }, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Ticket created successfully!');
    console.log('📋 Ticket Details:');
    console.log(`   - Ticket Number: ${response.data.ticket.ticketNumber}`);
    console.log(`   - Subject: ${response.data.ticket.subject}`);
    console.log(`   - Status: ${response.data.ticket.status}`);
    console.log(`   - Attachments Count: ${response.data.ticket.attachments.length}`);
    
    if (response.data.ticket.attachments.length > 0) {
      console.log('\n📎 Attachments:');
      response.data.ticket.attachments.forEach((attachment, index) => {
        console.log(`   ${index + 1}. ${attachment.filename}`);
        console.log(`      URL: ${attachment.url}`);
        console.log(`      Type: ${attachment.fileType}`);
        console.log(`      Size: ${attachment.fileSize} bytes`);
        console.log(`      Public ID: ${attachment.public_id || 'N/A'}`);
        console.log(`      Is Cloudinary: ${attachment.url.includes('res.cloudinary.com') ? '✅' : '❌'}`);
        console.log('');
      });
    }

    return response.data.ticket;
  } catch (error) {
    console.error('❌ Error creating ticket:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Details:', error.response?.data);
    return null;
  }
}

async function testGetTicketDetails(ticketId) {
  try {
    console.log(`🔍 Fetching ticket details for ID: ${ticketId}...\n`);

    const response = await axios.get(`${BACKEND_URL}/support/tickets/${ticketId}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    console.log('✅ Ticket retrieved successfully!');
    console.log('📋 Retrieved Ticket Details:');
    console.log(`   - Ticket Number: ${response.data.ticket.ticketNumber}`);
    console.log(`   - Subject: ${response.data.ticket.subject}`);
    console.log(`   - Status: ${response.data.ticket.status}`);
    
    // Check initial ticket attachments
    if (response.data.ticket.attachments && response.data.ticket.attachments.length > 0) {
      console.log('\n📎 Initial Ticket Attachments:');
      response.data.ticket.attachments.forEach((attachment, index) => {
        console.log(`   ${index + 1}. ${attachment.filename} - ${attachment.url}`);
      });
    }

    // Check message attachments
    if (response.data.ticket.messages && response.data.ticket.messages.length > 0) {
      console.log('\n💬 Messages with Attachments:');
      response.data.ticket.messages.forEach((message, msgIndex) => {
        if (message.attachments && message.attachments.length > 0) {
          console.log(`   Message ${msgIndex + 1}:`);
          message.attachments.forEach((attachment, attIndex) => {
            console.log(`     - ${attachment.filename}: ${attachment.url}`);
          });
        }
      });
    }

    return response.data.ticket;
  } catch (error) {
    console.error('❌ Error fetching ticket:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testAddMessageWithCloudinaryAttachments(ticketId) {
  try {
    console.log(`💬 Adding message with Cloudinary attachments to ticket ${ticketId}...\n`);

    const messageAttachments = [
      {
        filename: 'additional-info.pdf',
        url: 'https://res.cloudinary.com/demo/raw/upload/v1234567890/support-tickets/additional-info.pdf',
        fileType: 'pdf', 
        fileSize: 95000,
        public_id: 'support-tickets/additional-info'
      }
    ];

    const response = await axios.post(`${BACKEND_URL}/support/tickets/${ticketId}/message`, {
      message: 'Here are some additional files for this ticket.',
      cloudinaryAttachments: JSON.stringify(messageAttachments)
    }, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Message added successfully!');
    console.log('📋 Updated Ticket Messages:', response.data.ticket.messages.length);

    return response.data.ticket;
  } catch (error) {
    console.error('❌ Error adding message:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    return null;
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Cloudinary Support Ticket Tests\n');
  console.log('=' .repeat(50) + '\n');

  // Test 1: Create ticket with Cloudinary attachments
  const ticket = await testCreateTicketWithCloudinaryAttachments();
  if (!ticket) {
    console.log('❌ Cannot continue tests - ticket creation failed');
    return;
  }

  console.log('\n' + '=' .repeat(50) + '\n');

  // Test 2: Retrieve ticket details
  await testGetTicketDetails(ticket._id);

  console.log('\n' + '=' .repeat(50) + '\n');

  // Test 3: Add message with attachments
  await testAddMessageWithCloudinaryAttachments(ticket._id);

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 All tests completed!');
  console.log('\n✅ If attachments show Cloudinary URLs, the fix is working!');
  console.log('❌ If attachments show /uploads/support/ URLs, there\'s still an issue.');
}

// Check if AUTH_TOKEN is set
if (AUTH_TOKEN === 'your-auth-token-here') {
  console.log('⚠️  Please update AUTH_TOKEN in this file with your actual token');
  console.log('💡 Get your token from browser dev tools > Application > Local Storage > authToken');
} else {
  runTests();
}
