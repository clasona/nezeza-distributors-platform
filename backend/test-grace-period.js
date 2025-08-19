const mongoose = require('mongoose');
const gracePeriodService = require('./services/gracePeriodService');
const Store = require('./models/Store');
require('dotenv').config();

/**
 * Test script to manually trigger grace period checks
 * This simulates what would happen when the cron job runs
 */
async function testGracePeriodNotifications() {
  try {
    console.log('🧪 Testing Grace Period Notifications');
    console.log('=====================================');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Get summary before running check
    console.log('\n📊 Grace Period Summary BEFORE:');
    const summaryBefore = await gracePeriodService.getGracePeriodSummary();
    console.log(summaryBefore);
    
    // Find your specific store to check its current status
    const stores = await Store.find({
      isActive: true,
      gracePeriodEnd: { $exists: true }
    }).populate('ownerId');
    
    console.log(`\n🏪 Found ${stores.length} active stores with grace periods:`);
    for (const store of stores) {
      const status = await gracePeriodService.getStoreGracePeriodStatus(store._id);
      console.log(`- ${store.name}: ${status.daysRemaining} days remaining, In grace: ${status.inGracePeriod}, Notification sent: ${status.notificationSent}`);
    }
    
    console.log('\n🚀 Running manual grace period check...');
    
    // Manually trigger the grace period check
    await gracePeriodService.checkNow();
    
    // Get summary after running check
    console.log('\n📊 Grace Period Summary AFTER:');
    const summaryAfter = await gracePeriodService.getGracePeriodSummary();
    console.log(summaryAfter);
    
    console.log('\n✅ Test completed! Check your email and server logs.');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Option to simulate different dates by temporarily updating the grace period end date
async function simulateGracePeriodEnding(storeId, daysFromNow = 2) {
  try {
    console.log(`🧪 Simulating grace period ending in ${daysFromNow} days for testing`);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Update the store's grace period end date to test scenario
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + daysFromNow);
    
    const updatedStore = await Store.findByIdAndUpdate(storeId, {
      gracePeriodEnd: newEndDate,
      gracePeriodNotificationSent: false // Reset notification flag for testing
    }, { new: true });
    
    if (!updatedStore) {
      console.log('❌ Store not found');
      return;
    }
    
    console.log(`📅 Updated ${updatedStore.name} grace period end date to: ${newEndDate.toLocaleDateString()}`);
    console.log(`🔄 Reset notification flag to allow email to be sent`);
    
    // Now run the grace period check
    console.log('\n🚀 Running grace period check with simulated date...');
    await gracePeriodService.checkNow();
    
    console.log('\n✅ Simulation completed! Check your email and server logs.');
    
  } catch (error) {
    console.error('❌ Error during simulation:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Check command line arguments to determine which test to run
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  node test-grace-period.js check                    # Run normal grace period check');
  console.log('  node test-grace-period.js simulate <storeId> [days] # Simulate grace period ending in X days (default: 2)');
  process.exit(1);

  // 68a39b1e373d883a2b475832 Yves
}

const command = args[0];

if (command === 'check') {
  testGracePeriodNotifications();
} else if (command === 'simulate') {
  const storeId = args[1];
  const days = parseInt(args[2]) || 2;
  
  if (!storeId) {
    console.log('❌ Please provide a store ID');
    console.log('Usage: node test-grace-period.js simulate <storeId> [days]');
    process.exit(1);
  }
  
  simulateGracePeriodEnding(storeId, days);
} else {
  console.log('❌ Invalid command. Use "check" or "simulate"');
  process.exit(1);
}
