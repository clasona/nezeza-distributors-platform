import React, { useEffect } from 'react';
import AddressInput from '../AddressInput';
import DropdownInput from '../DropdownInput';
import TextInput from '../TextInput';
import countries from '@/pages/data/countries.json';
import {
  Control,
  FieldErrors,
  FieldValues,
  useForm,
  UseFormRegister,
} from 'react-hook-form';
import StoreFormHeading from './StoreFormHeading';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';

interface PrimaryContactInputProps {
  errors: FieldErrors;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  setValue: (name: string, value: string) => void;
  control: Control<FieldValues>;
}

const PrimaryContactInput = ({
  register,
  errors,
  setValue,
  control,
}: PrimaryContactInputProps) => {
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );
  // transform countries & states json to have label and value as expected by DropdownInput element
  const countryOptions = countries.map((country) => ({
    value: country.name.toLowerCase(),
    label: country.name,
  }));

  useEffect(() => {
    // Set the default values from userInfo
    if (userInfo) {
      if (userInfo.firstName) setValue('firstName', userInfo.firstName);
      if (userInfo.lastName) setValue('lastName', userInfo.lastName);
      if (userInfo.email) setValue('email', userInfo.email);
    }
  }, [userInfo, setValue]);

  return (
    <>
      <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
        <StoreFormHeading heading='Contact Info' />
        <TextInput
          label='First Name'
          id='firstName'
          name='firstName'
          register={register}
          errors={errors}
          type='text'
          // disabled
        />
        <TextInput
          label='Last Name'
          id='lastName'
          name='lastName'
          register={register}
          errors={errors}
          type='text'
          // disabled
        />
        <TextInput
          label='Email'
          id='email'
          name='email'
          register={register}
          errors={errors}
          type='email'
          // disabled
        />
        <TextInput
          label='Phone'
          id='phone'
          name='phone'
          register={register}
          errors={errors}
          type='tel'
          // disabled
        />
        <DropdownInput
          label='Country of Citizenship'
          id='citizenshipCountry'
          name='citizenshipCountry'
          options={countryOptions}
          register={register}
          errors={errors}
        />
        <DropdownInput
          label='Country of Birth'
          id='birthCountry'
          name='birthCountry'
          options={countryOptions}
          register={register}
          errors={errors}
        />
        <TextInput
          label='Date of Birth'
          id='dob'
          name='dob'
          register={register}
          errors={errors}
          type='date'
        />
        <StoreFormHeading heading='Residence Address' />
        <AddressInput
          streetFieldName='residenceStreet'
          cityFieldName='residenceCity'
          stateFieldName='residenceState'
          countryFieldName='residenceCountry'
          zipCodeFieldName='residenceZipCode'
          register={register}
          errors={errors}
          control={control}
        />
      </div>
    </>
  );
};

export default PrimaryContactInput;
