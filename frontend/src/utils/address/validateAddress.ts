import axiosInstance from '../axiosInstance';

export interface AddressData {
  name?: string;
  street1?: string;
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface ValidatedAddress extends AddressData {
  isValidated: boolean;
  validatedAt: Date;
  shippoObjectId?: string;
}

export interface AddressValidationResponse {
  success: boolean;
  valid: boolean;
  address?: ValidatedAddress;
  error?: string;
  message?: string;
  originalAddress?: AddressData;
}

/**
 * Helper function to convert country names back to codes for API validation
 */
const countryNameToCode = (countryName: string): string => {
  if (!countryName) return '';
  
  const nameToCodeMap: Record<string, string> = {
    'united states': 'US',
    'canada': 'CA',
    'rwanda': 'RW'
  };
  
  return nameToCodeMap[countryName.toLowerCase()] || countryName.toUpperCase();
};

/**
 * Helper function to convert state names back to abbreviations for US states
 */
const stateNameToCode = (stateName: string, countryCode: string): string => {
  if (!stateName || countryCode !== 'US') return stateName;
  
  const nameToCodeMap: Record<string, string> = {
    'alabama': 'AL', 'alaska': 'AK', 'american samoa': 'AS', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'district of columbia': 'DC',
    'federated states of micronesia': 'FM', 'florida': 'FL', 'georgia': 'GA', 'guam': 'GU', 'hawaii': 'HI',
    'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS', 'kentucky': 'KY',
    'louisiana': 'LA', 'maine': 'ME', 'marshall islands': 'MH', 'maryland': 'MD', 'massachusetts': 'MA',
    'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT',
    'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
    'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'northern mariana islands': 'MP',
    'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR', 'palau': 'PW', 'pennsylvania': 'PA',
    'puerto rico': 'PR', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
    'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT', 'virgin islands': 'VI',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
  };
  
  return nameToCodeMap[stateName.toLowerCase()] || stateName;
};

/**
 * Validate a shipping address using Shippo API
 * This should be called before saving/using an address for shipping calculations
 */
export const validateShippingAddress = async (address: AddressData): Promise<AddressValidationResponse> => {
  try {
    // Convert normalized names back to codes for API validation
    const countryCode = countryNameToCode(address.country || '');
    const stateCode = stateNameToCode(address.state || '', countryCode);
    
    const addressForValidation = {
      ...address,
      country: countryCode,
      state: stateCode
    };
    
    const response = await axiosInstance.post('/address/validate/shipping', { address: addressForValidation });
    return response.data;
  } catch (error: any) {
    console.error('Shipping address validation error:', error);
    
    // Since axios interceptor converts errors to strings, handle both cases
    return {
      success: false,
      valid: false,
      error: typeof error === 'string' ? error : (error.message || 'Failed to validate shipping address'),
      originalAddress: address
    };
  }
};

/**
 * Validate a billing address using Shippo API
 */
export const validateBillingAddress = async (address: AddressData): Promise<AddressValidationResponse> => {
  try {
    const response = await axiosInstance.post('/address/validate/billing', { address });
    return response.data;
  } catch (error: any) {
    console.error('Billing address validation error:', error);
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      success: false,
      valid: false,
      error: error.message || 'Failed to validate billing address',
      originalAddress: address
    };
  }
};

/**
 * Quick validation without Shippo API (basic field validation only)
 * Use this for real-time form validation
 */
export const quickValidateAddress = async (address: AddressData, type: 'shipping' | 'billing' = 'shipping'): Promise<AddressValidationResponse> => {
  try {
    const response = await axiosInstance.post('/address/validate/quick', { address, type });
    return response.data;
  } catch (error: any) {
    console.error('Quick address validation error:', error);
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      success: false,
      valid: false,
      error: error.message || 'Failed to validate address fields',
      originalAddress: address
    };
  }
};

/**
 * Normalize address format without validation
 * Use this to ensure consistent field naming
 */
export const normalizeAddress = async (address: AddressData): Promise<{ success: boolean; address?: AddressData; error?: string }> => {
  try {
    const response = await axiosInstance.post('/address/normalize', { address });
    return response.data;
  } catch (error: any) {
    console.error('Address normalization error:', error);
    return {
      success: false,
      error: error.message || 'Failed to normalize address'
    };
  }
};

/**
 * Client-side validation for basic required fields
 * Use this for immediate form validation before API calls
 */
export const isAddressComplete = (address: AddressData, type: 'shipping' | 'billing' = 'shipping'): { valid: boolean; missingFields: string[] } => {
  const requiredFields = [
    { key: 'name', alternatives: ['name'], label: 'Store Name' },
    { key: 'street1', alternatives: ['street1', 'street'], label: 'Street Address' },
    { key: 'city', alternatives: ['city'], label: 'City' },
    { key: 'state', alternatives: ['state'], label: 'State' },
    { key: 'zip', alternatives: ['zip', 'zipCode'], label: 'ZIP Code' }
  ];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const hasValue = field.alternatives.some(alt => {
      const value = address[alt as keyof AddressData];
      return value && value.toString().trim() !== '';
    });

    if (!hasValue) {
      missingFields.push(field.label);
    }
  }

  // Basic format validation for US addresses
  const isUSAddress = address.country === 'US' || address.country === 'united states' || !address.country;
  if (isUSAddress) {
    const zip = address.zip || address.zipCode;
    if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) {
      missingFields.push('Valid ZIP Code (12345 or 12345-6789)');
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Format address for display
 */
export const formatAddressForDisplay = (address: AddressData): string => {
  if (!address) return '';
  
  const parts = [
    address.name,
    address.street1 || address.street,
    address.street2,
    `${address.city || ''}, ${address.state || ''} ${address.zip || address.zipCode || ''}`.trim(),
    address.country !== 'US' ? address.country : ''
  ].filter(Boolean);
  
  return parts.join('\n');
};

/**
 * Hook for form validation with real-time feedback
 */
export const useAddressValidation = () => {
  const validateField = (address: AddressData, type: 'shipping' | 'billing' = 'shipping') => {
    return isAddressComplete(address, type);
  };

  const validateWithServer = async (address: AddressData, type: 'shipping' | 'billing' = 'shipping') => {
    if (type === 'shipping') {
      return await validateShippingAddress(address);
    } else {
      return await validateBillingAddress(address);
    }
  };

  const quickValidate = async (address: AddressData, type: 'shipping' | 'billing' = 'shipping') => {
    return await quickValidateAddress(address, type);
  };

  return {
    validateField,
    validateWithServer,
    quickValidate,
    normalizeAddress
  };
};
