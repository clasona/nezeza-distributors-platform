import ErrorMessageModal from '@/components/ErrorMessageModal';
import DropdownInput from '@/components/FormInputs/DropdownInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { stateProps } from '../../type';

const StoreTypeChoose = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const { userInfo } = useSelector((state: stateProps) => state.next);

  const storeTypeOptions = [
    { value: '', label: 'Select' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retail', label: 'Retail' },
  ];

  const onSubmit = async (data: any) => {
    if (!data.selectedStoreType) {
      setErrorMessage('Please select a store type.');
      return;
    }
    setErrorMessage('');
    router.push('/store-register');

    // Handle the form submission logic here
  };

  return (
    <div className='w-full flex flex-col flex-grow bg-nezeza_gray_200 gap-2 items-center justify-center py-20'>
      <p className='text-xl text-nezeza_gray_600'>
        Choose store type to create
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='w-full max-w-md bg-white p-6 rounded-lg shadow-lg'
      >
        <DropdownInput
          label='Select Store Type'
          id='selectedStoreType'
          name='selectedStoreType'
          options={storeTypeOptions}
          register={register}
          errors={errors}
        />

        <div className='flex items-center justify-center'>
          {successMessage && (
            <SuccessMessageModal successMessage={successMessage} />
          )}
          {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
          <SubmitButton
            isLoading={false}
            buttonTitle='Continue to store register'
            loadingButtonTitle='Taking you to store register...'
          />
        </div>
      </form>
    </div>
  );
};

StoreTypeChoose.noLayout = true;
export default StoreTypeChoose;
