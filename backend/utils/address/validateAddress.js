const { Shippo } = require('shippo');
const axios = require('axios');
const CustomError = require('../../errors');

const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_TOKEN,
});

/**
 * Validate and normalize an address using Shippo's dedicated validation endpoint
 * This uses the /v2/addresses/validate endpoint which is specifically designed for validation
 * @param {Object} address - The address object to validate
 * @param {string} type - Type of address ('shipping' or 'billing') for error messages
 * @returns {Object} - Validation result with normalized address if valid
 */
const validateAddressWithShippo = async (address, type = 'shipping') => {
  try {
    // First, perform basic validation
    const basicValidation = validateAddressFields(address, type);
    
    // Prepare parameters for Shippo validation endpoint
    const params = new URLSearchParams({
      name: address.fullName || address.name || 'Customer',
      address_line_1: address.street1 || address.street,
      city_locality: address.city,
      state_province: address.state,
      postal_code: address.zip || address.zipCode,
      country_code: (address.country || 'US').toUpperCase()
    });

    // Add optional fields if they exist
    if (address.street2) {
      params.append('address_line_2', address.street2);
    }
    if (address.organization) {
      params.append('organization', address.organization);
    }

    // Call Shippo validation endpoint
    const response = await axios.get(`https://api.goshippo.com/v2/addresses/validate?${params.toString()}`, {
      headers: {
        'Authorization': `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    const validationResult = response.data;
    // console.log(`Shippo validation result for ${type}:`, JSON.stringify(validationResult, null, 2));

    // Check if validation was successful - Shippo v2 uses different structure
    if (!validationResult || !validationResult.analysis || !validationResult.analysis.validation_result) {
      throw new CustomError.BadRequestError(`${type} address validation failed: No validation results returned`);
    }

    const validation = validationResult.analysis.validation_result;
    const reasons = validation.reasons || [];
    const isValid = validation.value === 'valid' || validation.value === 'partially_valid';
    
    // Convert reasons to messages format for compatibility
    const messages = reasons.map(reason => ({
      type: reason.type,
      text: reason.description,
      code: reason.code
    }));

    // Handle validation results
    if (!isValid) {
      // Check if it's missing secondary information (apartment, suite, etc.)
      const missingSecondaryErrors = reasons.filter(r => 
        r.code === 'address_confirmed_missing_secondary' ||
        r.code === 'missing_secondary' ||
        r.description?.toLowerCase().includes('missing secondary')
      );
      
      // For missing secondary info, this is actually an error that requires user action
      if (missingSecondaryErrors.length > 0) {
        console.log(`${type} address missing required secondary info:`, missingSecondaryErrors.map(r => r.description));
        
        // Return specific error message asking user to provide apartment/suite number
        const errorMessage = `This address requires additional information (apartment, suite, unit, etc.). Please add this information to the "Address Line 2" field.`;
        
        throw new CustomError.BadRequestError(errorMessage);
      }
      
      // For other types of errors, fail validation
      const errorMessages = messages
        .filter(m => m.type === 'error')
        .map(m => m.text || m.description)
        .filter(Boolean);
      
      const errorMessage = errorMessages.length > 0
        ? `${type} address validation failed: ${errorMessages.join(', ')}`
        : `${type} address is invalid and cannot be used for shipping`;
      
      throw new CustomError.BadRequestError(errorMessage);
    }

    // Address is valid - check for warnings and corrections
    const warnings = messages
      .filter(m => m.type === 'warning' || m.type === 'info')
      .map(m => m.text || m.message)
      .filter(Boolean);
    
    const corrections = messages
      .filter(m => m.type === 'correction')
      .map(m => m.text || m.description)
      .filter(Boolean);

    if (warnings.length > 0) {
      // console.warn(`Address validation warnings for ${type}:`, warnings);
    }
    
    if (corrections.length > 0) {
      // console.log(`Address corrections applied for ${type}:`, corrections);
    }

    // Use recommended address if available (Shippo provides corrections), otherwise use original
    const addressToUse = validationResult.recommended_address || validationResult.original_address || validationResult;
    
    // Extract normalized address from validation result
    const normalizedAddress = {
      fullName: addressToUse.name || address.fullName || address.name,
      street1: addressToUse.address_line_1 || address.street1 || address.street,
      street2: addressToUse.address_line_2 || address.street2 || '',
      city: addressToUse.city_locality || address.city,
      state: addressToUse.state_province || address.state,
      zip: addressToUse.postal_code || address.zip || address.zipCode,
      country: addressToUse.country_code || address.country || 'US',
      phone: address.phone || '',
      email: address.email || '',
      // Keep original fields for backward compatibility
      name: addressToUse.name || address.fullName || address.name,
      street: addressToUse.address_line_1 || address.street1 || address.street,
      zipCode: addressToUse.postal_code || address.zip || address.zipCode,
      // Add validation metadata
      isValidated: true,
      validatedAt: new Date(),
      validationMessages: messages,
      validationWarnings: warnings,
      validationCorrections: corrections
    };

    // Create success message with corrections and warnings info
    let successMessage = 'Address validated successfully';
    if (corrections.length > 0 && warnings.length > 0) {
      successMessage = `Address validated with corrections and warnings applied`;
    } else if (corrections.length > 0) {
      successMessage = `Address validated with corrections applied (e.g., street name corrected)`;
    } else if (warnings.length > 0) {
      successMessage = `Address validated with warnings: ${warnings.join(', ')}`;
    }

    return {
      success: true,
      valid: true,
      address: normalizedAddress,
      originalAddress: address,
      message: successMessage,
      warnings: warnings,
      corrections: corrections
    };

  } catch (error) {
    // If it's already a CustomError, re-throw it
    if (error.statusCode) {
      throw error;
    }
    
    // Handle Axios/HTTP errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 400) {
        throw new CustomError.BadRequestError(`${type} address validation failed: ${data.detail || data.message || 'Invalid address format'}`);
      } else if (status === 401) {
        throw new CustomError.BadRequestError('Address validation service authentication failed');
      } else if (status >= 500) {
        throw new CustomError.BadRequestError('Address validation service temporarily unavailable');
      }
    }
    
    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new CustomError.BadRequestError('Address validation service temporarily unavailable');
    }
    
    // For other errors, log and provide generic message
    console.error(`Address validation error for ${type}:`, error.message);
    throw new CustomError.BadRequestError(`Unable to validate ${type} address. Please check the address and try again.`);
  }
};

/**
 * Perform basic field validation before calling Shippo API
 * @param {Object} address - Address to validate
 * @param {string} type - Address type for error messages
 * @returns {Object} - Validation result
 */
const validateAddressFields = (address, type) => {
  if (!address || typeof address !== 'object') {
    throw new CustomError.BadRequestError(`${type} address is required`);
  }

  // Required fields with flexible field names
  const requiredMappings = [
    { fields: ['street1', 'street'], name: 'street address' },
    { fields: ['city'], name: 'city' },
    { fields: ['state'], name: 'state' },
    { fields: ['zip', 'zipCode'], name: 'zip code' },
    { fields: ['fullName', 'name'], name: 'name' }
  ];

  const missingFields = [];
  
  for (const mapping of requiredMappings) {
    const hasValue = mapping.fields.some(field => 
      address[field] && address[field].toString().trim() !== ''
    );
    
    if (!hasValue) {
      missingFields.push(mapping.name);
    }
  }

  if (missingFields.length > 0) {
    throw new CustomError.BadRequestError(
      `${type} address is missing required fields: ${missingFields.join(', ')}`
    );
  }

  // Validate country format
  const country = address.country || 'US';
  if (!/^[A-Z]{2}$/.test(country.toUpperCase())) {
    throw new CustomError.BadRequestError(`${type} address country must be a valid 2-letter country code`);
  }

  // Validate US state format if country is US
  if (country.toUpperCase() === 'US') {
    const state = address.state;
    if (!state || !/^[A-Z]{2}$/i.test(state)) {
      throw new CustomError.BadRequestError(`${type} address state must be a valid 2-letter state code for US addresses`);
    }
  }

  // Validate US zip code format if country is US
  if (country.toUpperCase() === 'US') {
    const zip = address.zip || address.zipCode;
    if (!zip || !/^\d{5}(-\d{4})?$/.test(zip)) {
      throw new CustomError.BadRequestError(`${type} address zip code must be in format 12345 or 12345-6789 for US addresses`);
    }
  }

  return { valid: true };
};

/**
 * Quick validation without Shippo API call (for lightweight checks)
 * @param {Object} address - Address to validate
 * @param {string} type - Address type
 * @returns {boolean} - Whether address has required fields
 */
const isAddressComplete = (address, type = 'address') => {
  try {
    validateAddressFields(address, type);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Fast validation check using Shippo's validation endpoint (returns minimal info)
 * Useful for real-time form validation or quick checks
 * @param {Object} address - Address to validate
 * @param {string} type - Address type
 * @returns {Object} - Simple validation result
 */
const quickValidateAddress = async (address, type = 'shipping') => {
  try {
    const result = await validateAddressWithShippo(address, type);
    return {
      success: true,
      valid: result.valid,
      message: result.message,
      warnings: result.warnings || []
    };
  } catch (error) {
    return {
      success: false,
      valid: false,
      error: error.message,
      message: 'Address validation failed'
    };
  }
};

/**
 * Normalize address field names to consistent format
 * @param {Object} address - Address to normalize
 * @returns {Object} - Normalized address
 */
const normalizeAddress = (address) => {
  if (!address) return null;
  
  return {
    fullName: address.fullName || address.name,
    street1: address.street1 || address.street,
    street2: address.street2 || '',
    city: address.city,
    state: address.state,
    zip: address.zip || address.zipCode,
    country: address.country || 'US',
    phone: address.phone || '',
    email: address.email || '',
    // Backward compatibility
    name: address.fullName || address.name,
    street: address.street1 || address.street,
    zipCode: address.zip || address.zipCode
  };
};

module.exports = {
  validateAddressWithShippo,
  quickValidateAddress,
  validateAddressFields,
  isAddressComplete,
  normalizeAddress
};
