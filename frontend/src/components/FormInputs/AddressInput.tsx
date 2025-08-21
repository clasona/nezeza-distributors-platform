import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import TextInput from './TextInput';
import {
  useWatch,
  UseFormRegister,
  FieldValues,
  FieldErrors,
  Control,
  UseFormSetValue,
} from 'react-hook-form';
import countriesWeOperateIn from '@/pages/data/countriesWeOperateIn.json';
import DropdownInputSearchable from './DropdownInputSearchable';
import { validateShippingAddress, AddressData, isAddressComplete } from '@/utils/address/validateAddress';
import { AlertTriangle, CheckCircle, Loader2, MapPin } from 'lucide-react';

interface StateOption {
  // Define the type of your state options
  value: string;
  label: string;
  code?: string;
}

interface CountryOption {
  value: string;
  label: string;
  statesPath?: string;
}

interface AddressInputProps {
  addresseeFieldName?: string;
  streetFieldName?: string;
  street2FieldName?: string;
  cityFieldName?: string;
  stateFieldName?: string;
  countryFieldName?: string;
  zipFieldName?: string;
  errors: FieldErrors;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  // Validation props
  enableValidation?: boolean;
  validationType?: 'shipping' | 'billing';
  onValidationComplete?: (isValid: boolean, validatedAddress?: AddressData) => void;
  showValidationButton?: boolean;
  autoValidateDelay?: number; // ms to wait after last change before auto-validating
}

interface ValidationState {
  status: 'idle' | 'validating' | 'valid' | 'invalid' | 'warning';
  message?: string;
  validatedAddress?: AddressData;
}
// Helper function to normalize country codes/names to UI format
const normalizeCountryForUI = (countryInput: string): string => {
  if (!countryInput) return '';
  
  // Country code to name mapping
  const countryMap: Record<string, string> = {
    'US': 'united states',
    'CA': 'canada', 
    'RW': 'rwanda'
  };
  
  const upperInput = countryInput.toUpperCase();
  if (countryMap[upperInput]) {
    return countryMap[upperInput];
  }
  
  // If it's not a code, assume it's a name and normalize to lowercase
  return countryInput.toLowerCase();
};

// Helper function to normalize state codes/names to UI format
const normalizeStateForUI = (stateInput: string, countryCode: string = ''): string => {
  if (!stateInput) return '';
  
  // Check if this is a US address (handle both codes and full names)
  const countryLower = countryCode.toLowerCase();
  const isUSAddress = countryLower === 'us' || 
                     countryLower === 'usa' || 
                     countryLower === 'united states' || 
                     countryCode.toUpperCase() === 'US';
  
  // Only normalize US states for now - can expand for other countries
  if (isUSAddress) {
    // US state abbreviation to name mapping
    const usStateMap: Record<string, string> = {
      'AL': 'alabama', 'AK': 'alaska', 'AS': 'american samoa', 'AZ': 'arizona', 'AR': 'arkansas',
      'CA': 'california', 'CO': 'colorado', 'CT': 'connecticut', 'DE': 'delaware', 'DC': 'district of columbia',
      'FM': 'federated states of micronesia', 'FL': 'florida', 'GA': 'georgia', 'GU': 'guam', 'HI': 'hawaii',
      'ID': 'idaho', 'IL': 'illinois', 'IN': 'indiana', 'IA': 'iowa', 'KS': 'kansas', 'KY': 'kentucky',
      'LA': 'louisiana', 'ME': 'maine', 'MH': 'marshall islands', 'MD': 'maryland', 'MA': 'massachusetts',
      'MI': 'michigan', 'MN': 'minnesota', 'MS': 'mississippi', 'MO': 'missouri', 'MT': 'montana',
      'NE': 'nebraska', 'NV': 'nevada', 'NH': 'new hampshire', 'NJ': 'new jersey', 'NM': 'new mexico',
      'NY': 'new york', 'NC': 'north carolina', 'ND': 'north dakota', 'MP': 'northern mariana islands',
      'OH': 'ohio', 'OK': 'oklahoma', 'OR': 'oregon', 'PW': 'palau', 'PA': 'pennsylvania',
      'PR': 'puerto rico', 'RI': 'rhode island', 'SC': 'south carolina', 'SD': 'south dakota',
      'TN': 'tennessee', 'TX': 'texas', 'UT': 'utah', 'VT': 'vermont', 'VI': 'virgin islands',
      'VA': 'virginia', 'WA': 'washington', 'WV': 'west virginia', 'WI': 'wisconsin', 'WY': 'wyoming'
    };
    
    const upperInput = stateInput.toUpperCase();
    if (usStateMap[upperInput]) {
      return usStateMap[upperInput];
    }
  }
  
  // If it's not an abbreviation, assume it's a name and normalize to lowercase
  return stateInput.toLowerCase();
};

