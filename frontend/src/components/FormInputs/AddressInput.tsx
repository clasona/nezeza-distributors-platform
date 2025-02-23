import React, { useEffect, useState } from 'react';
import TextInput from './TextInput';
import {
  useForm,
  useWatch,
  UseFormRegister,
  FieldValues,
  FieldErrors,
  Control,
} from 'react-hook-form';
import DropdownInput from './DropdownInput';
import countriesWeOperateIn from '@/pages/data/countriesWeOperateIn.json';

interface StateOption {
  // Define the type of your state options
  value: string;
  label: string;
  code?: string;
}

interface AddressInputProps {
  streetFieldName?: string;
  cityFieldName?: string;
  stateFieldName?: string;
  countryFieldName?: string;
  zipCodeFieldName?: string;
  errors: FieldErrors;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
}
const AddressInput = ({
  streetFieldName = 'street',
  cityFieldName = 'city',
  stateFieldName = 'state',
  countryFieldName = 'country',
  zipCodeFieldName = 'zipCode',
  register,
  errors,
  control,
}: AddressInputProps) => {
  const selectedCountry = useWatch({
    control,
    name: `${countryFieldName}`, // Watch the country field
  });

  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);

  // Transform countries JSON to have label and value as expected by DropdownInput element
  const countryOptions = countriesWeOperateIn.map((country) => ({
    value: country.name.toLowerCase(),
    label: country.name,
    statesPath: country.states, // Store the path for easy access
  }));

  // Load states based on the selected country
  useEffect(() => {
    const loadStates = async () => {
      if (!selectedCountry) {
        setStateOptions([
          { value: '', label: 'Select country to load states' }, // Placeholder
        ]);
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
        setStateOptions([
          { value: '', label: 'Select country to load states' },
        ]);
      }
    };

    loadStates();
  }, [selectedCountry]);

  return (
    <>
      <TextInput
        label='Street Address'
        id={streetFieldName}
        name={streetFieldName}
        register={register}
        errors={errors}
        type='text'
      />
      <TextInput
        label='City/District'
        id={cityFieldName}
        name={cityFieldName}
        register={register}
        errors={errors}
        type='text'
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
      />
      <DropdownInput
        label='Country'
        id={countryFieldName}
        name={countryFieldName}
        options={countryOptions}
        register={register}
        errors={errors}
      />
      <TextInput
        label='Zip Code'
        id={zipCodeFieldName}
        name={zipCodeFieldName}
        register={register}
        errors={errors}
        type='text'
      />
    </>
  );
};

export default AddressInput;
