import React, { useEffect, useState } from 'react';
import TextInput from './TextInput';
import {
  useForm,
  useWatch,
  UseFormRegister,
  FieldValues,
  FieldErrors,
  Control,
  useFormContext,
  UseFormSetValue,
} from 'react-hook-form';
import DropdownInput from './DropdownInput';
import countriesWeOperateIn from '@/pages/data/countriesWeOperateIn.json';
import DropdownInputSearchable from './DropdownInputSearchable';

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
  streetFieldName?: string;
  cityFieldName?: string;
  stateFieldName?: string;
  countryFieldName?: string;
  zipCodeFieldName?: string;
  errors: FieldErrors;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
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
  setValue
}: AddressInputProps) => {
  const selectedCountry = useWatch({
    control,
    name: `${countryFieldName}`, // Watch the country field
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

  // Transform countries JSON to have label and value as expected by DropdownInput element
  const countryOptions: CountryOption[] = countriesWeOperateIn.map(
    (country) => ({
      value: country.name.toLowerCase(),
      label: country.name,
      statesPath: country.states, // Store the path for easy access
    })
  );

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
      setSelectedCountryOption(foundCountry || null);
    } else {
      setSelectedCountryOption(null);
    }
  }, [selectedCountry, countryOptions]);
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
      <DropdownInputSearchable
        label='Country'
        id={countryFieldName}
        name={countryFieldName}
        options={countryOptions}
        onChange={handleCountryChange}
        register={register}
        errors={errors}
        value={selectedCountryOption}
        className='w-full max-w-xs sm:max-w-md text-center'
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
        className='w-full max-w-xs sm:max-w-md text-center'
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