const AddressInput = ({
  addresseeFieldName,
  streetFieldName = 'street',
  street2FieldName = 'street2',
  cityFieldName = 'city',
  stateFieldName = 'state',
  countryFieldName = 'country',
  zipFieldName = 'zip',
  register,
  errors,
  control,
  setValue,
  enableValidation = false,
  validationType = 'shipping',
  onValidationComplete,
  showValidationButton = false,
  autoValidateDelay = 2000,
}: AddressInputProps) => {
  const selectedCountry = useWatch({
    control,
    name: `${countryFieldName}`, // Watch the country field
  });
  
  const selectedState = useWatch({
    control,
    name: `${stateFieldName}`, // Watch the state field
  });

  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [selectedCountryOption, setSelectedCountryOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [selectedStateOption, setSelectedStateOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
  
  // Validation state
  const [validationState, setValidationState] = useState<ValidationState>({
    status: 'idle'
  });
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Watch all address fields for validation
  // Try to get name from addresseeFieldName, or fallback to common name fields
  const nameFieldToWatch = addresseeFieldName || 'storeAddressName';
  const addresseeValue = useWatch({ control, name: nameFieldToWatch });
  const streetValue = useWatch({ control, name: streetFieldName });
  const street2Value = useWatch({ control, name: street2FieldName });
  const cityValue = useWatch({ control, name: cityFieldName });
  const zipValue = useWatch({ control, name: zipFieldName });

  // Transform countries JSON to have label and value as expected by DropdownInput element
  const countryOptions: CountryOption[] = useMemo(() => (
    countriesWeOperateIn
      .filter(country => country.name !== 'Select country')
      .map((country) => ({
        value: country.name.toLowerCase(),
        label: country.name,
        statesPath: country.states,
      }))
  ), []);

  // Load states based on the selected country
  useEffect(() => {
    const loadStates = async () => {
      if (!selectedCountry) {
        setStateOptions([]);
        setSelectedStateOption(null);
        // setStateOptions([
        //   { value: '', label: 'Select country to load states' }, // Placeholder
        // ]);
        return;
      }

      const country = countriesWeOperateIn.find(
        (c) => c.name.toLowerCase() === selectedCountry
      );

      if (country && country.states) {
        setLoadingStates(true);
        try {
          const response = await import(`@/pages/data/${country.states}`);
          const states = response.default;
          const options = states.map((state: any) => ({
            value: state.name.toLowerCase(),
            label: state.name,
            code: state.code, // If available
          }));
          setStateOptions(options);
        } catch (error) {
          console.error('Error loading states:', error);
          setStateOptions([]);
        } finally {
          setLoadingStates(false);
        }
      } else {
        setStateOptions([]);
        setSelectedStateOption(null);
        // setStateOptions([
        //   { value: '', label: 'Select country to load states' },
        // ]);
      }
    };

    loadStates();
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry) {
      const foundCountry = countryOptions.find(
        (option) => option.value === selectedCountry
      );
      if (
        (foundCountry && (!selectedCountryOption || selectedCountryOption.value !== foundCountry.value)) ||
        (!foundCountry && selectedCountryOption !== null)
      ) {
        setSelectedCountryOption(foundCountry || null);
      }
    } else if (selectedCountryOption !== null) {
      setSelectedCountryOption(null);
    }
  }, [selectedCountry, countryOptions, selectedCountryOption]);
  
  // Sync selectedStateOption with form's current state value
  useEffect(() => {
    if (selectedState && stateOptions.length > 0) {
      const foundState = stateOptions.find(
        (option) => option.value === selectedState
      );
      setSelectedStateOption(foundState || null);
    } else if (!selectedState) {
      setSelectedStateOption(null);
    }
  }, [selectedState, stateOptions]);
  
  const handleCountryChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedCountryOption(option);
    // No need to manually setValue here, the DropdownInputSearchable will handle it via register
    setValue(stateFieldName, ''); // Reset state on country change
    setSelectedStateOption(null);
  };

  const handleStateChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedStateOption(option);
    // No need to manually setValue here, the DropdownInputSearchable will handle it via register
  };
  
  // Create address object from current form values
  const getCurrentAddress = useCallback((): AddressData => {
    return {
      name: addresseeValue || '',
      street1: streetValue || '',
      street2: street2Value || '',
      city: cityValue || '',
      state: selectedState || '',
      zip: zipValue || '',
      country: selectedCountry || 'US', // Default to US if not selected
    };
  }, [addresseeValue, streetValue, street2Value, cityValue, selectedState, zipValue, selectedCountry]);
  
  // Validate address function
  const validateAddress = useCallback(async (address: AddressData) => {
    try {
      setValidationState({ status: 'validating' });
      
      // First check completeness
      const completenessCheck = isAddressComplete(address, validationType);
      if (!completenessCheck.valid) {
        setValidationState({
          status: 'invalid',
          message: `Missing required fields: ${completenessCheck.missingFields.join(', ')}`
        });
        onValidationComplete?.(false);
        return;
      }
      
      // Validate with backend
      const result = await validateShippingAddress(address);
      
      if (result.success && result.valid) {
        const finalAddress = result.address || address;
        setValidationState({
          status: 'valid',
          message: 'Address validated successfully',
          validatedAddress: finalAddress
        });
        
        // Update form with normalized address if changes were made
        if (result.address) {
          if (result.address.street1 !== address.street1) {
            setValue(streetFieldName, result.address.street1);
          }
          if (result.address.street2 && result.address.street2 !== address.street2) {
            setValue(street2FieldName, result.address.street2);
          }
          if (result.address.city !== address.city) {
            setValue(cityFieldName, result.address.city);
          }
          if (result.address.state !== address.state) {
            // Normalize the returned state for UI display
            const normalizedState = normalizeStateForUI(result.address.state ?? '', result.address.country ?? '');
            setValue(stateFieldName, normalizedState);
          }
          if (result.address.country !== address.country) {
            // Normalize the returned country for UI display
            const normalizedCountry = normalizeCountryForUI(result.address.country ?? '');
            setValue(countryFieldName, normalizedCountry);
          }
          if (result.address.zip !== address.zip) {
            setValue(zipFieldName, result.address.zip);
          }
        }
        
        onValidationComplete?.(true, finalAddress);
      } else {
        // Extract the specific error message from the response
        const errorMessage = result.error || result.message || 'Address validation failed';
        
        setValidationState({
          status: 'invalid',
          message: errorMessage
        });
        onValidationComplete?.(false);
      }
    } catch (error: any) {
      setValidationState({
        status: 'invalid',
        message: error || 'Failed to validate address'
      });
      onValidationComplete?.(false);
    }
  }, [validationType, onValidationComplete, setValue, streetFieldName, street2FieldName, cityFieldName, stateFieldName, zipFieldName]);
  
  // Manual validation trigger
  const handleValidateClick = () => {
    const address = getCurrentAddress();
    validateAddress(address);
  };
  
  // Auto-validation effect - DISABLED to prevent infinite loops
  // Manual validation via button is preferred
  /*
  useEffect(() => {
    // DISABLED: Auto-validation was causing infinite loops when form fields are updated
    // after successful validation. Manual validation via button works fine.
  }, []);
  */
  
  // Validation status component
  const ValidationStatus = () => {
    if (!enableValidation || validationState.status === 'idle') return null;
    
    const getStatusConfig = () => {
      switch (validationState.status) {
        case 'validating':
          return {
            icon: Loader2,
            color: 'text-blue-600 bg-blue-50 border-blue-200',
            iconColor: 'text-blue-600',
            animate: 'animate-spin'
          };
        case 'valid':
          return {
            icon: CheckCircle,
            color: 'text-green-600 bg-green-50 border-green-200',
            iconColor: 'text-green-600'
          };
        case 'warning':
          return {
            icon: AlertTriangle,
            color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            iconColor: 'text-yellow-600'
          };
        case 'invalid':
        default:
          return {
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-50 border-red-200',
            iconColor: 'text-red-600'
          };
      }
    };
    
    const config = getStatusConfig();
    const IconComponent = config.icon;
    
    return (
      <div className={`mt-3 p-3 rounded-lg border ${config.color} transition-all duration-200`}>
        <div className='flex items-start gap-3'>
          <IconComponent className={`h-5 w-5 mt-0.5 ${config.iconColor} ${config.animate || ''}`} />
          <div className='flex-1'>
            <p className={`text-sm font-medium ${config.iconColor}`}>
              {validationState.status === 'validating' ? 'Validating address...' : 
               validationState.status === 'valid' ? 'Address verified' :
               validationState.status === 'warning' ? 'Address needs attention' :
               'Address validation failed'
              }
            </p>
            {validationState.message && (
              <p className={`text-sm mt-1 ${config.iconColor.replace('600', '500')}`}>
                {validationState.message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {addresseeFieldName && (
        <TextInput
          label='Name'
          id={addresseeFieldName}
          name={addresseeFieldName}
          register={register}
          errors={errors}
          type='text'
        />
      )}
      <TextInput
        label='Street Address'
        id={streetFieldName}
        name={streetFieldName}
        register={register}
        errors={errors}
        type='text'
      />
      <TextInput
        label='Apartment, Suite, Unit, etc.(optional)'
        id={street2FieldName}
        name={street2FieldName}
        register={register}
        errors={errors}
        type='text'
        isRequired={false}
        placeholder='Apartment, suite, unit, building, floor, etc.(optional)'
      />
      <TextInput
        label='City/District'
        id={cityFieldName}
        name={cityFieldName}
        register={register}
        errors={errors}
        type='text'
      />
      <DropdownInputSearchable
        label='Country'
        id={countryFieldName}
        name={countryFieldName}
        options={countryOptions}
        onChange={handleCountryChange}
        register={register}
        errors={errors}
        value={selectedCountryOption}
        // className='w-full max-w-xs sm:max-w-md text-center'
      />
      <DropdownInputSearchable
        label='State/Province'
        id={stateFieldName}
        name={stateFieldName}
        options={stateOptions}
        register={register}
        errors={errors}
        onChange={handleStateChange}
        value={selectedStateOption}
        // className='w-full max-w-xs sm:max-w-md text-center'
        disabled={
          stateOptions.length === 0 || loadingStates || !selectedCountry
        }
        placeholder={
          !selectedCountry
            ? 'Select country first'
            : loadingStates
            ? 'Loading states...'
            : stateOptions.length === 0
            ? 'No states available'
            : 'Select state'
        }
        // isLoading={loadingStates}
      />
      {/* <DropdownInput
        label='Country'
        id={countryFieldName}
        name={countryFieldName}
        options={countryOptions}
        register={register}
        errors={errors}
      />
      <DropdownInput
        label='State/Province'
        id={stateFieldName}
        name={stateFieldName}
        options={stateOptions}
        register={register}
        errors={errors}
        disabled={
          stateOptions.length === 0 || loadingStates || !selectedCountry
        }
        isLoading={loadingStates}
      /> */}

      <TextInput
        label='Zip Code'
        id={zipFieldName}
        name={zipFieldName}
        register={register}
        errors={errors}
        type='text'
        placeholder={selectedCountryOption?.label === 'United States' ? 'e.g., 12345' : 
                    selectedCountryOption?.label === 'Canada' ? 'e.g., K1A 0A6' : 
                    'Enter postal code'}
      />
      
      {/* Validation Button */}
      {enableValidation && showValidationButton && (
        <div className='mt-4'>
          <button
            type='button'
            onClick={handleValidateClick}
            disabled={validationState.status === 'validating'}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              validationState.status === 'validating'
                ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                : 'bg-vesoko_primary text-white hover:bg-vesoko_primary/90'
            }`}
          >
            {validationState.status === 'validating' ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Validating...
              </>
            ) : (
              <>
                <MapPin className='h-4 w-4' />
                Validate Address
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Validation Status */}
      <ValidationStatus />
    </>
  );
};

export default AddressInput;
