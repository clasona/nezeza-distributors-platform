const { validateAddressWithShippo, quickValidateAddress, normalizeAddress, isAddressComplete } = require('../utils/address/validateAddress');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

/**
 * Validate a shipping address using Shippo API
 * This endpoint allows frontend to validate addresses before saving them
 */
const validateShippingAddress = async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Address is required for validation',
        valid: false
      });
    }

    // Validate with Shippo using the new validation endpoint
    const validationResult = await validateAddressWithShippo(address, 'shipping');
    
    // Return the full validation result
    res.status(StatusCodes.OK).json({
      success: validationResult.success,
      valid: validationResult.valid,
      address: validationResult.address,
      originalAddress: validationResult.originalAddress,
      message: validationResult.message,
      warnings: validationResult.warnings || []
    });

  } catch (error) {
    console.error('Address validation error:', error.message || error);
    
    // Return validation failure instead of 500 error
    const errorMsg = error.message || 'Address validation failed';
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      valid: false,
      error: errorMsg,
      message: errorMsg,
      originalAddress: req.body.address
    });
  }
};

/**
 * Validate a billing address
 */
const validateBillingAddress = async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Address is required for validation',
        valid: false
      });
    }

    // Validate with Shippo using the new validation endpoint
    const validationResult = await validateAddressWithShippo(address, 'billing');
    
    // Return the full validation result
    res.status(StatusCodes.OK).json({
      success: validationResult.success,
      valid: validationResult.valid,
      address: validationResult.address,
      originalAddress: validationResult.originalAddress,
      message: validationResult.message,
      warnings: validationResult.warnings || []
    });

  } catch (error) {
    console.error('Billing address validation error:', error);
    
    const errorMsg = error.message || 'Billing address validation failed';
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      valid: false,
      error: errorMsg,
      message: errorMsg,
      originalAddress: req.body.address
    });
  }
};

/**
 * Quick validation check without Shippo API (for basic field validation)
 */
const quickValidateAddressController = async (req, res) => {
  try {
    const { address, type = 'shipping' } = req.body;
    
    if (!address) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Address is required',
        valid: false
      });
    }

    const isComplete = isAddressComplete(address, type);
    const normalized = normalizeAddress(address);
    
    res.status(StatusCodes.OK).json({
      success: true,
      valid: isComplete,
      address: normalized,
      message: isComplete ? 'Address has required fields' : 'Address is missing required fields'
    });

  } catch (error) {
    console.error('Quick address validation error:', error);
    
    const errorMsg = error.message || 'Address validation failed';
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      valid: false,
      error: errorMsg,
      message: errorMsg,
      originalAddress: req.body.address
    });
  }
};

/**
 * Normalize address format without full validation
 */
const normalizeAddressFormat = async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Address is required',
      });
    }

    const normalized = normalizeAddress(address);
    
    res.status(StatusCodes.OK).json({
      success: true,
      address: normalized,
      message: 'Address normalized successfully'
    });

  } catch (error) {
    console.error('Address normalization error:', error);
    
    const errorMsg = error.message || 'Address normalization failed';
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: errorMsg,
      message: errorMsg
    });
  }
};

module.exports = {
  validateShippingAddress,
  validateBillingAddress,
  quickValidateAddress: quickValidateAddressController,
  normalizeAddressFormat
};
