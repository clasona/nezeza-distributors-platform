const express = require('express');
const router = express.Router();
const gracePeriodService = require('../../services/gracePeriodService');
const Store = require('../../models/Store');
const { sendGracePeriodEndingNotification, sendPlatformFeesActivatedNotification } = require('../../utils/email/gracePeriodEmailUtils');
const { authenticateUser, authorizePermissions } = require('../../middleware/authentication');

// Manual trigger for grace period check (for testing)
router.post('/check-now', authenticateUser, authorizePermissions('manage_grace_periods'), async (req, res) => {
  try {
    await gracePeriodService.checkNow();
    res.json({
      success: true,
      message: 'Grace period check completed successfully'
    });
  } catch (error) {
    console.error('Error in manual grace period check:', error);
    res.status(500).json({
      success: false,
      message: 'Grace period check failed',
      error: error.message
    });
  }
});

// Get grace period summary
router.get('/summary', authenticateUser, authorizePermissions('manage_grace_periods'), async (req, res) => {
  try {
    const summary = await gracePeriodService.getGracePeriodSummary();
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting grace period summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get grace period summary',
      error: error.message
    });
  }
});

// Get specific store's grace period status
router.get('/store/:storeId', authenticateUser, authorizePermissions('manage_grace_periods'), async (req, res) => {
  try {
    const { storeId } = req.params;
    const status = await gracePeriodService.getStoreGracePeriodStatus(storeId);
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting store grace period status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get store grace period status',
      error: error.message
    });
  }
});

// Initialize grace period for a store (manual override)
router.post('/initialize/:storeId', authenticateUser, authorizePermissions('manage_grace_periods'), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { activationDate } = req.body;
    
    const activationDateObj = activationDate ? new Date(activationDate) : new Date();
    const gracePeriodData = await gracePeriodService.initializeStoreGracePeriod(storeId, activationDateObj);
    
    res.json({
      success: true,
      message: 'Grace period initialized successfully',
      data: gracePeriodData
    });
  } catch (error) {
    console.error('Error initializing grace period:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize grace period',
      error: error.message
    });
  }
});

// Manually send 2-day warning notification to a specific store
router.post('/store/:storeId/send-warning', authenticateUser, authorizePermissions('manage_grace_periods'), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { daysRemaining = 2, forceNotification = false } = req.body;
    
    // Find the store with populated owner
    const store = await Store.findById(storeId).populate('ownerId');
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    if (!store.ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Store has no owner - cannot send notification'
      });
    }
    
    // Check if notification was already sent (unless forcing)
    if (!forceNotification && store.gracePeriodNotificationSent) {
      return res.status(400).json({
        success: false,
        message: 'Grace period notification has already been sent to this store. Use forceNotification=true to send anyway.'
      });
    }
    
    // Send the notification
    await sendGracePeriodEndingNotification(store, store.ownerId, daysRemaining);
    
    // Mark notification as sent (unless this is a forced notification)
    if (!forceNotification) {
      await Store.findByIdAndUpdate(storeId, {
        gracePeriodNotificationSent: true
      });
    }
    
    console.log(`Manual grace period warning sent to ${store.ownerId.email} for store ${store.name} (${daysRemaining} days)`);
    
    res.json({
      success: true,
      message: `Grace period warning notification sent successfully to ${store.ownerId.email}`,
      data: {
        storeName: store.name,
        ownerEmail: store.ownerId.email,
        daysRemaining,
        notificationMarkedAsSent: !forceNotification
      }
    });
    
  } catch (error) {
    console.error('Error sending grace period warning:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send grace period warning notification',
      error: error.message
    });
  }
});

// Manually activate platform fees for a store (end grace period)
router.post('/store/:storeId/activate-fees', authenticateUser, authorizePermissions('manage_grace_periods'), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { sendNotification = true } = req.body;
    
    // Find the store with populated owner
    const store = await Store.findById(storeId).populate('ownerId');
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    if (!store.ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Store has no owner - cannot send notification'
      });
    }
    
    // Update store to activate platform fees
    await Store.findByIdAndUpdate(storeId, {
      platformFeesActive: true
    });
    
    let notificationSent = false;
    if (sendNotification) {
      try {
        await sendPlatformFeesActivatedNotification(store, store.ownerId);
        notificationSent = true;
        console.log(`Platform fees activated notification sent to ${store.ownerId.email} for store ${store.name}`);
      } catch (emailError) {
        console.error('Failed to send platform fees activation notification:', emailError);
      }
    }
    
    res.json({
      success: true,
      message: `Platform fees activated successfully for ${store.name}`,
      data: {
        storeName: store.name,
        ownerEmail: store.ownerId.email,
        platformFeesActive: true,
        notificationSent
      }
    });
    
  } catch (error) {
    console.error('Error activating platform fees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate platform fees',
      error: error.message
    });
  }
});

// Manually send platform fees activated notification email only (without changing store status)
router.post('/store/:storeId/send-activation-email', authenticateUser, authorizePermissions('manage_grace_periods'), async (req, res) => {
  try {
    const { storeId } = req.params;
    
    // Find the store with populated owner
    const store = await Store.findById(storeId).populate('ownerId');
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    if (!store.ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Store has no owner - cannot send notification'
      });
    }
    
    // Send the platform fees activated notification
    await sendPlatformFeesActivatedNotification(store, store.ownerId);
    
    console.log(`Platform fees activated notification sent to ${store.ownerId.email} for store ${store.name}`);
    
    res.json({
      success: true,
      message: `Platform fees activated notification sent successfully to ${store.ownerId.email}`,
      data: {
        storeName: store.name,
        ownerEmail: store.ownerId.email,
        storeId: store._id
      }
    });
    
  } catch (error) {
    console.error('Error sending platform fees activated notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send platform fees activated notification',
      error: error.message
    });
  }
});

// Reset grace period notification flag for a store (for testing)
router.post('/store/:storeId/reset-notification', authenticateUser, authorizePermissions('manage_grace_periods'), async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const store = await Store.findByIdAndUpdate(storeId, {
      gracePeriodNotificationSent: false
    }, { new: true });
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    res.json({
      success: true,
      message: `Notification flag reset for store ${store.name}`,
      data: {
        storeName: store.name,
        gracePeriodNotificationSent: false
      }
    });
    
  } catch (error) {
    console.error('Error resetting notification flag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset notification flag',
      error: error.message
    });
  }
});

module.exports = router;
