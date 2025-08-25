const express = require('express');
const Store = require('../models/Store');
const router = express.Router();
const { 
  calculateOrderFees, 
  calculateMultiSellerOrderFees, 
  getFrontendFeeDisplay 
} = require('../utils/payment/feeCalculationUtil');

/**
 * POST /api/fee-calculation/single
 * Calculate fees for a single order/suborder
 */
router.post('/single', async (req, res) => {
  try {
    const { productSubtotal, taxAmount, shippingCost, grossUpFees = true, storeId } = req.body;

    // Validate required fields
    if (typeof productSubtotal !== 'number' || typeof taxAmount !== 'number' || typeof shippingCost !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'productSubtotal, taxAmount, and shippingCost must be numbers'
      });
    }

    if (productSubtotal < 0 || taxAmount < 0 || shippingCost < 0) {
      return res.status(400).json({
        success: false,
        error: 'All amounts must be non-negative'
      });
    }

    // Fetch store information if storeId is provided
    let store = null;
    if (storeId) {
      try {
        store = await Store.findById(storeId);
        if (!store) {
          console.warn(`Store not found for ID: ${storeId}`);
        } 
        // else {
        //   // console.log(`Found store for fee calculation: ${store.name}, grace period: ${store.gracePeriodStart} - ${store.gracePeriodEnd}`);
        // }
      } catch (storeError) {
        console.error('Error fetching store for fee calculation:', storeError);
      }
    }

    const feeCalculation = calculateOrderFees({
      productSubtotal,
      taxAmount,
      shippingCost,
      grossUpFees,
      store
    });

    res.json({
      success: true,
      data: feeCalculation
    });

  } catch (error) {
    console.error('Error calculating single order fees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate fees'
    });
  }
});

/**
 * POST /api/fee-calculation/multi-seller
 * Calculate fees for multiple sellers/suborders
 */
router.post('/multi-seller', async (req, res) => {
  try {
    const { suborders, grossUpFees = true } = req.body;

    // Validate suborders array
    if (!Array.isArray(suborders) || suborders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'suborders must be a non-empty array'
      });
    }

    // Validate each suborder has required fields
    for (const suborder of suborders) {
      if (typeof suborder.productSubtotal !== 'number' || 
          typeof suborder.taxAmount !== 'number' || 
          typeof suborder.shippingCost !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Each suborder must have productSubtotal, taxAmount, and shippingCost as numbers'
        });
      }
    }

    // Fetch store information for each suborder if storeId is provided
    const Store = require('../models/Store');
    const processedSuborders = await Promise.all(
      suborders.map(async (suborder) => {
        let store = null;
        if (suborder.storeId) {
          try {
            store = await Store.findById(suborder.storeId);
            // console.log(`Processing suborder for store ID: ${store._id}`);
            if (!store) {
              console.warn(`Store not found for ID: ${suborder.storeId}`);
            } else {
              // console.log(`Found store for multi-seller fee calculation: ${store.name}, grace period: ${store.gracePeriodStart} - ${store.gracePeriodEnd}`);
            }
          } catch (storeError) {
            console.error('Error fetching store for multi-seller fee calculation:', storeError);
          }
        }
        
        return {
          ...suborder,
          store // Add store object to suborder
        };
      })
    );

    // console.log('suborders for multi-seller fee calculation:', processedSuborders);
    const feeCalculation = calculateMultiSellerOrderFees({ 
      suborders: processedSuborders, 
      grossUpFees 
    });

    res.json({
      success: true,
      data: feeCalculation
    });

  } catch (error) {
    console.error('Error calculating multi-seller fees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate multi-seller fees'
    });
  }
});

/**
 * POST /api/fee-calculation/display
 * Get frontend-friendly fee display format
 */
router.post('/display', async (req, res) => {
  try {
    const { productSubtotal, taxAmount, shippingCost, grossUpFees = true } = req.body;

    if (typeof productSubtotal !== 'number' || typeof taxAmount !== 'number' || typeof shippingCost !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'productSubtotal, taxAmount, and shippingCost must be numbers'
      });
    }

    const feeCalculation = calculateOrderFees({
      productSubtotal,
      taxAmount,
      shippingCost,
      grossUpFees,
      store: null // No store context for display format
    });

    const displayFormat = getFrontendFeeDisplay(feeCalculation);

    res.json({
      success: true,
      data: displayFormat
    });

  } catch (error) {
    console.error('Error getting fee display format:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fee display format'
    });
  }
});

module.exports = router;
