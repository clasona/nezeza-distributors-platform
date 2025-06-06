import Button from '@/components/FormInputs/Button';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import { useState } from 'react';

const SelectStoreType = () => {
  const [storeType, setStoreType] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const handleStoreTypeChange = (
    value: { value: string; label: string } | null
  ) => {
    if (value) {
      setStoreType(value);
      localStorage.setItem('selectedStoreType', value.value.toString());
    }
  };

  const storeTypeOptions = [
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retail', label: 'Retail' },
  ];

  return (
    <div className='w-screen h-screen flex flex-col bg-nezeza_powder_blue gap-2 items-center justify-center py-20 px-4 sm:px-6'>
      <h1 className='text-2xl text-center font-bold text-nezeza_gray_800'>
        Welcome to Nezeza Platform
      </h1>
      <p className='text-md text-nezeza_gray_600 mb-8'>
        Let's get started with your store application!
      </p>

      <DropdownInputSearchable
        id='store-type-select'
        name='store-type-select'
        label='Select store type'
        options={storeTypeOptions}
        onChange={handleStoreTypeChange}
        value={storeType}
        className='w-full max-w-xs sm:max-w-md text-center font-semibold'
      />

      <div className='flex items-center justify-center w-full'>
        <Button
          buttonTitle='Continue'
          loadingButtonTitle='Continuing...'
          className='space-x-3 mt-4 px-6 py-2 text-white bg-nezeza_dark_blue hover:bg-nezeza_green_800'
          onClick={() => (window.location.href = '/store-application')}
        />
      </div>
    </div>
  );
};

SelectStoreType.noLayout = true;
export default SelectStoreType;
