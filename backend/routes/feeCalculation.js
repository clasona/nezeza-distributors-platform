const express = require('express');
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
    const { productSubtotal, taxAmount, shippingCost, grossUpFees = true } = req.body;

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

    const feeCalculation = calculateOrderFees({
      productSubtotal,
      taxAmount,
      shippingCost,
      grossUpFees
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

    const feeCalculation = calculateMultiSellerOrderFees(suborders, grossUpFees);

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
      grossUpFees
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
