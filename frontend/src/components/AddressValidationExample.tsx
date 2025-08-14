import React, { useState, useEffect, useCallback } from 'react';
import { validateShippingAddress, isAddressComplete, AddressData } from '@/utils/address/validateAddress';

interface AddressFormProps {
  onAddressValidated: (validatedAddress: AddressData) => void;
  initialAddress?: AddressData;
}

const AddressValidationExample: React.FC<AddressFormProps> = ({ 
  onAddressValidated, 
  initialAddress 
}) => {
  const [address, setAddress] = useState<AddressData>(initialAddress || {
    fullName: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });

  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    isValidated: boolean;
    errors: string[];
    warnings: string[];
  }>({
    isValidating: false,
    isValidated: false,
    errors: [],
    warnings: []
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Real-time field validation
  const validateFields = useCallback(() => {
    const { valid, missingFields } = isAddressComplete(address, 'shipping');
    
    if (!valid) {
      setFieldErrors({
        general: `Missing required fields: ${missingFields.join(', ')}`
      });
      return false;
    }
    
    setFieldErrors({});
    return true;
  }, [address]);

  // Validate with server (Shippo API)
  const handleValidateAddress = async () => {
    // First check basic field validation
    if (!validateFields()) {
      return;
    }

    setValidationState({
      isValidating: true,
      isValidated: false,
      errors: [],
      warnings: []
    });

    try {
      const result = await validateShippingAddress(address);
      
      if (result.success && result.valid && result.address) {
        // Address is valid - use the normalized version from Shippo
        const validatedAddress = result.address;
        setAddress(validatedAddress);
        
        setValidationState({
          isValidating: false,
          isValidated: true,
          errors: [],
          warnings: []
        });

        // Call parent callback with validated address
        onAddressValidated(validatedAddress);
        
      } else {
        // Address validation failed
        setValidationState({
          isValidating: false,
          isValidated: false,
          errors: [result.error || 'Address validation failed'],
          warnings: []
        });
      }
    } catch (error: any) {
      setValidationState({
        isValidating: false,
        isValidated: false,
        errors: [error.message || 'Failed to validate address'],
        warnings: []
      });
    }
  };

  // Auto-validate when user stops typing (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (address.street1 && address.city && address.state && address.zip) {
        validateFields();
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId);
  }, [address, validateFields]);

  const handleInputChange = (field: keyof AddressData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAddress(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear validation state when user starts typing
    if (validationState.isValidated) {
      setValidationState(prev => ({
        ...prev,
        isValidated: false
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
      
      {/* Validation Status */}
      {validationState.isValidating && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">🔍 Validating address...</p>
        </div>
      )}
      
      {validationState.isValidated && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">✅ Address validated successfully!</p>
        </div>
      )}
      
      {validationState.errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">❌ Validation Errors:</p>
          <ul className="list-disc list-inside mt-1">
            {validationState.errors.map((error, index) => (
              <li key={index} className="text-red-600 text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {fieldErrors.general && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">⚠️ {fieldErrors.general}</p>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={address.fullName || ''}
            onChange={handleInputChange('fullName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            value={address.street1 || ''}
            onChange={handleInputChange('street1')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary"
            placeholder="123 Main St"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address Line 2
          </label>
          <input
            type="text"
            value={address.street2 || ''}
            onChange={handleInputChange('street2')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary"
            placeholder="Apt 4B"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              value={address.city || ''}
              onChange={handleInputChange('city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary"
              placeholder="New York"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              value={address.state || ''}
              onChange={handleInputChange('state')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary"
              placeholder="NY"
              maxLength={2}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              value={address.zip || ''}
              onChange={handleInputChange('zip')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary"
              placeholder="10001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={address.country || 'US'}
              onChange={(e) => setAddress(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              {/* Add more countries as needed */}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={address.phone || ''}
            onChange={handleInputChange('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      {/* Validate Button */}
      <button
        onClick={handleValidateAddress}
        disabled={validationState.isValidating || !address.street1 || !address.city || !address.state || !address.zip}
        className={`w-full mt-6 px-4 py-2 rounded-md font-medium transition-colors ${
          validationState.isValidating || !address.street1 || !address.city || !address.state || !address.zip
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : validationState.isValidated
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {validationState.isValidating ? (
          'Validating...'
        ) : validationState.isValidated ? (
          '✅ Address Validated'
        ) : (
          'Validate Address'
        )}
      </button>

      <p className="mt-2 text-xs text-gray-500 text-center">
        * Required fields. Address will be validated with shipping carriers.
      </p>
    </div>
  );
};

export default AddressValidationExample;
