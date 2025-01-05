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
import CloudinaryImageUpload from '../CloudinaryImageUpload';
import StoreFormHeading from './StoreFormHeading';

interface StoreInfoInputProps {
  errors: FieldErrors;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
}

const StoreInfoInput = ({ register, errors, control }: StoreInfoInputProps) => {
  //TODO: check when its no uploaded like in newproductform
  const [storeLogoResource, setStoreLogoResource] = useState<any>(null);

  const storeTypeOptions = [
    { value: '', label: 'Select type' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retail', label: 'Retail' },
  ];

  // TODO: when other selected show field to enter other category name
  const storeCategoryOptions = [
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
        <StoreFormHeading heading='Store Info' />
        <DropdownInput
          label='Store Type'
          id='storeType'
          name='storeType'
          options={storeTypeOptions}
          register={register}
          errors={errors}
        />
        <TextInput
          label='Store Registration Number'
          id='storeRegistrationNumber'
          name='storeRegistrationNumber'
          register={register}
          errors={errors}
          type='number'
        />
        <TextInput
          label='Store Name'
          id='storeName'
          name='storeName'
          register={register}
          errors={errors}
          type='text'
        />
        <DropdownInput
          label='Store Category'
          id='storeCategory'
          name='storeCategory'
          options={storeCategoryOptions}
          register={register}
          errors={errors}
        />
        <TextAreaInput
          label='Store Description'
          id='storeDescription'
          name='storeDescription'
          register={register}
          errors={errors}
          type='text'
          className='sm:col-span-2'
        />
        <TextInput
          label='Store Email'
          id='storeEmail'
          name='storeEmail'
          register={register}
          errors={errors}
          type='email'
        />
        <TextInput
          label='Store Phone'
          id='storePhone'
          name='storePhone'
          register={register}
          errors={errors}
          type='tel'
        />
        {/*Store logo */}
        <CloudinaryImageUpload
          label='Store Logo'
          className='sm:col-span-2' //span full row
          onResourceChange={setStoreLogoResource} // Set mainImageResource on upload success
        />
        <StoreFormHeading heading='Store Address' />
        <AddressInput
          streetFieldName='storeStreet'
          cityFieldName='storeCity'
          stateFieldName='storeState'
          countryFieldName='storeCountry'
          zipCodeFieldName='storeZipCode'
          register={register}
          errors={errors}
          control={control}
        />
      </div>
    </>
  );
};

export default StoreInfoInput;
