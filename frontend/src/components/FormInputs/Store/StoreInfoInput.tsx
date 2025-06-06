import { useEffect, useState } from 'react';
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import AddressInput from '../AddressInput';
import CloudinaryImageUpload from '../CloudinaryImageUpload';
import DropdownInput from '../DropdownInput';
import TextAreaInput from '../TextAreaInput';
import TextInput from '../TextInput';
import StoreFormHeading from './StoreFormHeading';

interface StoreInfoInputProps {
  errors: FieldErrors;
  defaultValue?: string;
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  control: Control<FieldValues>;
}

const StoreInfoInput = ({
  register,
  setValue,
  errors,
  control,
}: StoreInfoInputProps) => {
  //TODO: check when its no uploaded like in newproductform
  const [storeLogoResource, setStoreLogoResource] = useState<any>(null);
  const selectedStoreTypeValue = useWatch({ control, name: 'storeType' });

  useEffect(() => {
    const selectedStoreType = localStorage.getItem('selectedStoreType') || '';
    setValue('storeType', selectedStoreType, { shouldValidate: true });
  }, [setValue]);

  const storeTypeOptions = [
    { value: '', label: 'Select type' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retail', label: 'Retail' },
  ];

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
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-x-6 px-4 sm:px-6 w-full'>
        <StoreFormHeading heading='Store Info' />
        <DropdownInput
          label='Store Type'
          id='storeType'
          name='storeType'
          value={selectedStoreTypeValue}
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
          zipFieldName='storeZipCode'
          register={register}
          errors={errors}
          control={control}
          setValue={setValue}
        />
      </div>
    </>
  );
};

export default StoreInfoInput;
