const cron = require('node-cron');
const Store = require('../models/Store');
const User = require('../models/User');
const { 
  isStoreInGracePeriod, 
  getGracePeriodDaysRemaining,
  initializeGracePeriod 
} = require('../utils/payment/feeCalculationUtil');
const { 
  sendGracePeriodEndingNotification, 
  sendPlatformFeesActivatedNotification 
} = require('../utils/email/gracePeriodEmailUtils');

class GracePeriodService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the grace period monitoring service
   * Runs daily at 9:00 AM to check for stores needing notifications
   */
  start() {
    if (this.isRunning) {
      console.log('Grace period service is already running');
      return;
    }

    // for testig run 6pmn cst
    this.cronJob = cron.schedule('0 18 * * *', async () => {
      console.log('Running grace period check at', new Date().toISOString());
      await this.checkGracePeriods();
    }, {
      scheduled: true,
      timezone: "America/Chicago"
    });

    // Schedule to run daily at 9:00 AM
    // this.cronJob = cron.schedule('0 9 * * *', async () => {
    //   console.log('Running grace period check at', new Date().toISOString());
    //   await this.checkGracePeriods();
    // }, {
    //   scheduled: true,
    //   timezone: "America/Chicago"
    // });

    this.isRunning = true;
    console.log('Grace period monitoring service started - runs daily at 9:00 AM CST');
  }

  /**
   * Stop the grace period monitoring service
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('Grace period monitoring service stopped');
    }
  }

  /**
   * Manual trigger for checking grace periods (for testing)
   */
  async checkNow() {
    console.log('Manual grace period check triggered at', new Date().toISOString());
    await this.checkGracePeriods();
  }

  /**
   * Main function to check all active stores and send notifications
   */
  async checkGracePeriods() {
    try {
      // Find all active stores with grace period data
      const stores = await Store.find({
        isActive: true,
        gracePeriodStart: { $exists: true },
        gracePeriodEnd: { $exists: true }
      }).populate('ownerId');

      console.log(`Checking ${stores.length} active stores for grace period status`);

      let notificationsSent = 0;
      let feesActivated = 0;

      for (const store of stores) {
        await this.processStore(store, { notificationsSent, feesActivated });
      }

      console.log(`Grace period check completed:`, {
        storesChecked: stores.length,
        notificationsSent: notificationsSent,
        feesActivated: feesActivated
      });

    } catch (error) {
      console.error('Error during grace period check:', error);
    }
  }

  /**
   * Process individual store for grace period status
   * @param {Object} store - Store document with populated owner
   * @param {Object} counters - Counters for tracking notifications/activations
   */
  async processStore(store, counters) {
    try {
      const daysRemaining = getGracePeriodDaysRemaining(store);
      const inGracePeriod = isStoreInGracePeriod(store);

      console.log(`Store: ${store.name} | Grace period days remaining: ${daysRemaining} | In grace period: ${inGracePeriod}`);

      // Check if grace period has ended and fees need to be activated
      if (!inGracePeriod && !store.platformFeesActive) {
        await this.activatePlatformFees(store);
        counters.feesActivated++;
        return;
      }

      // Check if we need to send 2-day warning notification
      if (inGracePeriod && daysRemaining === 2 && !store.gracePeriodNotificationSent) {
        await this.sendGracePeriodWarning(store, daysRemaining);
        counters.notificationsSent++;
        return;
      }

      // Optionally send 1-day warning as well
      if (inGracePeriod && daysRemaining === 1 && !store.gracePeriodNotificationSent) {
        await this.sendGracePeriodWarning(store, daysRemaining);
        counters.notificationsSent++;
        return;
      }

    } catch (error) {
      console.error(`Error processing store ${store.name}:`, error);
    }
  }

  /**
   * Send grace period ending warning notification
   * @param {Object} store - Store document
   * @param {number} daysRemaining - Days remaining in grace period
   */
  async sendGracePeriodWarning(store, daysRemaining) {
    try {
      if (!store.ownerId) {
        console.error(`Store ${store.name} has no owner - skipping notification`);
        return;
      }

      await sendGracePeriodEndingNotification(store, store.ownerId, daysRemaining);
      
      // Mark notification as sent
      await Store.findByIdAndUpdate(store._id, {
        gracePeriodNotificationSent: true
      });

      console.log(`Grace period warning sent to ${store.ownerId.email} for store ${store.name} (${daysRemaining} days remaining)`);
    } catch (error) {
      console.error(`Error sending grace period warning for store ${store.name}:`, error);
    }
  }

  /**
   * Activate platform fees for a store
   * @param {Object} store - Store document
   */
  async activatePlatformFees(store) {
    try {
      if (!store.ownerId) {
        console.error(`Store ${store.name} has no owner - skipping fee activation`);
        return;
      }

      // Update store to mark fees as active
      await Store.findByIdAndUpdate(store._id, {
        platformFeesActive: true
      });

      // Send notification
      await sendPlatformFeesActivatedNotification(store, store.ownerId);

      console.log(`Platform fees activated for store ${store.name} - notification sent to ${store.ownerId.email}`);
    } catch (error) {
      console.error(`Error activating platform fees for store ${store.name}:`, error);
    }
  }

  /**
   * Initialize grace period for a newly activated store
   * @param {String} storeId - Store ID
   * @param {Date} activationDate - Date when store was activated
   */
  async initializeStoreGracePeriod(storeId, activationDate = new Date()) {
    try {
      const gracePeriodData = initializeGracePeriod(activationDate);
      
      await Store.findByIdAndUpdate(storeId, gracePeriodData);
      
      console.log(`Grace period initialized for store ${storeId}:`, {
        start: gracePeriodData.gracePeriodStart,
        end: gracePeriodData.gracePeriodEnd
      });

      return gracePeriodData;
    } catch (error) {
      console.error(`Error initializing grace period for store ${storeId}:`, error);
      throw error;
    }
  }

  /**
   * Get grace period status for a store
   * @param {String} storeId - Store ID
   * @returns {Object} Grace period status information
   */
  async getStoreGracePeriodStatus(storeId) {
    try {
      const store = await Store.findById(storeId);
      if (!store) {
        throw new Error('Store not found');
      }

      const inGracePeriod = isStoreInGracePeriod(store);
      const daysRemaining = getGracePeriodDaysRemaining(store);
      
      return {
        inGracePeriod,
        daysRemaining,
        gracePeriodStart: store.gracePeriodStart,
        gracePeriodEnd: store.gracePeriodEnd,
        platformFeesActive: store.platformFeesActive,
        notificationSent: store.gracePeriodNotificationSent
      };
    } catch (error) {
      console.error(`Error getting grace period status for store ${storeId}:`, error);
      throw error;
    }
  }

  /**
   * Get summary of all stores and their grace period status
   * @returns {Object} Summary statistics
   */
  async getGracePeriodSummary() {
    try {
      const stores = await Store.find({
        isActive: true,
        gracePeriodStart: { $exists: true }
      });

      let inGracePeriod = 0;
      let feesActive = 0;
      let needingNotification = 0;

      for (const store of stores) {
        if (isStoreInGracePeriod(store)) {
          inGracePeriod++;
          const daysRemaining = getGracePeriodDaysRemaining(store);
          if ((daysRemaining <= 2) && !store.gracePeriodNotificationSent) {
            needingNotification++;
          }
        } else if (store.platformFeesActive) {
          feesActive++;
        }
      }

      return {
        totalActiveStores: stores.length,
        inGracePeriod,
        feesActive,
        needingNotification,
        lastChecked: new Date()
      };
    } catch (error) {
      console.error('Error getting grace period summary:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const gracePeriodService = new GracePeriodService();

module.exports = gracePeriodService;
