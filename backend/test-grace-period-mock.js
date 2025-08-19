const mongoose = require('mongoose');
const Store = require('./models/Store');
const User = require('./models/User');
require('dotenv').config();

// Mock email functions that don't actually send emails
const mockGracePeriodEmailUtils = {
  async sendGracePeriodEndingNotification(store, owner, daysRemaining) {
    console.log('📧 MOCK EMAIL - Grace Period Ending Notification:');
    console.log('===================================================');
    console.log(`To: ${owner.email}`);
    console.log(`Subject: Platform Fees Starting in ${daysRemaining} Days - ${store.name}`);
    console.log(`Store: ${store.name}`);
    console.log(`Owner: ${owner.firstName} ${owner.lastName}`);
    console.log(`Days Remaining: ${daysRemaining}`);
    console.log(`Grace Period Ends: ${store.gracePeriodEnd.toLocaleDateString()}`);
    console.log('✅ Mock email "sent" successfully!');
    return true;
  },

  async sendPlatformFeesActivatedNotification(store, owner) {
    console.log('📧 MOCK EMAIL - Platform Fees Activated:');
    console.log('========================================');
    console.log(`To: ${owner.email}`);
    console.log(`Subject: Platform Fees Now Active - ${store.name}`);
    console.log(`Store: ${store.name}`);
    console.log(`Owner: ${owner.firstName} ${owner.lastName}`);
    console.log('✅ Mock email "sent" successfully!');
    return true;
  }
};

// Calculate days remaining (same logic as in the utility)
function getGracePeriodDaysRemaining(store) {
  if (!store.gracePeriodEnd) return 0;
  
  const now = new Date();
  const endDate = new Date(store.gracePeriodEnd);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

// Check if store is in grace period
function isStoreInGracePeriod(store) {
  if (!store.gracePeriodStart || !store.gracePeriodEnd) return false;
  
  const now = new Date();
  const startDate = new Date(store.gracePeriodStart);
  const endDate = new Date(store.gracePeriodEnd);
  
  return now >= startDate && now <= endDate;
}

async function mockProcessStore(store) {
  try {
    const daysRemaining = getGracePeriodDaysRemaining(store);
    const inGracePeriod = isStoreInGracePeriod(store);

    console.log(`\n🏪 Processing Store: ${store.name}`);
    console.log(`📅 Grace period days remaining: ${daysRemaining}`);
    console.log(`⏰ In grace period: ${inGracePeriod}`);
    console.log(`🔔 Notification already sent: ${store.gracePeriodNotificationSent || false}`);

    // Check if grace period has ended and fees need to be activated
    if (!inGracePeriod && !store.platformFeesActive) {
      console.log('🚨 Grace period has ENDED - Platform fees should be activated');
      
      await mockGracePeriodEmailUtils.sendPlatformFeesActivatedNotification(store, store.ownerId);
      
      // In real scenario, this would update the store
      console.log('💡 Would update store: { platformFeesActive: true }');
      return 'fees_activated';
    }

    // Check if we need to send 2-day warning notification
    if (inGracePeriod && daysRemaining === 2 && !store.gracePeriodNotificationSent) {
      console.log('⚠️  2-day warning threshold reached - Sending notification');
      
      await mockGracePeriodEmailUtils.sendGracePeriodEndingNotification(store, store.ownerId, daysRemaining);
      
      // In real scenario, this would update the store
      console.log('💡 Would update store: { gracePeriodNotificationSent: true }');
      return 'notification_sent';
    }

    // Check if we need to send 1-day warning as well
    if (inGracePeriod && daysRemaining === 1 && !store.gracePeriodNotificationSent) {
      console.log('⚠️  1-day warning threshold reached - Sending notification');
      
      await mockGracePeriodEmailUtils.sendGracePeriodEndingNotification(store, store.ownerId, daysRemaining);
      
      // In real scenario, this would update the store
      console.log('💡 Would update store: { gracePeriodNotificationSent: true }');
      return 'notification_sent';
    }

    console.log('✅ No action needed for this store');
    return 'no_action';

  } catch (error) {
    console.error(`❌ Error processing store ${store.name}:`, error);
    return 'error';
  }
}

async function testGracePeriodLogic(storeId, simulateDays = null) {
  try {
    console.log('🧪 Testing Grace Period Logic (Mock Mode)');
    console.log('==========================================');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Find the specific store
    let store = await Store.findById(storeId).populate('ownerId');
    
    if (!store) {
      console.log('❌ Store not found');
      return;
    }

    if (!store.ownerId) {
      console.log('❌ Store has no owner - cannot send notifications');
      return;
    }

    console.log(`\n🏪 Found store: ${store.name}`);
    console.log(`👤 Owner: ${store.ownerId.firstName} ${store.ownerId.lastName} (${store.ownerId.email})`);
    
    // If simulating, update the grace period end date
    if (simulateDays !== null) {
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + simulateDays);
      
      console.log(`\n🎭 SIMULATION MODE: Setting grace period to end in ${simulateDays} days`);
      console.log(`📅 Original end date: ${store.gracePeriodEnd ? store.gracePeriodEnd.toLocaleDateString() : 'None'}`);
      console.log(`📅 Simulated end date: ${newEndDate.toLocaleDateString()}`);
      
      // Update the store temporarily (but don't save to DB in this mock)
      store.gracePeriodEnd = newEndDate;
      store.gracePeriodNotificationSent = false; // Reset for testing
    }
    
    // Process the store
    const result = await mockProcessStore(store);
    
    console.log(`\n📊 Result: ${result}`);
    console.log('\n✅ Test completed! No real emails were sent.');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Command line interface
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  node test-grace-period-mock.js <storeId>                # Test current grace period status');
  console.log('  node test-grace-period-mock.js <storeId> <days>         # Simulate grace period ending in X days');
  console.log('');
  console.log('Examples:');
  console.log('  node test-grace-period-mock.js 68a39b1e373d883a2b475832     # Check current status');
  console.log('  node test-grace-period-mock.js 68a39b1e373d883a2b475832 2   # Simulate 2 days remaining');
  console.log('  node test-grace-period-mock.js 68a39b1e373d883a2b475832 1   # Simulate 1 day remaining');
  console.log('  node test-grace-period-mock.js 68a39b1e373d883a2b475832 0   # Simulate grace period ended');
  process.exit(1);
}

const storeId = args[0];
const simulateDays = args[1] ? parseInt(args[1]) : null;

testGracePeriodLogic(storeId, simulateDays).then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
