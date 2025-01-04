import React, { useState } from 'react';
import AddressInput from '../AddressInput';
import DropdownInput from '../DropdownInput';
import TextInput from '../TextInput';
import countries from '@/pages/data/countries.json';
import {
  FieldErrors,
  FieldValues,
  UseFormRegister,
  Control,
} from 'react-hook-form';
import TextAreaInput from '../TextAreaInput';
import CloudinaryImageUpload from '../../FormInputs/CloudinaryImageUpload';
import StoreFormHeading from './StoreFormHeading';

interface BusinessInfoInputProps {
  errors: FieldErrors;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
}

const BusinessInfoInput = ({
  register,
  errors,
  control,
}: BusinessInfoInputProps) => {
  //TODO: check when its no uploaded like in newproductform
  const [businessLogoResource, setBusinessLogoResource] = useState<any>(null);

  const businessTypeOptions = [
    { value: '', label: 'Select type' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retail', label: 'Retail' },
  ];

  // TODO: when other selected show field to enter other category name
  const businessCategoryOptions = [
    { value: '', label: 'Select category' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'electronics', label: 'Electronics' },

    { value: 'services', label: 'Professional Services' },
    { value: 'other', label: 'Other' },
    // ... more categories
  ];

  return (
    <>
      <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
        <StoreFormHeading heading='Business Info' />
        <DropdownInput
          label='Business Type'
          id='businessType'
          name='businessType'
          options={businessTypeOptions}
          register={register}
          errors={errors}
        />
        <TextInput
          label='Business Registration Number'
          id='businessRegistrationNumber'
          name='businessRegistrationNumber'
          register={register}
          errors={errors}
          type='number'
        />
        <TextInput
          label='Business Name'
          id='storeName'
          name='storeName'
          register={register}
          errors={errors}
          type='text'
        />
        <DropdownInput
          label='Business Category'
          id='businessCategory'
          name='businessCategory'
          options={businessCategoryOptions}
          register={register}
          errors={errors}
        />
        <TextAreaInput
          label='Business Description'
          id='businessDescription'
          name='businessDescription'
          register={register}
          errors={errors}
          type='text'
          className='sm:col-span-2'
        />
        <TextInput
          label='Business Email'
          id='businessEmail'
          name='businessEmail'
          register={register}
          errors={errors}
          type='email'
        />
        <TextInput
          label='Business Phone'
          id='businessPhone'
          name='businessPhone'
          register={register}
          errors={errors}
          type='tel'
        />
        {/*Business logo */}
        <CloudinaryImageUpload
          label='Business Logo'
          className='sm:col-span-2' //span full row
          onResourceChange={setBusinessLogoResource} // Set mainImageResource on upload success
        />
        <StoreFormHeading heading='Business Address' />
        <AddressInput
          streetFieldName='businessStreet'
          cityFieldName='businessCity'
          stateFieldName='businessState'
          countryFieldName='businessCountry'
          zipcodeFieldName='businessZipcode'
          register={register}
          errors={errors}
          control={control}
        />
      </div>
    </>
  );
};

export default BusinessInfoInput;
