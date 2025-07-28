import React, { useEffect } from 'react';
import AddressInput from '../AddressInput';
import DropdownInput from '../DropdownInput';
import TextInput from '../TextInput';
import countries from '@/pages/data/countries.json';
import {
  Control,
  FieldErrors,
  useForm,
  UseFormRegister,
} from 'react-hook-form';
import StoreFormHeading from './StoreFormHeading';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';
import { User, Mail, Phone, MapPin, Calendar, Globe } from 'lucide-react';
import { StoreApplicationFormData } from '@/types/storeApplication';

interface PrimaryContactInputProps {
  errors: FieldErrors<StoreApplicationFormData>;
  defaultValue?: string;
  register: UseFormRegister<StoreApplicationFormData>;
  setValue: (name: keyof StoreApplicationFormData, value: string) => void;
  control: Control<StoreApplicationFormData>;
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
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-x-6 px-4 sm:px-6 w-full'>
      <StoreFormHeading heading='Contact Info' />
      <TextInput
        label='First Name'
        id='firstName'
        name='firstName'
        register={register as any}
        errors={errors as any}
        type='text'
        className='col-span-1'
      />
      <TextInput
        label='Last Name'
        id='lastName'
        name='lastName'
        register={register as any}
        errors={errors as any}
        type='text'
        className='col-span-1'
      />
      <TextInput
        label='Email'
        id='email'
        name='email'
        register={register as any}
        errors={errors as any}
        type='email'
        // disabled
      />
      <TextInput
        label='Phone'
        id='phone'
        name='phone'
        register={register as any}
        errors={errors as any}
        type='tel'
        // disabled
      />
      <DropdownInput
        label='Country of Citizenship'
        id='citizenshipCountry'
        name='citizenshipCountry'
        options={countryOptions}
        register={register as any}
        errors={errors as any}
      />
      {/* <DropdownInput
        label='Country of Birth'
        id='birthCountry'
        name='birthCountry'
        options={countryOptions}
        register={register}
        errors={errors}
      /> */}
      <TextInput
        label='Date of Birth'
        id='dob'
        name='dob'
        register={register as any}
        errors={errors as any}
        type='date'
      />
      <StoreFormHeading heading='Residence Address' />
      <AddressInput
        streetFieldName='residenceStreet'
        cityFieldName='residenceCity'
        stateFieldName='residenceState'
        countryFieldName='residenceCountry'
        zipFieldName='residenceZipCode'
        register={register as any}
        errors={errors as any}
        control={control as any}
        setValue={setValue as any}
      />
    </div>
  );
};

export default PrimaryContactInput;
