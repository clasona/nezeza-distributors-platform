import React, { useEffect, useState } from 'react';
import TextInput from './TextInput';
import {
  useForm,
  useWatch,
  UseFormRegister,
  FieldValues,
  FieldErrors,
  Control,
  useFormContext, // Import useFormContext
} from 'react-hook-form';
import DropdownInput from './DropdownInput';
import countriesWeOperateIn from '@/pages/data/countriesWeOperateIn.json';
import DropdownInputSearchable from './DropdownInputSearchable';

// ... (rest of your interfaces)

interface AddressInputProps {
  streetFieldName?: string;
  cityFieldName?: string;
  stateFieldName?: string;
  countryFieldName?: string;
  zipCodeFieldName?: string;
  errors: FieldErrors;
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
  const { setValue } = useFormContext(); // Use useFormContext here

  const selectedCountry = useWatch({
    control,
    name: countryFieldName,
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

  const countryOptions: CountryOption[] = countriesWeOperateIn.map(
    (country) => ({
      value: country.name.toLowerCase(),
      label: country.name,
      statesPath: country.states,
    })
  );

  useEffect(() => {
    const loadStates = async () => {
      // ... (rest of your loadStates logic)
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
    setValue(countryFieldName, option?.value || ''); // Use setValue from context
    setValue(stateFieldName, '');
    setSelectedStateOption(null);
  };

  const handleStateChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedStateOption(option);
    setValue(stateFieldName, option?.value || ''); // Use setValue from context
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
        value={selectedCountryOption}
        className='w-full max-w-xs sm:max-w-md'
        register={register}
        errors={errors}
      />
      <DropdownInputSearchable
        label='State/Province'
        id={stateFieldName}
        name={stateFieldName}
        options={stateOptions}
        onChange={handleStateChange}
        value={selectedStateOption}
        className='w-full max-w-xs sm:max-w-md'
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
